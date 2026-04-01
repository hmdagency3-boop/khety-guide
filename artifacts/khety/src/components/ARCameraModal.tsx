/**
 * ARCameraModal — Point-and-Reveal AR overlay
 *
 * After scanning, the info label sits fixed at the scanning-frame centre
 * (screen centre). The user aims the camera at the artifact to reveal the
 * label — exactly how Google Arts & Culture and major museum AR apps work.
 *
 * Orientation is used only to hide the label when the camera drifts far from
 * the original scan direction (fallback: label stays visible if no sensors).
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scan, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  userId: string;
  language?: string;
  initialStream?: MediaStream | null;
  onClose: () => void;
}

function normAngle(d: number) {
  while (d > 180)  d -= 360;
  while (d < -180) d += 360;
  return d;
}

export function ARCameraModal({ userId, language = "en", initialStream = null, onClose }: Props) {
  /* ── DOM refs (RAF-only, React never sets style on these) ─── */
  const videoRef   = useRef<HTMLVideoElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  /* ── Sensor refs ─────────────────────────────────────────── */
  const headingRef       = useRef<number | null>(null); // null = no sensor data
  const anchorHeadingRef = useRef<number | null>(null);

  /* ── Misc refs ───────────────────────────────────────────── */
  const rafRef   = useRef<number>(0);
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const showRef  = useRef(false); // true = RAF should show overlay

  /* ── React state (content only) ─────────────────────────── */
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning,    setScanning]    = useState(false);
  const [hasResult,   setHasResult]   = useState(false);
  const [landmark,    setLandmark]    = useState<string | null>(null);
  const [lines,       setLines]       = useState<string[]>([]);
  const [error,       setError]       = useState<string | null>(null);

  const CX = window.innerWidth  / 2;
  const CY = window.innerHeight / 2;
  const ar = language === "ar";

  const txt = {
    title:        ar ? "𓂀 ماسح AR" : "𓂀 AR Scanner",
    scanIdle:     ar ? "وجّه الكاميرا على الأثر ثم اضغط المسح" : "Centre the artifact in the frame · Tap scan",
    scanAnalyzing:ar ? "جارٍ التحليل…" : "Analyzing…",
    scanReady:    ar ? "وجّه الكاميرا على الأثر لعرض المعلومات" : "Aim at the artifact to reveal info",
    camLoading:   ar ? "جارٍ تشغيل الكاميرا…" : "Starting camera…",
    btnAnalyzing: ar ? "جارٍ تحليل الأثر…" : "Analyzing artifact…",
    btnReady:     ar ? "مسح مجدداً أو إغلاق" : "Scan again or close",
    btnIdle:      ar ? "اضغط للمسح" : "Tap to scan",
    reAim:        ar ? "وجّه الكاميرا مجدداً على الأثر لعرض المعلومات" : "Point the camera back at the artifact to see the label",
    camError:     ar ? "لا يمكن الوصول للكاميرا.\nتأكد من منح الإذن." : "Cannot access camera.\nPlease grant permission.",
    close:        ar ? "إغلاق" : "Close",
  };

  /* ── 1. Perpetual RAF — controls overlay opacity only ────── */
  useEffect(() => {
    const tick = () => {
      if (overlayRef.current) {
        let opacity = 0;

        if (showRef.current) {
          const curr   = headingRef.current;
          const anchor = anchorHeadingRef.current;

          if (curr === null || anchor === null) {
            // No sensor data — keep fully visible so the feature still works
            opacity = 1;
          } else {
            const delta = Math.abs(normAngle(curr - anchor));
            // Full opacity within 20°, fades to zero at 45°
            opacity = Math.max(0, 1 - Math.max(0, delta - 20) / 25);
          }
        }

        overlayRef.current.style.opacity = String(opacity);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── 2. Camera + compass setup ───────────────────────────── */
  useEffect(() => {
    let alive  = true;
    // If a stream was obtained in the user-gesture (click handler), use it
    // directly so iOS Safari doesn't need a second getUserMedia call.
    let stream: MediaStream | null = initialStream ?? null;

    const onOrient = (e: DeviceOrientationEvent) => {
      const ext = e as any;
      headingRef.current =
        typeof ext.webkitCompassHeading === "number" && ext.webkitCompassHeading >= 0
          ? ext.webkitCompassHeading
          : (e.alpha ?? headingRef.current ?? 0);
    };

    (async () => {
      try {
        const D = DeviceOrientationEvent as any;
        if (typeof D.requestPermission === "function") await D.requestPermission();
      } catch {}
      window.addEventListener("deviceorientationabsolute", onOrient as EventListener, true);
      window.addEventListener("deviceorientation",         onOrient as EventListener, true);

      try {
        if (!stream) {
          // No pre-obtained stream — request camera now (only works reliably if
          // permission was already granted in a previous session).
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: false,
          });
        }
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (alive) setCameraReady(true);
        }
      } catch {
        if (alive) setError(txt.camError);
      }
    })();

    return () => {
      alive = false;
      stream?.getTracks().forEach(t => t.stop());
      window.removeEventListener("deviceorientationabsolute", onOrient as EventListener, true);
      window.removeEventListener("deviceorientation",         onOrient as EventListener, true);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── 3. Capture + AI ──────────────────────────────────────── */
  const captureAndAnalyze = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;

    anchorHeadingRef.current = headingRef.current;
    showRef.current = false;

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    setScanning(true);
    setHasResult(false);
    setLines([]);
    setLandmark(null);

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", 0.85));
    let imageUrl: string | null = null;
    if (blob) {
      const path = `${userId}/${Date.now()}-ar.jpg`;
      const { error: upErr } = await supabase.storage
        .from("chat-images").upload(path, blob, { contentType: "image/jpeg" });
      if (!upErr)
        imageUrl = supabase.storage.from("chat-images").getPublicUrl(path).data.publicUrl;
    }

    const isArabic = language === "ar";
    const prompt = isArabic
      ? `[AR Scan] أنت خبير في علم المصريات. حدد الأثر أو المعلم أو المبنى المصري الموجود في هذه الصورة. ` +
        `أجب فقط بـ JSON صحيح بدون أي نص إضافي:\n` +
        `{"name":"<الاسم بالعربية>","period":"<الحقبة التاريخية>","fact":"<معلومة مثيرة في جملة واحدة>","desc":"<وصف في جملة أو جملتين>"}` +
        (imageUrl ? `\n[Image: ${imageUrl}]` : "")
      : `[AR Scan] You are an expert Egyptologist. Identify the Egyptian artifact, monument, or landmark in this image. ` +
        `Reply ONLY as valid JSON with no markdown:\n` +
        `{"name":"<English name>","period":"<historical era>","fact":"<one fascinating sentence>","desc":"<1-2 sentences>"}` +
        (imageUrl ? `\n[Image: ${imageUrl}]` : "");

    const { data: msg } = await supabase
      .from("chat_messages")
      .insert({ user_id: userId, prompt, image_url: imageUrl, status: "pending" })
      .select("id").single();

    if (!msg) { setScanning(false); return; }

    let tries = 0;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      tries++;
      const { data } = await supabase
        .from("chat_messages").select("response, status").eq("id", msg.id).single();

      if (data?.status === "completed" && data.response) {
        if (pollRef.current) clearInterval(pollRef.current);

        let name = "";
        let result: string[] = [data.response];
        try {
          const raw = data.response.trim();
          const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
          if (s !== -1 && e !== -1) {
            const p = JSON.parse(raw.slice(s, e + 1));
            name   = p.name ?? "";
            result = [p.desc, p.period ? `📅 ${p.period}` : "", p.fact ? `✦ ${p.fact}` : ""].filter(Boolean);
          }
        } catch {}

        // Position overlay at screen centre before enabling
        if (overlayRef.current) {
          overlayRef.current.style.transform =
            `translate(calc(${CX}px - 50%), calc(${CY}px - 100% - 18px))`;
        }

        showRef.current = true;
        setLandmark(name || null);
        setLines(result);
        setScanning(false);
        setHasResult(true);

      } else if (tries >= 30) {
        if (pollRef.current) clearInterval(pollRef.current);
        setScanning(false);
      }
    }, 2000);
  }, [scanning, userId, CX, CY]);

  const resetScan = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    showRef.current = false;
    setHasResult(false);
    setLines([]);
    setLandmark(null);
    setScanning(false);
  }, []);

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">

      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Subtle vignette */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background: "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.42) 100%)" }} />

      {/* ═══════════════════════════════════════════════════
          AR LABEL — fixed at scanning-frame centre.
          Opacity is the ONLY thing the RAF controls.
          Transform is set once when result arrives.
          React never touches style on this element.
          ═══════════════════════════════════════════════════ */}
      <div
        ref={overlayRef}
        className="absolute top-0 left-0 pointer-events-none flex flex-col items-center"
        style={{
          willChange: "opacity",
          opacity: 0,
          // Initial position — RAF will not move this, only change opacity
          transform: `translate(calc(${CX}px - 50%), calc(${CY}px - 100% - 18px))`,
        }}
      >
        {/* Info card */}
        <div
          className="rounded-2xl px-4 py-3.5 shadow-2xl"
          style={{
            maxWidth: 248,
            background: "rgba(3,3,3,0.84)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(202,163,84,0.52)",
            boxShadow: "0 0 36px rgba(202,163,84,0.18), 0 16px 48px rgba(0,0,0,0.72)",
          }}
        >
          {/* Badge row */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[10px] text-primary/65 font-mono font-black tracking-[0.2em]">AR</span>
            <div className="flex-1 h-px bg-primary/18" />
            <span className="text-[8.5px] text-primary/35 font-mono">
              <span className="animate-pulse">●</span> LIVE
            </span>
          </div>
          {/* Landmark name */}
          {landmark && (
            <p className="text-primary font-display font-bold text-[13.5px] leading-snug mb-2.5">
              𓂀 {landmark}
            </p>
          )}
          {/* Description lines */}
          {lines.map((line, i) => (
            <p key={i} style={{
              fontSize:   i === 0 ? 12   : 10.5,
              lineHeight: 1.65,
              color:      i === 0 ? "rgba(255,255,255,0.88)" : "rgba(255,255,255,0.48)",
              marginTop:  i > 0 ? 5 : 0,
            }}>
              {line}
            </p>
          ))}
        </div>

        {/* Connector */}
        <div style={{
          width: 1, height: 22,
          background: "linear-gradient(to bottom, rgba(202,163,84,0.6), rgba(202,163,84,0.08))",
        }} />

        {/* Diamond anchor */}
        <div style={{
          width: 10, height: 10,
          transform: "rotate(45deg)",
          background: "#CAA354",
          marginTop: -5,
          boxShadow: "0 0 12px 4px rgba(202,163,84,0.58)",
        }} />
      </div>

      {/* ── Scanning frame — centred, always shown when idle ── */}
      {!hasResult && !scanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-52 h-52">
            {/* Corner brackets */}
            {(["tl","tr","bl","br"] as const).map(c => (
              <div key={c} className="absolute w-7 h-7" style={{
                ...(c==="tl" ? { top:0,    left:0,  borderTop:"2.5px solid #CAA354", borderLeft:"2.5px solid #CAA354",    borderRadius:"6px 0 0 0" } : {}),
                ...(c==="tr" ? { top:0,    right:0, borderTop:"2.5px solid #CAA354", borderRight:"2.5px solid #CAA354",   borderRadius:"0 6px 0 0" } : {}),
                ...(c==="bl" ? { bottom:0, left:0,  borderBottom:"2.5px solid #CAA354", borderLeft:"2.5px solid #CAA354",  borderRadius:"0 0 0 6px" } : {}),
                ...(c==="br" ? { bottom:0, right:0, borderBottom:"2.5px solid #CAA354", borderRight:"2.5px solid #CAA354", borderRadius:"0 0 6px 0" } : {}),
              }} />
            ))}
            {/* Crosshair */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-5 h-5 relative">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
                     style={{ background: "rgba(202,163,84,0.45)" }} />
                <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2"
                     style={{ background: "rgba(202,163,84,0.45)" }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scanning-line animation */}
      {scanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-52 h-52">
            <motion.div className="absolute left-0 right-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, #CAA354, transparent)",
                boxShadow: "0 0 8px 2px rgba(202,163,84,0.55)",
              }}
              animate={{ top: ["5%", "95%", "5%"] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      )}

      {/* "Re-aim" hint — shows after result so user knows to point back */}
      <AnimatePresence>
        {hasResult && (
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ delay: 1.2 }}
            className="absolute pointer-events-none text-center text-[10.5px] text-white/25"
            style={{ bottom: 162, left: 0, right: 0 }}
          >
            {txt.reAim}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center z-20 px-8">
          <div className="rounded-2xl p-5 text-center"
               style={{ background: "rgba(0,0,0,0.88)", border: "1px solid rgba(255,80,80,0.3)" }}>
            {error.split("\n").map((l, i) => <p key={i} className="text-white/80 text-sm">{l}</p>)}
            <button onClick={onClose} className="mt-4 text-xs text-red-400">{txt.close}</button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 pt-10 pb-4"
           style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.65), transparent)" }}>
        <div>
          <p className="text-white font-display font-bold text-base leading-none tracking-wide">{txt.title}</p>
          <p className="text-white/40 text-[11px] mt-0.5">
            {scanning  ? txt.scanAnalyzing
             : hasResult ? txt.scanReady
             : txt.scanIdle}
          </p>
        </div>
        <button onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 flex flex-col items-center gap-3 pb-10 pt-6"
           style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}>
        {!cameraReady && !error && (
          <p className="text-white/50 text-xs flex items-center gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" /> {txt.camLoading}
          </p>
        )}
        <div className="flex items-center gap-5">
          <AnimatePresence>
            {hasResult && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                onClick={resetScan}
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.55)", border: "1.5px solid rgba(202,163,84,0.4)" }}>
                <RefreshCw className="w-5 h-5 text-primary/80" />
              </motion.button>
            )}
          </AnimatePresence>

          <button onClick={captureAndAnalyze} disabled={scanning || !cameraReady || !!error}
                  className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-35"
                  style={{ background: "rgba(202,163,84,0.18)", border: "3.5px solid #CAA354", backdropFilter: "blur(8px)", boxShadow: "0 0 28px rgba(202,163,84,0.38)" }}>
            {scanning ? <Loader2 className="w-8 h-8 text-primary animate-spin" /> : <Scan className="w-8 h-8 text-primary" />}
            {!scanning && cameraReady && !error && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            )}
          </button>
        </div>
        <p className="text-white/38 text-[11px]">
          {scanning ? txt.btnAnalyzing : hasResult ? txt.btnReady : txt.btnIdle}
        </p>
      </div>
    </div>
  );
}
