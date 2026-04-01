import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useLocation } from "wouter";

const STORAGE_KEY  = "khety_vip_welcome";
const EVENT_NAME   = "khety:vip_welcome";

export interface VipWelcomeData {
  name: string;
  welcome_title: string;
  welcome_msg: string;
  welcome_glyph: string;
}

export function readVipWelcome(): VipWelcomeData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeVipWelcome(data: VipWelcomeData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event so modal picks it up in the same tab immediately
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: data }));
  } catch {}
}

function clearVipWelcome() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// Particle component
function Particle({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) {
  return (
    <motion.div
      className="absolute rounded-full bg-amber-400/60 pointer-events-none"
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      initial={{ opacity: 0, scale: 0, y: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.5], y: -60 }}
      transition={{ duration: 2, delay, repeat: Infinity, repeatDelay: Math.random() * 3 }}
    />
  );
}

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  delay: i * 0.15,
  x: Math.random() * 100,
  y: 40 + Math.random() * 40,
  size: 3 + Math.random() * 5,
}));

export function VipWelcomeModal() {
  const [data, setData]       = useState<VipWelcomeData | null>(null);
  const [visible, setVisible] = useState(false);
  const shownRef              = useRef(false); // prevent double-fire
  const [location]            = useLocation();

  function show(d: VipWelcomeData) {
    if (shownRef.current) return;
    shownRef.current = true;
    setData(d);
    setTimeout(() => setVisible(true), 500);
  }

  // Re-check localStorage on every route change (catches post-registration navigation)
  useEffect(() => {
    if (shownRef.current) return;
    const stored = readVipWelcome();
    if (stored) show(stored);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  // Also listen for same-tab CustomEvent (immediate dispatch from storeVipWelcome)
  useEffect(() => {
    function onEvent(e: Event) {
      const d = (e as CustomEvent<VipWelcomeData>).detail;
      if (d) show(d);
    }
    window.addEventListener(EVENT_NAME, onEvent);
    return () => window.removeEventListener(EVENT_NAME, onEvent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function dismiss() {
    setVisible(false);
    shownRef.current = false;
    setTimeout(clearVipWelcome, 300);
  }

  if (!data) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={dismiss}
          />

          {/* Particles */}
          {PARTICLES.map(p => (
            <Particle key={p.id} {...p} />
          ))}

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm mx-4 mb-8 sm:mb-0 rounded-[2rem] overflow-hidden shadow-2xl shadow-black/60 border border-amber-400/20"
            initial={{ y: 80, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Background layers */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a1f] via-[#150f28] to-[#08060f]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(201,168,76,0.18),transparent)]" />

            {/* Diagonal deco */}
            <div className="absolute inset-0 opacity-[0.025]" style={{
              backgroundImage: "repeating-linear-gradient(55deg,#c9a84c 0,#c9a84c 1px,transparent 1px,transparent 28px)"
            }} />

            {/* Top shimmer */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

            {/* Close */}
            <button
              onClick={dismiss}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-white/50" />
            </button>

            {/* Content */}
            <div className="relative p-8 flex flex-col items-center text-center gap-5">

              {/* Glyph coin */}
              <motion.div
                className="relative"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.2 }}
              >
                <div className="absolute -inset-4 rounded-full bg-amber-400/15 blur-2xl" />
                <div className="relative w-24 h-24 rounded-full border-2 border-amber-400/50 bg-gradient-to-br from-[#1f1600] to-[#0d0a00] flex items-center justify-center shadow-2xl shadow-black/60">
                  <div className="absolute inset-2 rounded-full border border-amber-400/20" />
                  <span className="text-5xl leading-none select-none">{data.welcome_glyph}</span>
                </div>
                <motion.div
                  className="absolute -inset-2 rounded-full border border-dashed border-amber-400/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                />
                {[0, 60, 120, 180, 240, 300].map(deg => (
                  <motion.div
                    key={deg}
                    className="absolute w-1.5 h-1.5 rounded-full bg-amber-400/70"
                    style={{
                      top: "50%", left: "50%",
                      transform: `rotate(${deg}deg) translateX(52px) translateY(-50%)`,
                    }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, delay: deg / 300, repeat: Infinity }}
                  />
                ))}
              </motion.div>

              {/* VIP Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase">عضو مميّز</span>
                <Sparkles className="w-3 h-3 text-amber-400" />
              </motion.div>

              {/* Greeting */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="space-y-2"
              >
                <h2 className="text-2xl font-display font-black text-white leading-tight">
                  {data.welcome_title}
                </h2>
                {data.name && (
                  <p className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                    {data.name}
                  </p>
                )}
              </motion.div>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="text-sm text-white/55 leading-relaxed"
              >
                {data.welcome_msg}
              </motion.p>

              <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent" />

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                whileTap={{ scale: 0.97 }}
                onClick={dismiss}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-black text-sm shadow-lg shadow-amber-500/30"
              >
                ابدأ رحلتك الفرعونية ✦
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
