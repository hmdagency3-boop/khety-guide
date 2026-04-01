import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

async function getVapidPublicKey(): Promise<string | null> {
  try {
    const res = await fetch("/api/push/vapid-public");
    if (!res.ok) return null;
    const { publicKey } = await res.json();
    return publicKey || null;
  } catch {
    return null;
  }
}

export type PushPermission = "default" | "granted" | "denied";

export function usePushNotifications() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<PushPermission>("default");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Sync current permission state
  useEffect(() => {
    if (!supported) return;
    setPermission(Notification.permission as PushPermission);
  }, [supported]);

  // Check for existing subscription + try to re-sync it to Supabase if missing
  useEffect(() => {
    if (!supported || !user) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const existing = await reg.pushManager.getSubscription();
      if (!existing) { setSubscribed(false); return; }
      setSubscribed(true);
      // Check if this subscription is saved in Supabase; if not, upsert it now
      const { endpoint, keys } = (existing.toJSON() as any);
      const { count } = await supabase
        .from("push_subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("endpoint", endpoint);
      if (count === 0) {
        await supabase.from("push_subscriptions").upsert(
          { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
          { onConflict: "endpoint" }
        );
      }
    }).catch(() => {});
  }, [supported, user]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported) {
      setSubscribeError("Push notifications are not supported in this browser");
      return false;
    }
    if (!user) {
      setSubscribeError("يجب تسجيل الدخول أولاً لتفعيل الإشعارات");
      return false;
    }
    setLoading(true);
    setSubscribeError(null);
    try {
      const vapidKey = await getVapidPublicKey();
      if (!vapidKey) {
        setSubscribeError("VAPID key not available — push not configured");
        return false;
      }

      const perm = await Notification.requestPermission();
      setPermission(perm as PushPermission);
      if (perm === "denied") {
        setSubscribeError("تم رفض الإذن — فعّل الإشعارات يدوياً من إعدادات المتصفح");
        return false;
      }
      if (perm !== "granted") return false; // dismissed — no error shown, banner stays

      const reg = await navigator.serviceWorker.ready;
      let sub   = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: vapidKey,
        });
      }

      const { endpoint, keys } = sub.toJSON() as any;

      // First try INSERT — if conflict exists just update own record
      const { error: dbErr } = await supabase.from("push_subscriptions").upsert(
        { user_id: user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth },
        { onConflict: "endpoint" }
      );

      if (dbErr) {
        const code = (dbErr as any).code as string | undefined;
        let humanMsg = dbErr.message;

        if (code === "42P01" || humanMsg.includes("does not exist")) {
          humanMsg = 'جدول push_subscriptions غير موجود — يرجى تشغيل supabase_notifications.sql في Supabase SQL Editor';
        } else if (code === "42501" || humanMsg.toLowerCase().includes("row-level security")) {
          humanMsg = 'خطأ في صلاحيات RLS — تحقق من سياسات push_subscriptions';
        }

        console.error("[Push] DB error saving subscription:", code, dbErr.message);
        setSubscribeError(humanMsg);
        // Unsubscribe from browser to stay consistent
        await sub.unsubscribe();
        return false;
      }

      setSubscribed(true);
      return true;
    } catch (err: any) {
      const msg = err?.message || String(err);
      console.error("[Push] Subscribe failed:", msg);
      setSubscribeError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, [supported, user]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    if (!supported) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error("[Push] Unsubscribe failed:", err);
    }
  }, [supported]);

  return { supported, permission, subscribed, loading, subscribe, unsubscribe, subscribeError };
}

// ── Admin helper: send push via server (server fetches subscriptions itself) ─

export async function sendPushNotification(payload: {
  title:           string;
  body:            string;
  type?:           string;
  target_user_id?: string;
}): Promise<{ sent: number; failed: number; total: number }> {
  try {
    // Get the current session's access token so the server can query Supabase
    const { data: { session } } = await supabase.auth.getSession();
    const accessToken = session?.access_token;

    const res = await fetch("/api/push/send", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...payload, accessToken }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.warn("[Push] Server error:", err);
      return { sent: 0, failed: 0, total: 0 };
    }

    return res.json();
  } catch (err) {
    console.warn("[Push] Network error:", err);
    return { sent: 0, failed: 0, total: 0 };
  }
}
