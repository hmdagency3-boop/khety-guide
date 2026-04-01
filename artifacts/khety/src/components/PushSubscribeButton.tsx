import { BellOff, BellRing, Loader2 } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  compact?: boolean;
}

export function PushSubscribeButton({ className, compact = false }: Props) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { supported, permission, subscribed, loading, subscribe, unsubscribe } =
    usePushNotifications();

  if (!supported || permission === "denied") return null;

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (subscribed) {
      await unsubscribe();
    } else {
      await subscribe();
    }
  };

  const label = subscribed
    ? isAr ? "إيقاف الإشعارات الفورية" : "Disable push notifications"
    : isAr ? "تفعيل الإشعارات الفورية" : "Enable push notifications";

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      title={label}
      aria-label={label}
      className={cn(
        "flex items-center gap-2 text-xs rounded-lg transition-all",
        "text-muted-foreground hover:text-foreground",
        subscribed
          ? "text-primary hover:text-primary/80"
          : "hover:bg-muted/50",
        compact ? "p-1.5" : "px-3 py-2 w-full",
        className
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : subscribed ? (
        <BellRing className="h-3.5 w-3.5 text-primary" />
      ) : (
        <BellOff className="h-3.5 w-3.5" />
      )}
      {!compact && <span>{label}</span>}
    </button>
  );
}
