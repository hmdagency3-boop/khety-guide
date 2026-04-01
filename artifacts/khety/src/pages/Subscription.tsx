import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  Crown, Star, Compass, Check, ChevronRight,
  Loader2, ArrowLeft, ExternalLink, Calendar,
  Zap, Shield, RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIER_CONFIG = {
  free:     { icon: Compass,  color: "text-slate-400",  bg: "from-slate-800/60 to-slate-900",  border: "border-slate-700",    label: "TRAVELER"  },
  explorer: { icon: Star,     color: "text-amber-400",  bg: "from-amber-900/40 to-slate-900",  border: "border-amber-600/60", label: "EXPLORER"  },
  pharaoh:  { icon: Crown,    color: "text-yellow-400", bg: "from-yellow-900/40 to-slate-900", border: "border-yellow-500/60",label: "PHARAOH"   },
} as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active:    { label: "Active",       color: "text-emerald-400", dot: "bg-emerald-400" },
  trialing:  { label: "Free Trial",   color: "text-sky-400",     dot: "bg-sky-400"     },
  canceled:  { label: "Canceled",     color: "text-red-400",     dot: "bg-red-400"     },
  past_due:  { label: "Past Due",     color: "text-orange-400",  dot: "bg-orange-400"  },
  none:      { label: "Free Plan",    color: "text-slate-400",   dot: "bg-slate-500"   },
};

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function Subscription() {
  const { t, i18n } = useTranslation("t");
  const isRtl = i18n.dir() === "rtl";
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const subscription = useSubscription();

  const tier      = subscription.tier ?? "free";
  const status    = subscription.status ?? "none";
  const cfg       = TIER_CONFIG[tier] ?? TIER_CONFIG.free;
  const Icon      = cfg.icon;
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.none;
  const periodEnd = subscription.currentPeriodEnd;
  const daysLeft  = daysUntil(periodEnd);
  const isTrialing = status === "trialing";
  const isActive   = status === "active" || isTrialing;
  const isFree     = tier === "free" || status === "none";

  const features: string[] = t(`sub.features_${tier}`, { returnObjects: true }) as string[];

  if (!user) {
    navigate("/login");
    return null;
  }

  if (subscription.loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="h-full overflow-y-auto bg-slate-950 text-white pb-28"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/profile")}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-bold">{t("sub.title")}</h1>
      </div>

      {/* Plan Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "mx-4 rounded-2xl border bg-gradient-to-br p-5 mb-4",
          cfg.bg, cfg.border
        )}
      >
        {/* Plan name row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center bg-white/10", cfg.color)}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest">{t("sub.plan_label")}</p>
              <h2 className={cn("text-xl font-bold", cfg.color)}>{cfg.label}</h2>
            </div>
          </div>

          {/* Status badge */}
          <div className="flex items-center gap-1.5 bg-black/30 rounded-full px-3 py-1.5 border border-white/10">
            <span className={cn("w-2 h-2 rounded-full", statusCfg.dot)} />
            <span className={cn("text-xs font-semibold", statusCfg.color)}>{statusCfg.label}</span>
          </div>
        </div>

        {/* Trial countdown */}
        {isTrialing && daysLeft !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-sky-900/40 border border-sky-600/40 rounded-xl p-3 mb-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-sky-400" />
              <span className="text-sky-300 font-semibold text-sm">
                {daysLeft} {t("sub.days_left")}
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-1.5 mb-2">
              <div
                className="h-1.5 rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                style={{ width: `${Math.min(100, Math.max(5, ((30 - daysLeft) / 30) * 100))}%` }}
              />
            </div>
            <p className="text-slate-400 text-xs">{t("sub.trial_info")}</p>
          </motion.div>
        )}

        {/* Renewal / end date */}
        {periodEnd && (
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-4">
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <span>
              {isTrialing ? t("sub.trial_ends") : status === "canceled" ? t("sub.canceled_on") : t("sub.renews_on")}
              {" "}
              <span className="font-semibold text-white">{new Date(periodEnd).toLocaleDateString()}</span>
            </span>
          </div>
        )}

        {/* Features */}
        <ul className="space-y-2">
          {(features as string[]).map((f, i) => (
            <li key={i} className="flex items-start gap-2 text-sm">
              <Check className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.color)} />
              <span className="text-slate-300">{f}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Actions */}
      <div className="px-4 space-y-3">
        {/* Upgrade (if free or explorer, show upgrade option) */}
        {(isFree || tier === "explorer") && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate("/pricing")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-amber-400 transition-all"
          >
            <Crown className="w-4 h-4" />
            {t("sub.upgrade")}
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        )}

        {/* Billing portal (for paid users) */}
        {isActive && !isFree && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate("/billing")}
            className="w-full py-3.5 rounded-2xl bg-slate-800 border border-slate-700 text-white font-semibold flex items-center justify-center gap-2 hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-slate-400" />
            {t("sub.billing_portal")}
          </motion.button>
        )}

        {/* Refresh status */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={async () => {
            try { await subscription.syncSubscription(); }
            catch (e) { console.error(e); }
          }}
          disabled={subscription.loading}
          className="w-full py-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", subscription.loading && "animate-spin")} />
          {t("sub.manage_billing")}
        </motion.button>

        {/* Security note */}
        <div className="flex items-start gap-2 px-1 pt-1">
          <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
          <p className="text-slate-600 text-xs">{t("sub.cancel_info")}</p>
        </div>
      </div>
    </div>
  );
}
