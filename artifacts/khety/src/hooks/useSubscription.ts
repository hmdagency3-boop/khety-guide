import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export type SubscriptionTier = "free" | "explorer" | "pharaoh";

export interface SubscriptionStatus {
  tier: SubscriptionTier;
  status: string;
  currentPeriodEnd: string | null;
  priceId: string | null;
  subscriptionId: string | null;
  isActive: boolean;
  loading: boolean;
  error: string | null;
}

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Only allow redirects to Stripe-owned domains to prevent open redirect attacks. */
function safeStripeRedirect(url: string | undefined): void {
  if (!url) return;
  try {
    const parsed = new URL(url);
    const allowed = ["checkout.stripe.com", "billing.stripe.com", "stripe.com"];
    if (parsed.protocol === "https:" && allowed.some((d) => parsed.hostname === d || parsed.hostname.endsWith(`.${d}`))) {
      window.location.href = url;
    } else {
      console.error("[Stripe] Blocked redirect to untrusted URL:", parsed.hostname);
    }
  } catch {
    console.error("[Stripe] Blocked redirect to invalid URL");
  }
}

async function authFetch(url: string, options: RequestInit = {}) {
  const token = await getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

export function useSubscription() {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    tier: "free",
    status: "none",
    currentPeriodEnd: null,
    priceId: null,
    subscriptionId: null,
    isActive: false,
    loading: true,
    error: null,
  });

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setStatus((s) => ({ ...s, loading: false }));
      return;
    }

    try {
      const res = await authFetch("/api/stripe/subscription");
      if (!res.ok) throw new Error("Failed to fetch subscription");
      const data = await res.json();
      setStatus({
        tier: (data.tier as SubscriptionTier) ?? "free",
        status: data.status ?? "none",
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        priceId: data.priceId ?? null,
        subscriptionId: data.subscriptionId ?? null,
        isActive:
          data.status === "active" ||
          data.status === "trialing",
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setStatus((s) => ({
        ...s,
        loading: false,
        error: err.message ?? "Unknown error",
      }));
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createCheckout = useCallback(
    async (priceId: string) => {
      const origin = window.location.origin;
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await authFetch("/api/stripe/create-checkout", {
        method: "POST",
        body: JSON.stringify({
          priceId,
          successUrl: `${origin}${base}/pricing?success=1`,
          cancelUrl: `${origin}${base}/pricing?canceled=1`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create checkout");
      const data = await res.json();
      safeStripeRedirect(data.url);
    },
    []
  );

  const createEmbeddedCheckout = useCallback(
    async (priceId: string): Promise<string> => {
      const origin = window.location.origin;
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await authFetch("/api/stripe/create-embedded-checkout", {
        method: "POST",
        body: JSON.stringify({
          priceId,
          returnUrl: `${origin}${base}/pricing?success=1`,
        }),
      });
      if (!res.ok) throw new Error("Failed to create embedded checkout");
      const data = await res.json();
      return data.clientSecret as string;
    },
    []
  );

  const openPortal = useCallback(async () => {
    const origin = window.location.origin;
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const res = await authFetch("/api/stripe/create-portal", {
      method: "POST",
      body: JSON.stringify({ returnUrl: `${origin}${base}/pricing` }),
    });
    if (!res.ok) throw new Error("Failed to open portal");
    const data = await res.json();
    safeStripeRedirect(data.url);
  }, []);

  const syncSubscription = useCallback(async () => {
    setStatus((s) => ({ ...s, loading: true }));
    await authFetch("/api/stripe/sync-subscription", { method: "POST" });
    await fetchSubscription();
  }, [fetchSubscription]);

  return { ...status, refetch: fetchSubscription, createCheckout, createEmbeddedCheckout, openPortal, syncSubscription };
}
