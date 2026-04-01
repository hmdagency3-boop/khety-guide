/**
 * GoldenAgeModal — "العصر الذهبي"
 *
 * Capture a photo of any Egyptian artifact, then see a rich AI-generated
 * description of how it looked in its golden age — colours, craftsmanship,
 * ritual significance.
 *
 * Flow:
 *   1. Live camera → user frames the artifact
 *   2. Tap the gold button → capture frame + upload to Supabase storage
 *   3. Insert row into chat_messages (request_type = 'golden_age') → poll
 *   4. Parse JSON response → show captured photo + golden age card overlay
 */
import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Loader2, RefreshCw, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Props {
  userId: string;
  language?: string;
  onClose: () => void;
}

type Phase = "idle" | "capturing" | "analyzing" | "result" | "error";

interface GoldenResult {
  name: string;
  period: string;
  colors: string;
  goldenDesc: string;
  restoration: string;
}

export function GoldenAgeModal({ userId, language = "en", onClose }: Props) {
  const videoRef  = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pollRef   = useRef<ReturnType<typeof setInterval> | null>(null);

  const [phase,       setPhase]       = useState<Phase>("idle");
  const [cameraReady, setCameraReady] = useState(false);
  const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
  const [result,      setResult]      = useState<GoldenResult | null>(null);
  const [errorMsg,    setErrorMsg]    = useState("");

  const ar = language === "ar";

  const txt = {
    title:     ar ? "𓂀 العصر الذهبي" : "𓂀 Golden Age",
    subtitle:  ar ? "وجّه الكاميرا على أثر مصري ثم اضغط للتصوير" : "Frame an Egyptian artifact · tap to capture",
    analyzing: ar ? "جارٍ استشراف العصر الذهبي…" : "Glimpsing the golden age…",
    camError:  ar ? "لا يمكن الوصول للكاميرا" : "Cannot access camera",
    aiError:   ar ? "تعذّر تحليل الأثر" : "Could not analyse artifact",
    retake:    ar ? "إعادة التصوير" : "Retake",
    tapCap:    ar ? "اضغط للتصوير" : "Tap to capture",
    processing:ar ? "جارٍ المعالجة…" : "Processing…",
    generating:ar ? "جارٍ الاستشراف…" : "Glimpsing…",
    dragComp:  ar ? "استشراف العصر الذهبي" : "Golden age glimpse",
    colorsLbl: ar ? "الألوان الأصلية" : "Original colours",
    restoreLbl:ar ? "عصره الذهبي" : "In its prime",
  };

  /* ── Camera ─────────────────────────────────────────────────────── */
  useEffect(() => {
    let alive  = true;
    let stream: MediaStream | null = null;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
        if (!alive) { stream.getTracks().forEach(t => t.stop()); return; }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          if (alive) setCameraReady(true);
        }
      } catch {
        if (alive) { setPhase("error"); setErrorMsg(txt.camError); }
      }
    })();

    return () => {
      alive = false;
      stream?.getTracks().forEach(t => t.stop());
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Capture → upload → insert → poll ───────────────────────────── */
  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !cameraReady || phase !== "idle") return;

    setPhase("capturing");

    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth  || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, "image/jpeg", 0.9));
    if (!blob) { setPhase("error"); setErrorMsg(txt.aiError); return; }

    setCapturedUrl(URL.createObjectURL(blob));

    const path = `${userId}/${Date.now()}-golden.jpg`;
    const { error: upErr } = await supabase.storage
      .from("chat-images")
      .upload(path, blob, { contentType: "image/jpeg" });

    if (upErr) { setPhase("error"); setErrorMsg(txt.aiError); return; }

    const imageUrl = supabase.storage.from("chat-images").getPublicUrl(path).data.publicUrl;

    const prompt = ar
      ? `[العصر الذهبي] أنت خبير في علم المصريات والترميم الأثري. ادرس الأثر أو المعلم المصري في هذه الصورة.\n` +
        `أجب فقط بـ JSON صحيح بدون أي نص إضافي:\n` +
        `{"name":"<الاسم بالعربية>","period":"<الحقبة التاريخية>","colors":"<الألوان والمواد الأصلية في جملة>","goldenDesc":"<صف مظهره في ذروة مجده في 2-3 جمل>","restoration":"<جملة واحدة تصف سر روعته>"}` +
        `\n[Image: ${imageUrl}]`
      : `[Golden Age] You are an expert Egyptologist and art restoration specialist. Study the Egyptian artifact or monument in this image.\n` +
        `Reply ONLY as valid JSON with no markdown:\n` +
        `{"name":"<English name>","period":"<historical era>","colors":"<original colours and materials in one sentence>","goldenDesc":"<2-3 sentences describing its appearance at peak glory>","restoration":"<one sentence on what made it magnificent>"}` +
        `\n[Image: ${imageUrl}]`;

    setPhase("analyzing");

    const { data: msg } = await supabase
      .from("chat_messages")
      .insert({ user_id: userId, prompt, image_url: imageUrl, status: "pending" })
      .select("id").single();

    if (!msg) { setPhase("error"); setErrorMsg(txt.aiError); return; }

    let tries = 0;
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      tries++;
      const { data } = await supabase
        .from("chat_messages").select("response, status").eq("id", msg.id).single();

      if (data?.status === "completed" && data.response) {
        if (pollRef.current) clearInterval(pollRef.current);

        let parsed: GoldenResult | null = null;
        try {
          const raw = data.response.trim();
          const s = raw.indexOf("{"), e = raw.lastIndexOf("}");
          if (s !== -1 && e !== -1) parsed = JSON.parse(raw.slice(s, e + 1));
        } catch {}

        if (parsed) {
          setResult(parsed);
          setPhase("result");
        } else {
          setPhase("error");
          setErrorMsg(txt.aiError);
        }
      } else if (tries >= 30) {
        if (pollRef.current) clearInterval(pollRef.current);
        setPhase("error");
        setErrorMsg(txt.aiError);
      }
    }, 2000);
  }, [cameraReady, phase, userId, ar, txt.aiError, txt.camError]);

  const retake = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    setCapturedUrl(null);
    setResult(null);
    setPhase("idle");
  }, []);

  /* ── Render ──────────────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">

      {/* Top bar */}
      <div className="shrink-0 flex items-center justify-between px-4 pt-10 pb-3 z-20"
           style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)" }}>
        <div>
          <p className="text-white font-display font-bold text-base leading-none tracking-wide">{txt.title}</p>
          <p className="text-white/40 text-[11px] mt-0.5">
            {phase === "result"   ? (result?.name ?? txt.dragComp)
             : phase === "analyzing" ? txt.analyzing
             : txt.subtitle}
          </p>
        </div>
        <button onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.15)" }}>
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 relative overflow-hidden">

        {/* ── CAMERA (idle / capturing) ──────────────────── */}
        {(phase === "idle" || phase === "capturing") && (
          <>
            <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-72 h-72">
                {(["tl","tr","bl","br"] as const).map(c => (
                  <div key={c} className="absolute w-8 h-8" style={{
                    ...(c==="tl" ? { top:0, left:0,  borderTop:"2.5px solid #CAA354", borderLeft:"2.5px solid #CAA354",    borderRadius:"6px 0 0 0" } : {}),
                    ...(c==="tr" ? { top:0, right:0, borderTop:"2.5px solid #CAA354", borderRight:"2.5px solid #CAA354",   borderRadius:"0 6px 0 0" } : {}),
                    ...(c==="bl" ? { bottom:0, left:0,  borderBottom:"2.5px solid #CAA354", borderLeft:"2.5px solid #CAA354",  borderRadius:"0 0 0 6px" } : {}),
                    ...(c==="br" ? { bottom:0, right:0, borderBottom:"2.5px solid #CAA354", borderRight:"2.5px solid #CAA354", borderRadius:"0 0 6px 0" } : {}),
                  }} />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── ANALYZING ──────────────────────────────────── */}
        <AnimatePresence>
          {phase === "analyzing" && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(0,0,0,0.9)" }}
            >
              {capturedUrl && (
                <img src={capturedUrl} alt="captured"
                     className="absolute inset-0 w-full h-full object-cover opacity-15" />
              )}
              <div className="relative z-10 flex flex-col items-center gap-5 px-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                       style={{ background: "rgba(202,163,84,0.12)", border: "2px solid rgba(202,163,84,0.5)" }}>
                    𓂀
                  </div>
                  <motion.div className="absolute inset-0 rounded-full"
                    style={{ border: "2px solid rgba(202,163,84,0.4)" }}
                    animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.8, repeat: Infinity }} />
                </div>
                <div className="text-center">
                  <p className="text-primary font-display font-bold text-lg mb-1">{txt.analyzing}</p>
                  <motion.div className="flex items-center gap-2 justify-center mt-3"
                    animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.6, repeat: Infinity }}>
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <p className="text-white/50 text-xs">
                      {ar ? "يتواصل الكيان مع الماضي…" : "Communing with the past…"}
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── RESULT ─────────────────────────────────────── */}
        <AnimatePresence>
          {phase === "result" && capturedUrl && result && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 flex flex-col"
            >
              {/* Photo background (dimmed) */}
              <img src={capturedUrl} alt="artifact"
                   className="absolute inset-0 w-full h-full object-cover"
                   style={{ filter: "brightness(0.35) saturate(0.7)" }} />

              {/* Golden shimmer overlay */}
              <div className="absolute inset-0 pointer-events-none"
                   style={{ background: "radial-gradient(ellipse at 50% 60%, rgba(202,163,84,0.10) 0%, transparent 70%)" }} />

              {/* Content: centred glyph + bottom card */}
              <div className="absolute inset-0 flex flex-col items-center justify-end pb-32 px-5 z-10">

                {/* Floating glyph */}
                <motion.div className="mb-4 text-3xl"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
                  𓂀
                </motion.div>

                {/* Info card */}
                <div className="w-full rounded-3xl px-5 py-5"
                     style={{
                       background: "rgba(5,5,5,0.82)",
                       backdropFilter: "blur(28px)",
                       WebkitBackdropFilter: "blur(28px)",
                       border: "1px solid rgba(202,163,84,0.45)",
                       boxShadow: "0 0 40px rgba(202,163,84,0.15), 0 20px 60px rgba(0,0,0,0.7)",
                     }}>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <p className="text-primary font-display font-bold text-[15px] leading-snug">
                        𓂀 {result.name}
                      </p>
                      {result.period && (
                        <p className="text-white/40 text-[11px] mt-0.5">📅 {result.period}</p>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full"
                         style={{ background: "rgba(202,163,84,0.15)", border: "1px solid rgba(202,163,84,0.35)" }}>
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-primary text-[10px] font-bold">{ar ? "الذهبي" : "Golden"}</span>
                    </div>
                  </div>

                  <div className="h-px mb-3" style={{ background: "rgba(202,163,84,0.18)" }} />

                  {/* Golden desc */}
                  {result.goldenDesc && (
                    <p className="text-white/80 text-[12.5px] leading-[1.65] mb-3">{result.goldenDesc}</p>
                  )}

                  {/* Colors row */}
                  {result.colors && (
                    <div className="flex items-start gap-2 mb-2.5">
                      <span className="text-primary/50 text-[10px] font-bold uppercase tracking-widest shrink-0 pt-0.5">
                        {txt.colorsLbl}
                      </span>
                      <p className="text-white/50 text-[11px] leading-relaxed">{result.colors}</p>
                    </div>
                  )}

                  {/* Restoration line */}
                  {result.restoration && (
                    <div className="mt-2 px-3 py-2 rounded-xl"
                         style={{ background: "rgba(202,163,84,0.08)", border: "1px solid rgba(202,163,84,0.18)" }}>
                      <p className="text-primary/70 text-[11px] italic leading-relaxed">✦ {result.restoration}</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── ERROR ──────────────────────────────────────── */}
        {phase === "error" && (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ background: "rgba(0,0,0,0.92)" }}>
            <div className="text-center px-8">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-white/80 text-sm mb-6">{errorMsg}</p>
              <button onClick={retake}
                      className="px-5 py-2 rounded-xl text-sm font-medium"
                      style={{ background: "rgba(202,163,84,0.18)", border: "1px solid rgba(202,163,84,0.45)", color: "#CAA354" }}>
                {txt.retake}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Bottom controls */}
      <div className="shrink-0 flex flex-col items-center gap-3 pb-10 pt-5 z-20"
           style={{ background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)" }}>

        {phase === "result" ? (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={retake}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium"
            style={{ background: "rgba(202,163,84,0.15)", border: "1.5px solid rgba(202,163,84,0.45)", color: "#CAA354" }}>
            <RefreshCw className="w-4 h-4" />
            {txt.retake}
          </motion.button>
        ) : phase === "idle" ? (
          <button
            onClick={capture}
            disabled={!cameraReady}
            className="relative w-20 h-20 rounded-full flex items-center justify-center active:scale-95 transition-transform disabled:opacity-35"
            style={{ background: "rgba(202,163,84,0.18)", border: "3.5px solid #CAA354", backdropFilter: "blur(8px)", boxShadow: "0 0 28px rgba(202,163,84,0.38)" }}>
            <Camera className="w-8 h-8 text-primary" />
            {cameraReady && (
              <span className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" />
            )}
          </button>
        ) : (
          <div className="w-20 h-20 rounded-full flex items-center justify-center"
               style={{ background: "rgba(202,163,84,0.08)", border: "3.5px solid rgba(202,163,84,0.3)" }}>
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        <p className="text-white/35 text-[11px]">
          {phase === "idle"       ? txt.tapCap
           : phase === "capturing"  ? txt.processing
           : phase === "analyzing"  ? txt.generating
           : phase === "result"     ? txt.dragComp
           : ""}
        </p>
      </div>
    </div>
  );
}
