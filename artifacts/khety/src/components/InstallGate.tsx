import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Smartphone, Share, Plus, MoreVertical, Chrome } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAppSettings } from "@/hooks/useAppSettings";
import { useAuth } from "@/contexts/AuthContext";

const BYPASS_KEY = "khety_install_gate_bypassed";

function isPWAInstalled(): boolean {
  if (typeof window === "undefined") return false;
  if ((navigator as unknown as { standalone?: boolean }).standalone === true) return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  return false;
}

function getOS(): "ios" | "android" | "desktop" {
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "desktop";
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

// Read install_gate_enabled from localStorage cache synchronously (zero delay)
function isCacheGateEnabled(): boolean {
  try {
    const raw = localStorage.getItem("khety_app_settings_cache");
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed.install_gate_enabled === true;
  } catch {
    return false;
  }
}

export function InstallGate() {
  const { settings, loading: settingsLoading } = useAppSettings();
  const { user, profile } = useAuth();
  const { i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  // Block IMMEDIATELY from cache — no waiting for Supabase
  const [visible, setVisible] = useState<boolean>(() => {
    if (isPWAInstalled()) return false;
    if (localStorage.getItem(BYPASS_KEY) === "1") return false;
    if (new URLSearchParams(window.location.search).get("preview") === "1") return false;
    return isCacheGateEnabled();
  });

  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasPrompt, setHasPrompt] = useState(false);
  const [showManualHint, setShowManualHint] = useState(false);
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null);
  const os = getOS();

  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";
  const isAdmin =
    profile?.role === "admin" ||
    (ADMIN_EMAIL !== "" && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());

  // Finalize visibility once Supabase settings are confirmed
  useEffect(() => {
    if (settingsLoading) return;
    const gateEnabled = settings.install_gate_enabled === true;
    const isPreview = new URLSearchParams(window.location.search).get("preview") === "1";
    if (!gateEnabled || isPWAInstalled() || localStorage.getItem(BYPASS_KEY) === "1" || isPreview) {
      setVisible(false);
      return;
    }
    setVisible(true);
  }, [settingsLoading, settings]);

  // Hide immediately when admin identity confirmed (auth loaded)
  useEffect(() => {
    if (isAdmin) setVisible(false);
  }, [isAdmin]);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e as BeforeInstallPromptEvent;
      setHasPrompt(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setShowSuccess(true);
      localStorage.setItem(BYPASS_KEY, "1");
      setTimeout(() => setVisible(false), 2000);
    };
    const onStandaloneChange = (mq: MediaQueryListEvent) => {
      if (mq.matches) {
        setInstalled(true);
        localStorage.setItem(BYPASS_KEY, "1");
        setTimeout(() => setVisible(false), 1000);
      }
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    const mql = window.matchMedia("(display-mode: standalone)");
    mql.addEventListener("change", onStandaloneChange);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
      mql.removeEventListener("change", onStandaloneChange);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt.current) {
      setInstalling(true);
      try {
        await deferredPrompt.current.prompt();
        const { outcome } = await deferredPrompt.current.userChoice;
        if (outcome === "accepted") {
          setInstalled(true);
          setShowSuccess(true);
          localStorage.setItem(BYPASS_KEY, "1");
          setTimeout(() => setVisible(false), 2000);
        }
      } finally {
        setInstalling(false);
        deferredPrompt.current = null;
        setHasPrompt(false);
      }
    } else {
      // Native prompt not available — show manual instructions hint
      setShowManualHint(true);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#0a0600] md:bg-black/80"
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Phone-sized container — full screen on mobile, card on desktop */}
          <div className="relative w-full h-full max-w-[390px] md:max-h-[820px] md:rounded-[2.5rem] md:shadow-2xl md:shadow-black/60 md:border md:border-white/10 bg-[#0a0600] overflow-hidden flex flex-col items-center justify-between">

          {/* Background pattern */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-600/8 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  0deg, transparent, transparent 40px, rgba(212,175,55,0.3) 40px, rgba(212,175,55,0.3) 41px
                ), repeating-linear-gradient(
                  90deg, transparent, transparent 40px, rgba(212,175,55,0.3) 40px, rgba(212,175,55,0.3) 41px
                )`,
              }}
            />
          </div>

          {/* Top spacer */}
          <div className="flex-1 flex flex-col items-center justify-end pb-8 px-6 w-full max-w-sm">
            {/* Logo / Icon */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="relative mb-6"
            >
              <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-br from-amber-400 to-amber-700 shadow-2xl shadow-amber-500/30 flex items-center justify-center">
                <img
                  src="/icon-192.png"
                  alt="Khety"
                  className="w-20 h-20 object-contain rounded-2xl"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <span className="absolute text-4xl font-black text-white tracking-tight" style={{ fontFamily: "serif", display: "none" }}>𓂀</span>
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                <Smartphone className="w-4 h-4 text-amber-900" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-2"
            >
              <h1 className="text-3xl font-black text-amber-400 mb-1" style={{ textShadow: "0 0 30px rgba(212,175,55,0.4)" }}>
                Khety Guide
              </h1>
              <p className="text-sm text-amber-200/60">
                {isRtl ? "خيتي · دليل مصر السياحي" : "Khety · Egypt Tourist Guide"}
              </p>
            </motion.div>
          </div>

          {/* Bottom card */}
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5, type: "spring", bounce: 0.2 }}
            className="w-full bg-[#120900] border-t border-amber-500/20 rounded-t-3xl px-6 pt-6 pb-10 flex-shrink-0"
          >
            <AnimatePresence mode="wait">
              {showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center">
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring" }}
                      className="text-3xl"
                    >✓</motion.span>
                  </div>
                  <p className="text-emerald-400 font-bold text-lg">
                    {isRtl ? "تم التثبيت بنجاح!" : "Installed successfully!"}
                  </p>
                  <p className="text-muted-foreground text-sm text-center">
                    {isRtl ? "جاري فتح التطبيق..." : "Opening the app..."}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="install" className="space-y-4">
                  <div className="text-center">
                    <h2 className="text-lg font-bold text-foreground mb-1">
                      {isRtl ? "ثبّت التطبيق أولاً" : "Install the App First"}
                    </h2>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {isRtl
                        ? "التطبيق متاح مجاناً. ثبّته على هاتفك للوصول السريع وتجربة أفضل بدون إنترنت."
                        : "Free to install. Get quick access and a better offline experience."}
                    </p>
                  </div>

                  {/* Install instructions per OS */}
                  {os === "ios" && (
                    <div className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 space-y-3">
                      <p className="text-xs font-bold text-amber-300 text-center">
                        {isRtl ? "خطوات التثبيت على iPhone" : "How to install on iPhone"}
                      </p>
                      <div className="space-y-2">
                        {[
                          { icon: Share, textAr: 'اضغط زر "مشاركة"', textEn: 'Tap the "Share" button' },
                          { icon: Plus, textAr: 'اختر "إضافة إلى الشاشة الرئيسية"', textEn: 'Choose "Add to Home Screen"' },
                          { icon: Smartphone, textAr: "اضغط «إضافة» وافتح التطبيق", textEn: 'Tap "Add" and open the app' },
                        ].map(({ icon: Icon, textAr, textEn }, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                              <span className="text-[10px] font-black text-amber-400">{i + 1}</span>
                            </div>
                            <Icon className="w-4 h-4 text-amber-400/70 shrink-0" />
                            <p className="text-xs text-amber-200/80">{isRtl ? textAr : textEn}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {os === "android" && (
                    <div className="space-y-2">
                      <button
                        onClick={handleInstallClick}
                        disabled={installing || installed}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {installing ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isRtl ? "جاري التثبيت..." : "Installing..."}</>
                        ) : (
                          <><Download className="w-5 h-5" />{isRtl ? "تثبيت التطبيق" : "Install App"}</>
                        )}
                      </button>
                      {showManualHint && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4 space-y-3"
                        >
                          <p className="text-xs font-bold text-amber-300 text-center">
                            {isRtl ? "خطوات التثبيت على Android" : "How to install on Android"}
                          </p>
                          <div className="space-y-2">
                            {[
                              { icon: MoreVertical, textAr: "افتح قائمة المتصفح (⋮)", textEn: "Open browser menu (⋮)" },
                              { icon: Download, textAr: 'اختر "إضافة إلى الشاشة الرئيسية"', textEn: '"Add to Home Screen"' },
                              { icon: Smartphone, textAr: "اضغط «إضافة» وافتح التطبيق", textEn: 'Tap "Add" and open' },
                            ].map(({ icon: Icon, textAr, textEn }, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                                  <span className="text-[10px] font-black text-amber-400">{i + 1}</span>
                                </div>
                                <Icon className="w-4 h-4 text-amber-400/70 shrink-0" />
                                <p className="text-xs text-amber-200/80">{isRtl ? textAr : textEn}</p>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {os === "desktop" && (
                    <div className="space-y-2">
                      <button
                        onClick={handleInstallClick}
                        disabled={installing || installed}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/30 active:scale-95 transition-transform flex items-center justify-center gap-2 disabled:opacity-60"
                      >
                        {installing ? (
                          <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{isRtl ? "جاري التثبيت..." : "Installing..."}</>
                        ) : (
                          <><Download className="w-5 h-5" />{isRtl ? "تثبيت التطبيق" : "Install App"}</>
                        )}
                      </button>
                      {/* Show manual hint only after button clicked without native prompt */}
                      {showManualHint && (
                        <motion.div
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2"
                        >
                          <Chrome className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-200/80 leading-relaxed">
                            {isRtl
                              ? 'انقر أيقونة التثبيت 📥 في شريط العنوان، أو افتح قائمة المتصفح واختر "تثبيت"'
                              : 'Click the install icon 📥 in the address bar, or open browser menu → "Install"'}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Features list */}
                  <div className="grid grid-cols-3 gap-2 pt-1">
                    {[
                      { emoji: "🏛️", textAr: "بدون إنترنت", textEn: "Offline access" },
                      { emoji: "⚡", textAr: "سريع جداً", textEn: "Lightning fast" },
                      { emoji: "🔔", textAr: "إشعارات", textEn: "Notifications" },
                    ].map(({ emoji, textAr, textEn }) => (
                      <div key={textEn} className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/3 border border-white/5">
                        <span className="text-xl">{emoji}</span>
                        <span className="text-[9px] text-muted-foreground text-center">{isRtl ? textAr : textEn}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>{/* end phone container */}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
