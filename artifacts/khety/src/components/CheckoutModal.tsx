import { useEffect, useState, useCallback } from "react";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

let stripePromise: Promise<Stripe | null> | null = null;

async function getStripePromise(): Promise<Promise<Stripe | null>> {
  if (!stripePromise) {
    const res = await fetch("/api/stripe/publishable-key");
    if (!res.ok) throw new Error("Failed to get publishable key");
    const { publishableKey } = await res.json();
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
}

interface CheckoutModalProps {
  clientSecret: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CheckoutModal({ clientSecret, onClose, onSuccess }: CheckoutModalProps) {
  const [stripe, setStripe] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    getStripePromise().then(setStripe).catch(console.error);
  }, []);

  const fetchClientSecret = useCallback(() => {
    return Promise.resolve(clientSecret);
  }, [clientSecret]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      onSuccess?.();
      onClose();
    }
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black/70 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative mt-auto w-full bg-white rounded-t-3xl overflow-hidden"
          style={{ maxHeight: "92vh" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-black text-xs font-bold">K</div>
              <span className="font-semibold text-gray-800 text-sm">Khety Guide</span>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Embedded Checkout */}
          <div className="overflow-y-auto" style={{ maxHeight: "calc(92vh - 64px)" }}>
            {stripe ? (
              <EmbeddedCheckoutProvider
                stripe={stripe}
                options={{ fetchClientSecret }}
              >
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            ) : (
              <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
