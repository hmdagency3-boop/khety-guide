import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useBilling, type Invoice } from "@/hooks/useBilling";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, CreditCard, Receipt, Download,
  Loader2, AlertTriangle, CheckCircle, XCircle, Clock,
  Ban, RefreshCw, Zap, ChevronRight, Shield, Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── helpers ──────────────────────────────────────────────────────────────────
function formatAmount(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function formatDate(ts: number) {
  return new Date(ts * 1000).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const BRAND_ICON: Record<string, string> = {
  visa:       "💳",
  mastercard: "💳",
  amex:       "💳",
  discover:   "💳",
};

const STATUS_CHIP: Record<string, { icon: React.ReactNode; cls: string }> = {
  paid:  { icon: <CheckCircle className="w-3.5 h-3.5" />, cls: "bg-emerald-900/50 text-emerald-400 border-emerald-700/50" },
  open:  { icon: <Clock       className="w-3.5 h-3.5" />, cls: "bg-amber-900/50  text-amber-400  border-amber-700/50"  },
  void:  { icon: <XCircle     className="w-3.5 h-3.5" />, cls: "bg-slate-800      text-slate-400  border-slate-700"     },
  draft: { icon: <Clock       className="w-3.5 h-3.5" />, cls: "bg-slate-800      text-slate-400  border-slate-700"     },
};

// ── Invoice row ───────────────────────────────────────────────────────────────
function InvoiceRow({ inv, t }: { inv: Invoice; t: (k: string) => string }) {
  const chip = STATUS_CHIP[inv.status ?? ""] ?? STATUS_CHIP.draft;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-800 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        <Receipt className="w-4 h-4 text-slate-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {inv.description ?? inv.number ?? inv.id.slice(-8)}
        </p>
        <p className="text-xs text-slate-500">{formatDate(inv.date)}</p>
      </div>
      <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 border text-xs font-medium shrink-0", chip.cls)}>
        {chip.icon}
        {t(`billing.status_${inv.status}`) || inv.status}
      </div>
      <p className="text-sm font-semibold text-white shrink-0 w-16 text-right">
        {formatAmount(inv.amount, inv.currency)}
      </p>
      <div className="flex items-center gap-1 shrink-0">
        {inv.pdfUrl && (
          <a
            href={inv.pdfUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#D4AF37] hover:underline flex items-center gap-0.5"
          >
            <Download className="w-3 h-3" />
            {t("billing.download")}
          </a>
        )}
      </div>
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({
  periodEnd, onConfirm, onCancel, t, loading,
}: {
  periodEnd: string | null;
  onConfirm: () => void;
  onCancel: () => void;
  t: (k: string) => string;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="w-full max-w-sm mx-4 mb-8 rounded-2xl bg-slate-900 border border-slate-700 p-6"
      >
        <div className="w-12 h-12 rounded-2xl bg-red-900/40 border border-red-700/40 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-center font-bold text-white mb-2">{t("billing.cancel_title")}</h3>
        <p className="text-center text-slate-400 text-sm mb-6">
          {t("billing.cancel_confirm")}{periodEnd ? " " + new Date(periodEnd).toLocaleDateString() : ""}.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            {t("billing.cancel_no")}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-red-700 text-white font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? t("billing.canceling") : t("billing.cancel_yes")}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BillingPortal() {
  const { t, i18n } = useTranslation("t");
  const isRtl = i18n.dir() === "rtl";
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const subscription = useSubscription();
  const billing = useBilling();

  const [showConfirm, setShowConfirm]         = useState(false);
  const [canceledAt, setCanceledAt]           = useState<string | null>(null);
  const [resumedOk, setResumedOk]             = useState(false);

  if (!user) { navigate("/login"); return null; }

  const isFree      = subscription.tier === "free" || subscription.status === "none";
  const isTrialing  = subscription.status === "trialing";
  const isCanceling = canceledAt !== null;

  const handleCancel = async () => {
    try {
      const data = await billing.cancelSubscription();
      setCanceledAt(subscription.currentPeriodEnd);
      setShowConfirm(false);
    } catch (e: any) {
      console.error(e);
      setShowConfirm(false);
    }
  };

  const handleResume = async () => {
    try {
      await billing.resumeSubscription();
      setResumedOk(true);
      setCanceledAt(null);
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="h-full overflow-y-auto bg-slate-950 text-white pb-28">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4">
        <button
          onClick={() => navigate("/subscription")}
          className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-bold">{t("billing.title")}</h1>
      </div>

      {billing.loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
        </div>
      ) : (
        <div className="px-4 space-y-4">

          {/* ── Trial banner ─────────────────────────────────────── */}
          {isTrialing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-sky-900/30 border border-sky-600/40 p-4 flex items-center gap-3"
            >
              <Zap className="w-5 h-5 text-sky-400 shrink-0" />
              <div>
                <p className="text-sky-300 font-semibold text-sm">{t("billing.trial_active")}</p>
                {subscription.currentPeriodEnd && (
                  <p className="text-slate-400 text-xs mt-0.5">
                    {t("sub.trial_ends")} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Payment method ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4"
          >
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              {t("billing.payment_method")}
            </h2>
            {billing.paymentMethod ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-xl">
                  {BRAND_ICON[billing.paymentMethod.brand] ?? "💳"}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white capitalize">
                    {billing.paymentMethod.brand} •••• {billing.paymentMethod.last4}
                  </p>
                  <p className="text-xs text-slate-500">
                    {t("billing.card_expires")} {billing.paymentMethod.expMonth}/{billing.paymentMethod.expYear}
                  </p>
                </div>
                <button
                  onClick={() => navigate("/update-card")}
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                  {t("billing.update_payment")}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-slate-600" />
                  </div>
                  <p className="text-sm text-slate-500">{t("billing.no_payment")}</p>
                </div>
                <button
                  onClick={() => navigate("/update-card")}
                  className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 shrink-0"
                >
                  <Pencil className="w-3 h-3" />
                  {t("billing.update_payment")}
                </button>
              </div>
            )}
          </motion.div>

          {/* ── Invoices ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-4"
          >
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
              {t("billing.invoices")}
            </h2>
            {billing.invoices.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Receipt className="w-8 h-8 text-slate-700" />
                <p className="text-slate-500 text-sm">{t("billing.no_invoices")}</p>
              </div>
            ) : (
              <div>
                {billing.invoices.map((inv) => (
                  <InvoiceRow key={inv.id} inv={inv} t={t} />
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Cancel / Resume ───────────────────────────────────── */}
          {!isFree && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-slate-900 border border-slate-800 p-4"
            >
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                {t("billing.cancel_title")}
              </h2>

              {resumedOk ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm py-2">
                  <CheckCircle className="w-4 h-4" />
                  Plan resumed successfully.
                </div>
              ) : isCanceling ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm text-amber-300">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>
                      {t("billing.resume_info")}{" "}
                      <span className="font-semibold">{canceledAt ? new Date(canceledAt).toLocaleDateString() : ""}</span>
                    </span>
                  </div>
                  <button
                    onClick={handleResume}
                    disabled={billing.resumeLoading}
                    className="w-full py-3 rounded-xl bg-emerald-800 border border-emerald-700 text-white font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {billing.resumeLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                    {t("billing.resume_btn")}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <Shield className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    <p className="text-slate-500 text-xs">{t("billing.cancel_info")}</p>
                  </div>
                  <button
                    onClick={() => setShowConfirm(true)}
                    className="w-full py-3 rounded-xl bg-red-900/30 border border-red-800/60 text-red-400 font-semibold hover:bg-red-900/50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Ban className="w-4 h-4" />
                    {t("billing.cancel_btn")}
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </div>
      )}

      {/* Confirm modal */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmDialog
            periodEnd={subscription.currentPeriodEnd}
            onConfirm={handleCancel}
            onCancel={() => setShowConfirm(false)}
            t={t}
            loading={billing.cancelLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
