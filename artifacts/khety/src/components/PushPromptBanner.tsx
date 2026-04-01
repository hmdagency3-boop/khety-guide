import { useState, useEffect } from "react";
import { Bell, BellRing, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { onPushBroadcast } from "@/lib/pushBroadcast";

export { PUSH_BROADCAST_CHANNEL, PUSH_BROADCAST_EVENT } from "@/lib/pushBroadcast";

const DISMISSED_KEY = "khety_push_prompt_dismissed";
const PROMPT_DELAY_MS = 4000;

export function PushPromptBanner() {
  const { user } = useAuth();
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { supported, permission, subscribed, loading, subscribe, subscribeError } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [failed, setFailed] = useState(false);

  // Auto-show after delay (first time, permission not yet granted)
  useEffect(() => {
    if (!user) return;
    if (!supported) return;
    if (permission !== "default") return;
    if (subscribed) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const timer = setTimeout(() => setVisible(true), PROMPT_DELAY_MS);
    return () => clearTimeout(timer);
  }, [user, supported, permission, subscribed]);

  // Listen for admin broadcast — show prompt to all eligible users
  useEffect(() => {
    const unsub = onPushBroadcast(() => {
      if (!supported || subscribed || permission === "denied") return;
      localStorage.removeItem(DISMISSED_KEY);
      setFailed(false);
      setVisible(true);
    });
    return unsub;
  }, [supported, subscribed, permission]);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function handleEnable() {
    setSubscribing(true);
    setFailed(false);
    const ok = await subscribe();
    setSubscribing(false);
    if (ok) {
      setVisible(false);
    } else if (Notification.permission === "denied") {
      dismiss();
    } else {
      setFailed(true);
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          className="absolute bottom-[72px] inset-x-0 z-50 px-3 pb-1"
          dir={isAr ? "rtl" : "ltr"}
        >
          <div className="rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1c1508] via-[#211a08] to-[#1a1209] shadow-2xl shadow-black/60 overflow-hidden">
            {/* Gold accent line */}
            <div className="h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/60 to-transparent" />

            <div className="flex items-start gap-3 p-4">
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-[#D4AF37]" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white leading-snug">
                  {isAr ? "فعّل إشعارات خيتي" : "Enable Khety Notifications"}
                </p>
                {failed ? (
                  <p className="text-[11px] text-rose-400 mt-0.5 leading-relaxed break-words">
                    {subscribeError || (isAr ? "تعذّر الاشتراك — حاول مجدداً لاحقاً" : "Could not subscribe — please try again later")}
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                    {isAr
                      ? "احصل على تنبيهات فورية حتى وأنت خارج التطبيق"
                      : "Get instant alerts even when the app is closed"}
                  </p>
                )}

                {/* Buttons */}
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={handleEnable}
                    disabled={subscribing || loading}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold hover:bg-[#c9a432] active:scale-95 transition-all disabled:opacity-60"
                  >
                    {subscribing || loading ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Bell className="w-3 h-3" />
                    )}
                    {isAr ? "تفعيل" : "Enable"}
                  </button>

                  <button
                    onClick={dismiss}
                    className="px-4 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-xs text-muted-foreground transition-all"
                  >
                    {isAr ? "لاحقاً" : "Later"}
                  </button>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={dismiss}
                className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors shrink-0 mt-0.5"
                aria-label="close"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
