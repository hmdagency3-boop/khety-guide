import { Router, type Request, type Response } from "express";
import webPush from "web-push";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const router = Router();

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT     || "mailto:admin@example.com";

const SUPABASE_URL         = process.env.SUPABASE_URL          || "https://rglpanrtumanmhbqbhch.supabase.co";
const SUPABASE_ANON_KEY    = process.env.SUPABASE_ANON_KEY     || "sb_publishable_vqaasnq1nsDrJBLldESMsQ_et07dMQf";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const ADMIN_EMAIL          = (process.env.ADMIN_EMAIL || "").toLowerCase();

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

if (!SUPABASE_SERVICE_KEY) {
  console.warn("[Scheduled] SUPABASE_SERVICE_ROLE_KEY is not set — scheduled notification endpoints will operate in anon mode and may fail under RLS.");
}

type ScheduledNotificationRow = {
  id: string;
  title: string;
  title_ar: string | null;
  body: string;
  body_ar: string | null;
  type: string;
  target_type: string;
  target_user_id: string | null;
  send_at: string;
  sent_at: string | null;
  status: "pending" | "processing" | "sent" | "failed" | "cancelled";
  error_message: string | null;
  created_by: string | null;
  created_at: string;
};

type PushSubscriptionRow = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

type ProfileRow = {
  role: string;
};

function serviceClient(): SupabaseClient {
  if (SUPABASE_SERVICE_KEY) {
    return createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false },
    });
  }
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

function userClient(accessToken: string): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  });
}

async function verifyAdmin(accessToken: string): Promise<boolean> {
  if (!accessToken) return false;
  const client = userClient(accessToken);
  const { data: authData, error } = await client.auth.getUser();
  if (error || !authData?.user) return false;
  const user = authData.user;
  if (ADMIN_EMAIL && user.email?.toLowerCase() === ADMIN_EMAIL) return true;
  const db = serviceClient();
  const { data: profile } = await db
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single<ProfileRow>();
  return profile?.role === "admin";
}

function requireAdmin(
  handler: (req: Request, res: Response, userId: string) => Promise<void>
) {
  return async (req: Request, res: Response) => {
    const accessToken = (req.headers["x-access-token"] as string) || "";
    const isAdmin = await verifyAdmin(accessToken);
    if (!isAdmin) {
      res.status(403).json({ error: "Forbidden: admin access required" });
      return;
    }
    const client = userClient(accessToken);
    const { data: authData } = await client.auth.getUser();
    await handler(req, res, authData!.user!.id);
  };
}

function enforceServiceKey(res: Response): boolean {
  if (!SUPABASE_SERVICE_KEY) {
    res.status(503).json({ error: "Service unavailable: SUPABASE_SERVICE_ROLE_KEY is not configured on this server." });
    return false;
  }
  return true;
}

// ── GET /api/scheduled/list ──────────────────────────────────────────────────
router.get(
  "/scheduled/list",
  requireAdmin(async (_req, res) => {
    if (!enforceServiceKey(res)) return;
    const db = serviceClient();
    const { data, error } = await db
      .from("scheduled_notifications")
      .select("*")
      .order("send_at", { ascending: true });

    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(data);
  })
);

// ── POST /api/scheduled/create ───────────────────────────────────────────────
router.post(
  "/scheduled/create",
  requireAdmin(async (req, res, userId) => {
    if (!enforceServiceKey(res)) return;
    const db = serviceClient();
    const {
      title, title_ar, body, body_ar, type, target_type, target_user_id, send_at,
    } = req.body as {
      title: string;
      title_ar?: string;
      body: string;
      body_ar?: string;
      type?: string;
      target_type?: string;
      target_user_id?: string | null;
      send_at: string;
    };

    if (!title || !body || !send_at) {
      res.status(400).json({ error: "Missing required fields: title, body, send_at" });
      return;
    }

    if ((target_type || "all") === "user" && !target_user_id) {
      res.status(400).json({ error: "target_user_id is required when target_type is 'user'" });
      return;
    }

    const { data, error } = await db
      .from("scheduled_notifications")
      .insert({
        title,
        title_ar: title_ar || null,
        body,
        body_ar: body_ar || null,
        type: type || "info",
        target_type: target_type || "all",
        target_user_id: target_user_id || null,
        send_at,
        status: "pending",
        created_by: userId,
      })
      .select()
      .single<ScheduledNotificationRow>();

    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json(data);
  })
);

