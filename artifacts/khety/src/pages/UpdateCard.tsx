import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  ArrowLeft, CheckCircle, CreditCard, Loader2, ShieldCheck, AlertCircle,
} from "lucide-react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { supabase } from "@/lib/supabase";

// ── Stripe promise (cached) ───────────────────────────────────────────────────
let _stripePromise: Promise<Stripe | null> | null = null;
async function getStripe(): Promise<Promise<Stripe | null>> {
  if (!_stripePromise) {
    const res = await fetch("/api/stripe/publishable-key");
    const { publishableKey } = await res.json();
    _stripePromise = loadStripe(publishableKey);
  }
  return _stripePromise;
}

// ── Auth helper ───────────────────────────────────────────────────────────────
async function authFetch(url: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

// ── Inner form (must be inside <Elements>) ────────────────────────────────────
function CardForm({
  onSuccess,
  t,
}: {
  onSuccess: () => void;
  t: (k: string) => string;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setSubmitting(true);
    setError(null);

    try {
      // Confirm the SetupIntent without redirect
      const { error: stripeErr, setupIntent } = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      });

      if (stripeErr) {
        setError(stripeErr.message ?? t("card.error"));
        return;
      }

      // Set the new PM as default on the backend
      const pmId =
        typeof setupIntent?.payment_method === "string"
          ? setupIntent.payment_method
          : (setupIntent?.payment_method as any)?.id;

      if (pmId) {
        const res = await authFetch("/api/stripe/set-default-payment-method", {
          method: "POST",
          body: JSON.stringify({ paymentMethodId: pmId }),
        });
        if (!res.ok) {
          const d = await res.json();
          setError(d.error ?? t("card.error"));
          return;
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message ?? t("card.error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-900 p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            fields: { billingDetails: { name: "auto" } },
          }}
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-red-900/30 border border-red-700/50 p-3">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !stripe}
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-bold flex items-center justify-center gap-2 hover:from-yellow-400 hover:to-amber-400 transition-all disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("card.saving")}
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            {t("card.save")}
          </>
        )}
      </button>
    </form>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function UpdateCard() {
  const { t, i18n } = useTranslation("t");
  const isRtl = i18n.dir() === "rtl";
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret]   = useState<string | null>(null);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [success, setSuccess]             = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    (async () => {
      try {
        const stripeP = await getStripe();
        const resolved = await stripeP;
        const res = await authFetch("/api/stripe/create-setup-intent", { method: "POST" });
        if (cancelled) return;
        if (!res.ok) throw new Error("Failed to create setup intent");
        const d = await res.json();
        setStripeInstance(resolved);
        setClientSecret(d.clientSecret);
      } catch (err: any) {
        if (!cancelled) setFetchError(err.message ?? t("card.error"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  if (!user) { navigate("/login"); return null; }

  const stripeAppearance = {
    theme: "night" as const,
    variables: {
      colorPrimary: "#D4AF37",
      colorBackground: "#0f172a",
      colorText: "#f1f5f9",
      colorDanger: "#f87171",
      fontFamily: "system-ui, sans-serif",
      borderRadius: "12px",
      spacingUnit: "4px",
    },
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="h-full overflow-y-auto bg-slate-950 text-white pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/billing")}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-bold">{t("card.title")}</h1>
      </div>

      <div className="px-4 space-y-4">
        {/* Success state */}
        {success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-16 gap-4"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white">{t("card.success_title")}</h2>
            <p className="text-slate-400 text-sm text-center max-w-xs">{t("card.success_msg")}</p>
            <button
              onClick={() => navigate("/billing")}
              className="mt-4 px-6 py-3 rounded-2xl bg-[#D4AF37] text-black font-bold hover:bg-yellow-400 transition-colors"
            >
              {t("card.back")}
            </button>
          </motion.div>
        ) : loading ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
            <p className="text-slate-500 text-sm">{t("card.loading")}</p>
          </div>
        ) : fetchError ? (
          <div className="flex items-start gap-2 rounded-xl bg-red-900/30 border border-red-700/50 p-4 mt-4">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{fetchError}</p>
          </div>
        ) : clientSecret && stripeInstance ? (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Security note */}
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-slate-400 text-xs">{t("card.subtitle")}</p>
            </div>

            <Elements
              stripe={stripeInstance}
              options={{
                clientSecret,
                appearance: stripeAppearance,
              }}
            >
              <CardForm onSuccess={() => setSuccess(true)} t={t} />
            </Elements>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
