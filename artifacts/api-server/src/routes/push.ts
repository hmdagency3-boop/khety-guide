import { Router, type Request, type Response } from "express";
import webPush from "web-push";
import { createClient } from "@supabase/supabase-js";

const router = Router();

const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT     || "mailto:admin@example.com";

const SUPABASE_URL  = process.env.SUPABASE_URL      || "https://rglpanrtumanmhbqbhch.supabase.co";
const SUPABASE_KEY  = process.env.SUPABASE_ANON_KEY || "sb_publishable_vqaasnq1nsDrJBLldESMsQ_et07dMQf";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

// ── GET /api/push/vapid-public ──────────────────────────────────────────────
// Returns the VAPID public key so the frontend can subscribe
router.get("/push/vapid-public", (_req: Request, res: Response) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// ── POST /api/push/send ─────────────────────────────────────────────────────
// Body: { title, body, type?, target_user_id?, accessToken }
// Server fetches subscriptions from Supabase using the caller's access token
// then sends Web Push to all matching subscriptions.
router.post("/push/send", async (req: Request, res: Response) => {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
    res.status(503).json({ error: "Push not configured — VAPID keys missing" });
    return;
  }

  const { title, body, type, target_user_id, accessToken } = req.body as {
    title:          string;
    body:           string;
    type?:          string;
    target_user_id?: string;
    accessToken?:   string;
  };

  if (!title || !body) {
    res.status(400).json({ error: "Missing title or body" });
    return;
  }

  // Build a Supabase client — use caller's access token if provided (admin privileges via RLS)
  const supabase = accessToken
    ? createClient(SUPABASE_URL, SUPABASE_KEY, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      })
    : createClient(SUPABASE_URL, SUPABASE_KEY);

  // Fetch matching subscriptions
  let query = supabase.from("push_subscriptions").select("endpoint, p256dh, auth");
  if (target_user_id) {
    query = query.eq("user_id", target_user_id) as any;
  }

  const { data: subs, error: dbErr } = await query;

  if (dbErr) {
    console.error("[Push] Supabase error fetching subscriptions:", dbErr.message);
    res.status(500).json({ error: "Could not fetch subscriptions", detail: dbErr.message });
    return;
  }

  if (!subs || subs.length === 0) {
    res.json({ sent: 0, failed: 0, total: 0, message: "No subscriptions found" });
    return;
  }

  const payload = JSON.stringify({ title, body, type: type || "info" });

  const results = await Promise.allSettled(
    subs.map((sub: any) =>
      webPush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  );

  const sent   = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  if (failed > 0) {
    const reasons = results
      .filter((r) => r.status === "rejected")
      .map((r) => (r as PromiseRejectedResult).reason?.message || "unknown")
      .join("; ");
    console.warn(`[Push] ${failed} push(es) failed:`, reasons);
  }

  console.log(`[Push] Sent ${sent}/${subs.length} push notifications`);
  res.json({ sent, failed, total: subs.length });
});

export default router;
