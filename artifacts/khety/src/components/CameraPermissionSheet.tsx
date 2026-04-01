import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Settings, ScanLine, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  language?: string;
  onGranted: () => void;
  onClose: () => void;
}

export function CameraPermissionSheet({ language = "en", onGranted, onClose }: Props) {
  const [requesting, setRequesting] = useState(false);
  const [denied, setDenied] = useState(false);
  const ar = language === "ar";

  const txt = {
    title:        ar ? "إذن الكاميرا" : "Camera Access",
    subtitle:     ar ? "خيتي يحتاج الكاميرا لـ AR Scanner" : "Khety needs your camera for AR scanning",
    feats: [
      ar ? "🏛️ التعرف على الآثار والمعالم الأثرية" : "🏛️ Identify monuments & archaeological sites",
      ar ? "🔍 تحليل الصور بالذكاء الاصطناعي فوراً" : "🔍 Real-time AI image analysis",
      ar ? "📍 تجربة AR تفاعلية على أرض الواقع" : "📍 Interactive AR overlay on the ground",
    ],
    allow:        ar ? "السماح بالوصول للكاميرا" : "Allow Camera Access",
    requesting:   ar ? "جارٍ الطلب…" : "Requesting…",
    deny:         ar ? "ليس الآن" : "Not now",
    deniedTitle:  ar ? "تم رفض الإذن" : "Permission Denied",
    deniedBody:   ar ? "لتفعيل الكاميرا افتح إعدادات المتصفح وابحث عن إعدادات الكاميرا لهذا الموقع." : "To enable camera, open your browser settings and allow camera access for this site.",
    openSettings: ar ? "افتح الإعدادات" : "Open Settings",
    close:        ar ? "إغلاق" : "Close",
  };

  async function handleAllow() {
    setRequesting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      stream.getTracks().forEach((t) => t.stop());
      onGranted();
    } catch {
      setDenied(true);
    } finally {
      setRequesting(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 26, stiffness: 300 }}
          className="w-full max-w-md bg-card border border-border/40 rounded-t-3xl px-5 pt-5 pb-8 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm leading-tight">{txt.title}</p>
                <p className="text-xs text-muted-foreground leading-tight">{txt.subtitle}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!denied ? (
              <motion.div key="request" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-muted/30 border border-border/30 rounded-2xl p-4 mb-5 space-y-2.5">
                  {txt.feats.map((f, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-sm text-foreground/80 leading-snug">{f}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ScanLine className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {ar
                      ? "لن يُسجَّل أي فيديو — الكاميرا تُستخدم لالتقاط إطار واحد فقط."
                      : "No video is stored — camera is used to capture a single frame only."}
                  </p>
                </div>

                <Button
                  onClick={handleAllow}
                  disabled={requesting}
                  className="w-full h-12 rounded-2xl text-sm font-semibold shadow-md shadow-primary/20 mb-2"
                >
                  {requesting ? txt.requesting : txt.allow}
                </Button>

                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {txt.deny}
                </button>
              </motion.div>
            ) : (
              <motion.div key="denied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 mb-5">
                  <p className="font-semibold text-destructive text-sm mb-1">{txt.deniedTitle}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{txt.deniedBody}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => window.open("app-settings:") }
                  className="w-full h-12 rounded-2xl text-sm font-semibold mb-2 gap-2"
                >
                  <Settings className="w-4 h-4" />
                  {txt.openSettings}
                </Button>
                <button
                  onClick={onClose}
                  className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {txt.close}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
