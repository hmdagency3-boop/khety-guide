import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
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

export type Invoice = {
  id: string;
  number: string | null;
  status: string | null;
  amount: number;
  currency: string;
  date: number;
  periodStart: number;
  periodEnd: number;
  pdfUrl: string | null;
  hostedUrl: string | null;
  description: string | null;
};

export type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

export function useBilling() {
  const { user } = useAuth();
  const [invoices, setInvoices]           = useState<Invoice[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [loading, setLoading]             = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [error, setError]                 = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const [invRes, pmRes] = await Promise.all([
        authFetch("/api/stripe/invoices"),
        authFetch("/api/stripe/payment-method"),
      ]);
      if (invRes.ok) {
        const d = await invRes.json();
        setInvoices(d.invoices ?? []);
      }
      if (pmRes.ok) {
        const d = await pmRes.json();
        setPaymentMethod(d.paymentMethod ?? null);
      }
    } catch (err: any) {
      setError(err.message ?? "Failed to load billing data");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const cancelSubscription = useCallback(async () => {
    setCancelLoading(true);
    try {
      const res = await authFetch("/api/stripe/cancel-subscription", { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to cancel");
      }
      return await res.json();
    } finally {
      setCancelLoading(false);
    }
  }, []);

  const resumeSubscription = useCallback(async () => {
    setResumeLoading(true);
    try {
      const res = await authFetch("/api/stripe/resume-subscription", { method: "POST" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to resume");
      }
      return await res.json();
    } finally {
      setResumeLoading(false);
    }
  }, []);

  const openPortal = useCallback(async () => {
    const origin = window.location.origin;
    const base = (import.meta as any).env?.BASE_URL?.replace(/\/$/, "") ?? "";
    const res = await authFetch("/api/stripe/create-portal", {
      method: "POST",
      body: JSON.stringify({ returnUrl: `${origin}${base}/billing` }),
    });
    if (!res.ok) throw new Error("Failed to open portal");
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }, []);

  return {
    invoices, paymentMethod,
    loading, cancelLoading, resumeLoading, error,
    refetch: fetchAll, cancelSubscription, resumeSubscription, openPortal,
  };
}
