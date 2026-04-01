import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const LS_PREFIX = "khety_splash_";

type WelcomeMedia = {
  id: string;
  media_url: string;
  media_type: "image" | "video";
  duration: number;
  is_active: boolean;
  display_mode: "first_time" | "always";
};

export function WelcomeSplash() {
  const [media, setMedia] = useState<WelcomeMedia | null>(null);
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    supabase
      .from("welcome_media")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const m = data as WelcomeMedia;

        // If "first_time" mode: only show if this specific media hasn't been seen
        if (m.display_mode === "first_time") {
          if (localStorage.getItem(LS_PREFIX + m.id)) return;
        }
        // "always" mode: show every time, no localStorage check

        setMedia(m);
        setVisible(true);
      });
  }, []);

  const dismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setVisible(false);
    // Only save to localStorage for first_time mode
    if (media?.display_mode === "first_time") {
      localStorage.setItem(LS_PREFIX + media.id, "1");
    }
  };

  useEffect(() => {
    if (!visible || !media) return;

    if (media.media_type === "image") {
      const total = (media.duration || 5) * 1000;
      const step = 100;
      let elapsed = 0;
      timerRef.current = setInterval(() => {
        elapsed += step;
        setProgress(Math.min((elapsed / total) * 100, 100));
        if (elapsed >= total) dismiss();
      }, step);
    }

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [visible, media]);

  const handleVideoEnded = () => dismiss();

  return (
    <AnimatePresence>
      {visible && media && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center"
        >
          {media.media_type === "video" ? (
            <video
              ref={videoRef}
              src={media.media_url}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={false}
              onEnded={handleVideoEnded}
              onError={dismiss}
            />
          ) : (
            <img
              src={media.media_url}
              alt="Welcome"
              className="w-full h-full object-cover"
              onError={dismiss}
            />
          )}

          {/* Progress bar (image only) */}
          {media.media_type === "image" && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div
                className="h-full bg-primary transition-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Mode badge */}
          <div className="absolute top-10 left-4">
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
              media.display_mode === "always"
                ? "bg-primary/80 text-black border-primary/40"
                : "bg-black/50 text-white/70 border-white/20"
            }`}>
              {media.display_mode === "always" ? "📢 إعلان دائم" : "👋 ترحيب"}
            </span>
          </div>

          {/* Skip button */}
          <button
            onClick={dismiss}
            className="absolute top-10 right-4 bg-black/50 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/20 hover:bg-black/70 transition-colors"
          >
            تخطى ←
          </button>

          {/* Branding */}
          <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
            <p className="text-primary font-display font-bold text-lg drop-shadow-lg">خيتي</p>
            <p className="text-white/60 text-xs">رفيق كيميت</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
