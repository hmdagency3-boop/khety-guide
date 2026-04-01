import { ReactNode, useState, useEffect, useMemo, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Map as MapIcon, ShieldAlert, UserCircle2, LayoutDashboard, Download, X, Headphones, Info, AlertTriangle, CheckCircle2, Zap, Wrench, ShieldX, LogOut, RefreshCw, Mail, ArrowUpCircle, Clock, Train, Users } from "lucide-react";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useTranslation } from "react-i18next";
import { PushPromptBanner } from "./PushPromptBanner";
import { useAppSettings } from "@/hooks/useAppSettings";
import { usePresenceTracker } from "@/hooks/usePresenceTracker";
import { useLocationTracking } from "@/hooks/useLocationTracking";

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || "";

const ANNOUNCEMENT_COLORS = {
  info:    { bg: "bg-blue-500/15 border-blue-500/30",    text: "text-blue-300",   icon: Info },
  warning: { bg: "bg-amber-500/15 border-amber-500/30",  text: "text-amber-300",  icon: AlertTriangle },
  success: { bg: "bg-emerald-500/15 border-emerald-500/30", text: "text-emerald-300", icon: CheckCircle2 },
  alert:   { bg: "bg-red-500/15 border-red-500/30",      text: "text-red-300",    icon: Zap },
};

const MAINTENANCE_TYPES = {
  planned:   { label: "صيانة مجدولة", labelEn: "Scheduled Maintenance", icon: Wrench,        color: "text-amber-400",  bg: "bg-amber-500/15",   border: "border-amber-500/30",   pulse: "bg-amber-400",   progressColor: "from-amber-500 to-amber-400" },
  emergency: { label: "صيانة طارئة",  labelEn: "Emergency Maintenance",  icon: AlertTriangle, color: "text-red-400",    bg: "bg-red-500/15",     border: "border-red-500/30",     pulse: "bg-red-400",     progressColor: "from-red-500 to-red-400"   },
  update:    { label: "تحديث النظام", labelEn: "System Update",          icon: ArrowUpCircle, color: "text-blue-400",   bg: "bg-blue-500/15",    border: "border-blue-500/30",    pulse: "bg-blue-400",    progressColor: "from-blue-500 to-blue-400"  },
};

