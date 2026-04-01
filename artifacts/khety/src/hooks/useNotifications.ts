import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export interface SystemNotification {
  id: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  type: "info" | "warning" | "success" | "alert";
  target_type: "all" | "user";
  target_user_id: string | null;
  created_by: string | null;
  created_at: string;
  is_read?: boolean;
  read_at?: string | null;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data: notifData, error } = await supabase
        .from("system_notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !notifData) { setLoading(false); return; }

      if (user) {
        const ids = notifData.map((n: any) => n.id);
        const { data: reads } = await supabase
          .from("notification_reads")
          .select("notification_id, read_at")
          .eq("user_id", user.id)
          .in("notification_id", ids);

        const readMap = new Map((reads || []).map((r: any) => [r.notification_id, r.read_at]));
        setNotifications(
          notifData
            .filter((n: any) => n.target_type === "all" || n.target_user_id === user.id)
            .map((n: any) => ({
              ...n,
              is_read: readMap.has(n.id),
              read_at: readMap.get(n.id) ?? null,
            }))
        );
      } else {
        setNotifications(
          notifData
            .filter((n: any) => n.target_type === "all")
            .map((n: any) => ({ ...n, is_read: false, read_at: null }))
        );
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    const already = notifications.find(n => n.id === notificationId)?.is_read;
    if (already) return;

    await supabase.from("notification_reads").insert({
      notification_id: notificationId,
      user_id: user.id,
    }).then(() => {
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      );
    });
  }, [user, notifications]);

  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    const unread = notifications.filter(n => !n.is_read);
    if (!unread.length) return;

    await supabase.from("notification_reads").insert(
      unread.map(n => ({ notification_id: n.id, user_id: user.id }))
    );
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
  }, [user, notifications]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return { notifications, loading, unreadCount, markAsRead, markAllAsRead, refresh: fetchNotifications };
}
