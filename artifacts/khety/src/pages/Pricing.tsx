import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Check, Crown, Compass, Star, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CheckoutModal } from "@/components/CheckoutModal";

interface Price {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: { interval: string } | null;
  metadata: Record<string, string>;
  product: {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, string>;
  };
}

type BillingPeriod = "monthly" | "yearly";

function useStripePrices() {
  const [prices, setPrices] = useState<Price[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/prices")
      .then((r) => r.json())
      .then((d) => {
        setPrices(d.prices ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { prices, loading };
}

const TIERS = ["free", "explorer", "pharaoh"] as const;
type Tier = (typeof TIERS)[number];

export default function Pricing() {
  const { t, i18n } = useTranslation("t");
  const isRtl = i18n.dir() === "rtl";
  const { user } = useAuth();
  const subscription = useSubscription();
  const [, navigate] = useLocation();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [checkoutSecret, setCheckoutSecret] = useState<string | null>(null);
  const { prices, loading: pricesLoading } = useStripePrices();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success")) subscription.syncSubscription();
  }, []);

  const getPriceForTier = (tier: string) =>
    prices.find(
      (p) =>
        (p.product.metadata.tier === tier || p.metadata.tier === tier) &&
        (p.metadata.period === billing ||
          (billing === "monthly" && p.recurring?.interval === "month") ||
          (billing === "yearly" && p.recurring?.interval === "year"))
    );

  const handleSubscribe = async (tier: string) => {
    if (!user) { navigate("/login"); return; }
    const price = getPriceForTier(tier);
    if (!price) return;
    try {
      setCheckoutLoading(tier);
      const clientSecret = await subscription.createEmbeddedCheckout(price.id);
      setCheckoutSecret(clientSecret);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleManage = async () => {
    try {
      setCheckoutLoading("portal");
      await subscription.openPortal();
    } catch (err) {
      console.error(err);
    } finally {
      setCheckoutLoading(null);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const isSuccess = params.get("success") === "1";
  const isCanceled = params.get("canceled") === "1";

  const tierConfig: Record<Tier, {
    icon: React.ReactNode;
    accentColor: string;
    bg: string;
    border: string;
    badgeBg: string;
    buttonClass: string;
    popular?: boolean;
  }> = {
    free: {
      icon: <Compass className="w-5 h-5" />,
      accentColor: "text-slate-300",
      bg: "bg-slate-800/60",
      border: "border-slate-700",
      badgeBg: "",
      buttonClass: "bg-slate-700 text-slate-300 cursor-default",
    },
    explorer: {
      icon: <Star className="w-5 h-5" />,
      accentColor: "text-amber-400",
      bg: "bg-gradient-to-br from-amber-900/30 to-slate-800/80",
      border: "border-emerald-600/60",
      badgeBg: "",
      buttonClass: "bg-emerald-600 hover:bg-emerald-500 text-white",
    },
    pharaoh: {
      icon: <Crown className="w-5 h-5" />,
      accentColor: "text-yellow-400",
      bg: "bg-gradient-to-br from-yellow-900/30 to-slate-800/80",
      border: "border-yellow-600/60",
      badgeBg: "",
      buttonClass: "bg-yellow-500 hover:bg-yellow-400 text-black font-bold",
      popular: true,
    },
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="h-full overflow-y-auto bg-slate-950 text-white pb-28">

      {/* Header */}
      <div className="text-center px-4 pt-8 pb-4">
        <Crown className="inline w-9 h-9 text-yellow-400 mb-2" />
        <h1 className="text-2xl font-bold tracking-wide mb-1">{t("pricing.title")}</h1>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">{t("pricing.subtitle")}</p>
      </div>

      {/* Success / Canceled banners */}
      {isSuccess && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-3 rounded-xl bg-emerald-900/40 border border-emerald-600/50 text-emerald-300 text-sm text-center">
          <Zap className="inline w-4 h-4 me-1" />{t("pricing.success_msg")}
        </motion.div>
      )}
      {isCanceled && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 p-3 rounded-xl bg-red-900/40 border border-red-600/50 text-red-300 text-sm text-center">
          {t("pricing.canceled_msg")}
        </motion.div>
      )}

      {/* Billing toggle */}
      <div className="flex justify-center mb-5 px-4">
        <div className="inline-flex items-center bg-slate-800 rounded-xl p-1 gap-1">
          <button
            onClick={() => setBilling("monthly")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all",
              billing === "monthly" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
          >
            {t("pricing.monthly")}
          </button>
          <button
            onClick={() => setBilling("yearly")}
            className={cn(
              "px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
              billing === "yearly" ? "bg-amber-600 text-white shadow" : "text-slate-400 hover:text-white"
            )}
          >
            {t("pricing.yearly")}
            <span className="text-xs bg-emerald-700 text-emerald-200 px-1.5 py-0.5 rounded-full">
              {t("pricing.save_25")}
            </span>
          </button>
        </div>
      </div>

      {/* Active subscription banner */}
      {subscription.isActive && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="mx-4 mb-5 p-4 rounded-2xl bg-amber-900/30 border border-amber-700/50 flex items-center justify-between">
          <div>
            <p className="text-amber-300 font-semibold text-sm">
              {t("pricing.current_plan")} <span className="capitalize">{subscription.tier}</span>
            </p>
            {subscription.currentPeriodEnd && (
              <p className="text-slate-400 text-xs mt-0.5">
                {t("pricing.renews")} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <button
            onClick={handleManage}
            disabled={checkoutLoading === "portal"}
            className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-medium transition-colors disabled:opacity-50"
          >
            {checkoutLoading === "portal" ? t("pricing.loading") : t("pricing.manage")}
          </button>
        </motion.div>
      )}

      {/* Tier cards — vertical stack */}
      <div className="px-4 space-y-4 max-w-lg mx-auto">
        {TIERS.map((tier, index) => {
          const cfg = tierConfig[tier];
          const price = tier === "free" ? null : getPriceForTier(tier);
          const isCurrentTier = subscription.tier === tier;
          const isPaid = tier !== "free";
          const features = t(`pricing.${tier}.features`, { returnObjects: true }) as string[];

          return (
            <motion.div
              key={tier}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={cn(
                "relative rounded-2xl border p-5",
                cfg.bg,
                cfg.border,
                cfg.popular && "ring-2 ring-yellow-500/40"
              )}
            >
              {/* Popular badge */}
              {cfg.popular && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  {t("pricing.popular")}
                </div>
              )}

              {/* Free trial badge for Explorer */}
              {tier === "explorer" && !isCurrentTier && (
                <div className="absolute -top-3 start-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                  🎁 {t("pricing.trial_badge")}
                </div>
              )}

              {/* Top row: icon + name + current badge + price */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className={cfg.accentColor}>{cfg.icon}</span>
                  <div>
                    <h2 className={cn("font-bold text-base", cfg.accentColor)}>
                      {t(`pricing.${tier}.name`)}
                    </h2>
                    {isCurrentTier && (
                      <span className="text-xs bg-amber-600/30 text-amber-300 px-2 py-0.5 rounded-full border border-amber-600/40">
                        {t("pricing.current")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="text-end shrink-0">
                  {pricesLoading && isPaid ? (
                    <div className="h-8 w-20 bg-slate-700 rounded animate-pulse" />
                  ) : price ? (
                    <div>
                      {tier === "explorer" && billing === "monthly" && !isCurrentTier ? (
                        <>
                          <span className="text-2xl font-bold text-emerald-400">{t("pricing.free_price")}</span>
                          <p className="text-slate-400 text-xs">
                            {t("pricing.then")} ${(price.unit_amount / 100).toFixed(2)}/{t("pricing.mo")}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-2xl font-bold text-white">
                            ${(price.unit_amount / 100).toFixed(2)}
                          </span>
                          <span className="text-slate-400 text-xs ms-0.5">
                            /{price.recurring?.interval === "month" ? t("pricing.mo") : t("pricing.yr")}
                          </span>
                          {billing === "yearly" && (
                            <p className="text-emerald-400 text-xs">{t("pricing.billed_yearly")}</p>
                          )}
                        </>
                      )}
                    </div>
                  ) : tier === "free" ? (
                    <span className="text-2xl font-bold text-white">{t("pricing.free_price")}</span>
                  ) : (
                    <span className="text-slate-400 text-xs">{t("pricing.unavailable")}</span>
                  )}
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-4">
                {(features as string[]).map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Check className={cn("w-4 h-4 mt-0.5 shrink-0", cfg.accentColor)} />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA button */}
              {tier === "free" ? (
                <button disabled className={cn("w-full py-2.5 rounded-xl text-sm font-medium", cfg.buttonClass)}>
                  {t("pricing.current_free")}
                </button>
              ) : isCurrentTier ? (
                <button
                  onClick={handleManage}
                  className="w-full py-2.5 rounded-xl bg-amber-700/50 border border-amber-700 text-amber-300 text-sm font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-1"
                >
                  {t("pricing.manage")} <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => handleSubscribe(tier)}
                  disabled={!!checkoutLoading || !price}
                  className={cn(
                    "w-full py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1",
                    cfg.buttonClass
                  )}
                >
                  {checkoutLoading === tier
                    ? t("pricing.loading")
                    : tier === "explorer"
                      ? t("pricing.start_trial")
                      : t("pricing.subscribe")}
                  {checkoutLoading !== tier && <ChevronRight className="w-4 h-4" />}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-slate-600 text-xs mt-6 px-4">
        {t("pricing.footer_note")}
      </p>

      {checkoutSecret && (
        <CheckoutModal
          clientSecret={checkoutSecret}
          onClose={() => setCheckoutSecret(null)}
          onSuccess={() => {
            setCheckoutSecret(null);
            subscription.syncSubscription();
          }}
        />
      )}
    </div>
  );
}