// ── DELETE /api/scheduled/:id ────────────────────────────────────────────────
router.delete(
  "/scheduled/:id",
  requireAdmin(async (req, res) => {
    if (!enforceServiceKey(res)) return;
    const db = serviceClient();
    const { id } = req.params;

    const { error } = await db
      .from("scheduled_notifications")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("status", "pending");

    if (error) { res.status(500).json({ error: error.message }); return; }
    res.json({ success: true });
  })
);

// ── Background job: fire pending notifications ───────────────────────────────
export async function runScheduledNotificationsJob() {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) return;

  if (!SUPABASE_SERVICE_KEY) {
    console.warn("[Scheduler] SUPABASE_SERVICE_ROLE_KEY not set — scheduler disabled (admin-only RLS requires service role)");
    return;
  }

  const db = serviceClient();
  const now = new Date().toISOString();

  const { data: due, error: fetchErr } = await db
    .from("scheduled_notifications")
    .select("*")
    .eq("status", "pending")
    .lte("send_at", now);

  if (fetchErr) {
    console.error("[Scheduler] fetch error:", fetchErr.message);
    return;
  }
  if (!due || due.length === 0) return;

  const dueRows = due as ScheduledNotificationRow[];
  const dueIds  = dueRows.map((r) => r.id);

  const { data: claimed, error: claimErr } = await db
    .from("scheduled_notifications")
    .update({ status: "processing" } as Partial<ScheduledNotificationRow>)
    .in("id", dueIds)
    .eq("status", "pending")
    .select("id");

  if (claimErr) {
    console.error("[Scheduler] claim error:", claimErr.message);
    return;
  }

  const claimedIds = new Set((claimed || []).map((r: { id: string }) => r.id));
  const claimedRows = dueRows.filter((r) => claimedIds.has(r.id));

  if (claimedRows.length === 0) return;
  console.log(`[Scheduler] ${claimedRows.length} notification(s) claimed for processing`);

  for (const notif of claimedRows) {
    try {
      if (notif.target_type === "user" && !notif.target_user_id) {
        throw new Error("target_type='user' but target_user_id is null — aborting to prevent unintended broadcast");
      }

      let query = db
        .from("push_subscriptions")
        .select("endpoint, p256dh, auth");

      if (notif.target_type === "user") {
        query = query.eq("user_id", notif.target_user_id) as typeof query;
      }

      const { data: subs, error: subErr } = await query;
      if (subErr) throw new Error(subErr.message);

      const subscriptions = (subs || []) as PushSubscriptionRow[];
      const payload = JSON.stringify({ title: notif.title, body: notif.body, type: notif.type || "info" });

      const results = await Promise.allSettled(
        subscriptions.map((sub) =>
          webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          )
        )
      );

      const sent   = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      console.log(`[Scheduler] "${notif.title}" → sent ${sent}, failed ${failed}/${subscriptions.length}`);

      const allFailed = subscriptions.length > 0 && sent === 0;
      const newStatus = allFailed ? "failed" : "sent";
      const errorMsg  = allFailed
        ? (results[0] as PromiseRejectedResult).reason?.message || "All push deliveries failed"
        : null;

      await db
        .from("scheduled_notifications")
        .update({
          status: newStatus,
          sent_at: newStatus === "sent" ? new Date().toISOString() : null,
          error_message: errorMsg,
        })
        .eq("id", notif.id);

      if (newStatus === "sent") {
        const { error: sysErr } = await db.from("system_notifications").insert({
          title: notif.title,
          title_ar: notif.title_ar || null,
          body: notif.body,
          body_ar: notif.body_ar || null,
          type: notif.type || "info",
          target_type: notif.target_type || "all",
          target_user_id: notif.target_user_id || null,
          is_read: false,
        });
        if (sysErr) console.warn("[Scheduler] system_notifications insert failed:", sysErr.message);
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[Scheduler] Error sending "${notif.title}":`, msg);
      await db
        .from("scheduled_notifications")
        .update({ status: "failed", error_message: msg })
        .eq("id", notif.id);
    }
  }
}

export default router;