function useCountdown(endTimeStr: string) {
  const [remaining, setRemaining] = useState<{ h: number; m: number; s: number } | null>(null);

  useEffect(() => {
    if (!endTimeStr) { setRemaining(null); return; }
    const endTime = new Date(endTimeStr).getTime();
    if (isNaN(endTime)) { setRemaining(null); return; }

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) { setRemaining({ h: 0, m: 0, s: 0 }); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTimeStr]);

  return remaining;
}

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const { user, profile, signOut } = useAuth();
  const { canInstall, install, dismiss } = usePWAInstall();
  const { t } = useTranslation("t");
  const { settings } = useAppSettings();

  const userName = useMemo(
    () => profile?.display_name || user?.email?.split("@")[0],
    [profile?.display_name, user?.email]
  );

  usePresenceTracker(user, profile);
  useLocationTracking({
    userId:    user?.id,
    userEmail: user?.email,
    userName,
  });

  const pv = settings.page_visibility;

  const supportBtnX = useMotionValue(0);
  const supportBtnY = useMotionValue(0);
  const dragConstraintRef = useRef<HTMLDivElement>(null);
  const supportIsDragging = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("khety-support-btn-pos");
      if (saved) {
        const { x, y } = JSON.parse(saved);
        supportBtnX.set(x);
        supportBtnY.set(y);
      }
    } catch {}
  }, []);

  const leftNav = useMemo(() => [
    ...(pv.home      !== false ? [{ href: "/",          icon: Home,    label: t("nav.home")      }] : []),
    ...(pv.explore   !== false ? [{ href: "/explore",   icon: Compass, label: t("nav.explore")   }] : []),
    ...(pv.community !== false ? [{ href: "/community", icon: Users,   label: t("nav.community", "Community") }] : []),
  ], [t, pv.home, pv.explore, pv.community]);

  const rightNav = useMemo(() => [
    ...(pv.map    !== false ? [{ href: "/map",    icon: MapIcon,    label: t("nav.map")    }] : []),
    ...(pv.safety !== false ? [{ href: "/safety", icon: ShieldAlert, label: t("nav.safety") }] : []),
  ], [t, pv.map, pv.safety]);

  const isOnboarding = location === "/onboarding";
  const isKhetyActive = location === "/chat" || location.startsWith("/chat");
  const isProfileActive = location === "/profile" || location === "/login" || location === "/register";
  const isSupportPage = location === "/support";
  const isProfilePage = location === "/profile";
  const isAdminUser = profile?.role === "admin" ||
    (ADMIN_EMAIL !== "" && user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase());
  const isAdminActive = location === "/admin";
  const initials = (profile?.display_name || user?.email || "").slice(0, 2).toUpperCase();

  const navLinkClass = (href: string) => {
    const isActive = location === href || (href !== "/" && location.startsWith(href));
    return { isActive, cls: cn(
      "flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative",
      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
    )};
  };

  const annColor = ANNOUNCEMENT_COLORS[settings.announcement_color] || ANNOUNCEMENT_COLORS.info;
  const AnnIcon = annColor.icon;

  const countdown = useCountdown(settings.maintenance_end_time);

  if (profile?.role === "banned") {
    return (
      <div className="fixed inset-0 bg-background text-foreground flex justify-center overflow-hidden">
        <div className="relative w-full max-w-md h-full flex flex-col items-center justify-center bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/10 border-x border-border/50 px-8 text-center">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 texture-papyrus" aria-hidden="true" />
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 20 }}
            className="relative z-10 flex flex-col items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <ShieldX className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-foreground mb-2">تم تعليق حسابك</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                حسابك موقوف مؤقتاً. يرجى التواصل مع الدعم لمزيد من المعلومات.
              </p>
              <p className="text-xs text-muted-foreground/60 mt-2">
                Your account has been suspended. Please contact support.
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  if (settings.maintenance_mode && !isAdminUser) {
    const mtype = MAINTENANCE_TYPES[settings.maintenance_type] || MAINTENANCE_TYPES.planned;
    const MIcon = mtype.icon;
    const progress = settings.maintenance_progress;
    const hasCountdown = countdown !== null;
    const isDone = hasCountdown && countdown.h === 0 && countdown.m === 0 && countdown.s === 0;

    return (
      <div className="fixed inset-0 bg-background text-foreground flex justify-center overflow-hidden">
        <div className="relative w-full max-w-md h-full flex flex-col bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/10 border-x border-border/50 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 texture-papyrus" aria-hidden="true" />

          {/* Top accent line */}
          <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r", mtype.progressColor)} />

          {/* Content */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center relative z-10">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, delay: 0.1 }}
              className="flex flex-col items-center gap-6 w-full"
            >
              {/* Icon */}
              <div className="relative">
                <motion.div
                  animate={{ rotate: settings.maintenance_type === "planned" ? [0, -5, 5, -5, 5, 0] : 0 }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className={cn("w-24 h-24 rounded-3xl flex items-center justify-center border-2", mtype.bg, mtype.border)}
                >
                  <MIcon className={cn("w-12 h-12", mtype.color)} />
                </motion.div>
                {/* Pulse ring */}
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                  className={cn("absolute inset-0 rounded-3xl border-2", mtype.border)}
                />
              </div>

              {/* Type badge */}
              <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border", mtype.bg, mtype.border, mtype.color)}>
                <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", mtype.pulse)} />
                {mtype.label}
              </div>

              {/* Title & message */}
              <div className="space-y-2">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {settings.maintenance_type === "planned" ? "تحت الصيانة" :
                   settings.maintenance_type === "emergency" ? "صيانة طارئة" : "جارٍ التحديث"}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed" dir="rtl">
                  {settings.maintenance_message_ar || "نعمل على تحسين تجربتك. سنعود قريباً!"}
                </p>
                <p className="text-xs text-muted-foreground/50 leading-relaxed">
                  {settings.maintenance_message_en || "We'll be back soon!"}
                </p>
              </div>

              {/* Countdown timer */}
              {hasCountdown && !isDone && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="w-full">
                  <div className="flex items-center justify-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] text-muted-foreground font-medium">الوقت المتبقي</span>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    {[
                      { value: countdown.h, label: "س" },
                      { value: countdown.m, label: "د" },
                      { value: countdown.s, label: "ث" },
                    ].map(({ value, label }, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center border-2 text-2xl font-bold font-mono", mtype.bg, mtype.border, mtype.color)}>
                          {String(value).padStart(2, "0")}
                        </div>
                        <span className="text-[10px] text-muted-foreground mt-1 font-medium">{label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {isDone && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">انتهى الوقت — سنعود الآن!</span>
                </motion.div>
              )}

              {/* Progress bar */}
              {progress > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                  className="w-full">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-muted-foreground font-medium">تقدم الأعمال</span>
                    <span className={cn("text-[11px] font-bold", mtype.color)}>{progress}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-muted/60 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                      className={cn("h-full rounded-full bg-gradient-to-r", mtype.progressColor)}
                    />
                  </div>
                </motion.div>
              )}

              {/* Actions row */}
              <div className="flex items-center gap-3 w-full">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-card border border-border/50 text-sm font-semibold text-foreground hover:bg-card/80 active:scale-95 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث الصفحة
                </button>
                {settings.maintenance_contact_email && (
                  <a
                    href={`mailto:${settings.maintenance_contact_email}`}
                    className={cn("flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border text-sm font-semibold active:scale-95 transition-all", mtype.bg, mtype.border, mtype.color)}
                  >
                    <Mail className="w-4 h-4" />
                    تواصل معنا
                  </a>
                )}
              </div>
            </motion.div>
          </div>

          {/* Bottom progress bar (indeterminate if no progress set) */}
          {progress === 0 && (
            <div className="relative z-10 shrink-0 px-8 pb-12">
              <div className="w-full h-1 rounded-full bg-muted/40 overflow-hidden">
                <motion.div
                  animate={{ x: ["-100%", "200%"] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className={cn("h-full w-1/3 rounded-full bg-gradient-to-r", mtype.progressColor)}
                />
              </div>
              <p className="text-[10px] text-muted-foreground/40 text-center mt-2">الفريق يعمل الآن...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background text-foreground flex justify-center overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 texture-papyrus" aria-hidden="true" />

      <div id="app-root" ref={dragConstraintRef} className="relative w-full max-w-md h-full flex flex-col bg-card/40 backdrop-blur-sm shadow-2xl shadow-black/10 border-x border-border/50">

        {/* PWA Install Banner */}
        <AnimatePresence>
          {canInstall && (
            <motion.div
              initial={{ y: -60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative z-50 shrink-0 bg-gradient-to-r from-[#1a1209] to-[#2a1e0a] border-b border-[#D4AF37]/30 px-4 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 overflow-hidden shrink-0">
                  <img src="/khety-avatar.png" alt="Khety" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#D4AF37]">{t("home.install_title")}</p>
                  <p className="text-[10px] text-muted-foreground">{t("home.install_desc")}</p>
                </div>
                <button onClick={install} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#D4AF37] text-black text-xs font-bold shrink-0 hover:bg-[#c9a432] transition-colors">
                  <Download className="w-3 h-3" /> {t("home.install_btn")}
                </button>
                <button onClick={dismiss} className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors shrink-0">
                  <X className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Announcement Banner */}
        <AnimatePresence>
          {settings.announcement_enabled && settings.announcement_text && (
            <motion.div
              initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("relative z-40 shrink-0 border-b px-4 py-2.5 flex items-center gap-3", annColor.bg)}
            >
              <AnnIcon className={cn("w-4 h-4 shrink-0", annColor.text)} />
              <p className={cn("text-xs font-medium flex-1 text-center leading-snug", annColor.text)}>
                {settings.announcement_text}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full flex flex-col"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Floating Support Button – draggable */}
        <AnimatePresence>
          {isProfilePage && !isAdminUser && pv.support !== false && (
            <motion.div
              drag
              dragConstraints={dragConstraintRef}
              dragElastic={0.08}
              dragMomentum={false}
              style={{ x: supportBtnX, y: supportBtnY }}
              onDragStart={() => { supportIsDragging.current = true; }}
              onDragEnd={() => {
                try {
                  localStorage.setItem(
                    "khety-support-btn-pos",
                    JSON.stringify({ x: supportBtnX.get(), y: supportBtnY.get() })
                  );
                } catch {}
                setTimeout(() => { supportIsDragging.current = false; }, 100);
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.5 }}
              className="absolute bottom-[88px] right-4 z-40 cursor-grab active:cursor-grabbing touch-none"
            >
              <Link href="/support" onClick={(e) => { if (supportIsDragging.current) e.preventDefault(); }}>
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30 flex items-center justify-center"
                  title={t("nav.safety")}
                >
                  <Headphones className="w-5 h-5 text-primary-foreground" />
                  <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />
                </motion.button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Push Notification Prompt */}
        {!isOnboarding && <PushPromptBanner />}

        {/* Bottom Navigation */}
        <nav className={cn("w-full bg-card/90 backdrop-blur-md border-t border-border/60 pb-safe z-50 shrink-0 relative", isOnboarding && "hidden")}>
          <div className="flex items-center justify-around px-1 pt-2 pb-3">

            {leftNav.map(item => {
              const { isActive, cls } = navLinkClass(item.href);
              return (
                <Link key={item.href} href={item.href} className={cls}>
                  {isActive && <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-primary/10 rounded-xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                  <item.icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110")} />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </Link>
              );
            })}

            {/* KHETY center FAB */}
            {pv.chat !== false && <Link href="/chat" className="relative flex flex-col items-center justify-center -mt-6">
              <motion.div
                animate={isKhetyActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative"
              >
                <div className={cn(
                  "absolute -inset-1 rounded-full blur-md transition-opacity duration-300",
                  isKhetyActive ? "opacity-60 bg-primary" : "opacity-0"
                )} />
                <div className={cn(
                  "relative w-14 h-14 rounded-full border-2 flex items-center justify-center shadow-xl transition-all duration-300 overflow-hidden",
                  isKhetyActive
                    ? "border-primary bg-primary shadow-primary/40"
                    : "border-primary/50 bg-gradient-to-br from-[#2a1e0a] to-[#1a1209] shadow-primary/20"
                )}>
                  <img src="/khety-avatar.png" alt="Khety" className="w-full h-full object-cover" />
                </div>
              </motion.div>
              <span className={cn(
                "text-[10px] font-bold tracking-widest mt-1.5 transition-colors",
                isKhetyActive ? "text-primary" : "text-muted-foreground"
              )}>KHETY</span>
            </Link>}

            {rightNav.map(item => {
              const { isActive, cls } = navLinkClass(item.href);
              return (
                <Link key={item.href} href={item.href} className={cls}>
                  {isActive && <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-primary/10 rounded-xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                  <item.icon className={cn("w-5 h-5 mb-1 transition-transform", isActive && "scale-110")} />
                  <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
                </Link>
              );
            })}

            {isAdminUser && (
              <Link href="/admin" className={cn("flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative", isAdminActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                {isAdminActive && <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-primary/10 rounded-xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
                <LayoutDashboard className={cn("w-5 h-5 mb-1 transition-transform", isAdminActive && "scale-110")} />
                <span className="text-[10px] font-medium tracking-wide">{t("nav.admin")}</span>
              </Link>
            )}

            <Link href="/profile" className={cn("flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative", isProfileActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
              {isProfileActive && <motion.div layoutId="nav-indicator" className="absolute inset-0 bg-primary/10 rounded-xl -z-10" transition={{ type: "spring", stiffness: 300, damping: 30 }} />}
              {user && profile?.avatar_url ? (
                <div className={cn("w-6 h-6 rounded-full mb-1 border-2 overflow-hidden transition-colors shrink-0", isProfileActive ? "border-primary" : "border-primary/40")}>
                  <img src={profile.avatar_url} alt={userName ?? ""} className="w-full h-full object-cover" />
                </div>
              ) : user && initials ? (
                <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold mb-1 border transition-colors", isProfileActive ? "bg-primary text-primary-foreground border-primary" : "bg-primary/20 text-primary border-primary/40")}>
                  {initials}
                </div>
              ) : (
                <UserCircle2 className={cn("w-5 h-5 mb-1 transition-transform", isProfileActive && "scale-110")} />
              )}
              <span className="text-[10px] font-medium tracking-wide">{user ? t("nav.profile") : t("nav.login")}</span>
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}
