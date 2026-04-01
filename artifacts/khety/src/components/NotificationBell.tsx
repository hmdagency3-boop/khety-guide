import { useState, useRef, useEffect } from "react";
import { Bell, Check, CheckCheck, Info, AlertTriangle, CheckCircle2, Zap, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useNotifications, type SystemNotification } from "@/hooks/useNotifications";
import { useTranslation } from "react-i18next";
import { PushSubscribeButton } from "./PushSubscribeButton";

const TYPE_CONFIG = {
  info:    { icon: Info,          color: "text-blue-400",    bg: "bg-blue-400/10",    border: "border-blue-400/20" },
  warning: { icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/20" },
  success: { icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  alert:   { icon: Zap,           color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/20" },
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "الآن";
  if (m < 60) return `${m}د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}س`;
  const d = Math.floor(h / 24);
  return `${d}ي`;
}

function NotifItem({ notif, onRead }: { notif: SystemNotification; onRead: (id: string) => void }) {
  const { i18n } = useTranslation("t");
  const isAr = i18n.language === "ar";
  const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        "relative flex gap-3 px-4 py-3.5 transition-all cursor-pointer",
        !notif.is_read && "bg-primary/4"
      )}
      onClick={() => onRead(notif.id)}
    >
      {/* Unread dot */}
      {!notif.is_read && (
        <span className="absolute top-4 left-3 w-1.5 h-1.5 rounded-full bg-primary" />
      )}

      <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border mt-0.5", cfg.bg, cfg.border)}>
        <Icon className={cn("w-4 h-4", cfg.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={cn("text-[12px] font-semibold leading-tight", notif.is_read ? "text-muted-foreground" : "text-foreground")}>
          {isAr && notif.title_ar ? notif.title_ar : notif.title}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug line-clamp-2">
          {isAr && notif.body_ar ? notif.body_ar : notif.body}
        </p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">{timeAgo(notif.created_at)}</p>
      </div>

      {notif.is_read && (
        <Check className="w-3 h-3 text-muted-foreground/30 shrink-0 mt-1" />
      )}
    </motion.div>
  );
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
        className="relative w-9 h-9 rounded-xl bg-card border border-border/40 flex items-center justify-center hover:border-primary/30 hover:bg-card/80 transition-all"
        aria-label="Notifications"
      >
        <Bell className={cn("w-4 h-4 transition-colors", unreadCount > 0 ? "text-primary" : "text-muted-foreground")} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              key="badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center px-0.5 shadow-sm shadow-primary/30"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-11 right-0 w-[320px] max-w-[calc(100vw-32px)] bg-card border border-border/50 rounded-2xl shadow-2xl shadow-black/40 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-foreground">الإشعارات</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-bold">
                    {unreadCount} جديد
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-primary/8"
                  >
                    <CheckCheck className="w-3 h-3" /> تحديد الكل
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-6 h-6 rounded-lg flex items-center justify-center hover:bg-muted/60 transition-colors"
                >
                  <X className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-border/20">
              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 border border-primary/15 flex items-center justify-center mb-3">
                    <Bell className="w-5 h-5 text-primary/40" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">لا توجد إشعارات</p>
                  <p className="text-xs text-muted-foreground mt-1">ستظهر الإشعارات الجديدة هنا</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map(n => (
                    <NotifItem key={n.id} notif={n} onRead={markAsRead} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div className="px-3 py-2 border-t border-border/20 flex justify-between items-center gap-2">
              {notifications.length > 0 && (
                <span className="text-[10px] text-muted-foreground">{notifications.length} إشعار</span>
              )}
              <PushSubscribeButton compact={false} className="ml-auto text-[11px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
