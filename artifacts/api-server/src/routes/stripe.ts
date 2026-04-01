import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth, type AuthRequest } from "../middlewares/auth.js";
import {
  getUncachableStripeClient,
  getStripePublishableKey,
} from "../stripeClient.js";
import {
  upsertUser,
  getUser,
  updateUserStripeCustomerId,
} from "../storage.js";
import { handleSubscriptionUpsert, handleSubscriptionDeleted } from "../webhookHandlers.js";

const router = Router();

router.get("/stripe/publishable-key", async (_req: Request, res: Response) => {
  try {
    const key = await getStripePublishableKey();
    res.json({ publishableKey: key });
  } catch (err) {
    console.error("[Stripe] Failed to get publishable key:", err);
    res.status(500).json({ error: "Failed to retrieve publishable key" });
  }
});

router.get("/stripe/prices", async (_req: Request, res: Response) => {
  try {
    const stripe = await getUncachableStripeClient();
    const prices = await stripe.prices.list({
      active: true,
      expand: ["data.product"],
      limit: 20,
    });
    res.json({ prices: prices.data });
  } catch (err) {
    console.error("[Stripe] Failed to list prices:", err);
    res.status(500).json({ error: "Failed to list prices" });
  }
});

router.get(
  "/stripe/subscription",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await getUser(req.userId!);
      if (!user) {
        res.json({ tier: "free", status: "none" });
        return;
      }

      const stripe = await getUncachableStripeClient();

      if (!user.stripe_subscription_id && user.stripe_customer_id) {
        const subs = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: "all",
          limit: 1,
        });
        const latest = subs.data[0];
        if (latest) {
          await handleSubscriptionUpsert(latest);
          const refreshed = await getUser(req.userId!);
          res.json({
            tier: refreshed?.subscription_tier ?? "free",
            status: latest.status,
            currentPeriodEnd: refreshed?.current_period_end,
            priceId: refreshed?.stripe_price_id,
            subscriptionId: latest.id,
          });
          return;
        }
        res.json({ tier: "free", status: "none" });
        return;
      }

      if (!user.stripe_subscription_id) {
        res.json({ tier: "free", status: "none" });
        return;
      }

      const subscription = await stripe.subscriptions.retrieve(
        user.stripe_subscription_id
      );

      res.json({
        tier: user.subscription_tier ?? "free",
        status: subscription.status,
        currentPeriodEnd: user.current_period_end,
        priceId: user.stripe_price_id,
        subscriptionId: user.stripe_subscription_id,
      });
    } catch (err) {
      console.error("[Stripe] Failed to get subscription:", err);
      res.status(500).json({ error: "Failed to get subscription" });
    }
  }
);

router.post(
  "/stripe/create-checkout",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    const { priceId, successUrl, cancelUrl } = req.body as {
      priceId: string;
      successUrl: string;
      cancelUrl: string;
    };

    if (!priceId || !successUrl || !cancelUrl) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      let user = await getUser(req.userId!);
      if (!user) {
        user = await upsertUser(req.userId!, req.userEmail);
      }

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.userEmail,
          metadata: { userId: req.userId! },
        });
        customerId = customer.id;
        await updateUserStripeCustomerId(req.userId!, customerId);
      }

      const priceDetails = await stripe.prices.retrieve(priceId, { expand: ["product"] });
      const tier = (priceDetails.metadata?.tier ?? (priceDetails.product as any)?.metadata?.tier) as string | undefined;
      const isExplorer = tier === "explorer";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        success_url: successUrl,
        cancel_url: cancelUrl,
        allow_promotion_codes: true,
        subscription_data: {
          metadata: { userId: req.userId! },
          ...(isExplorer ? { trial_period_days: 30 } : {}),
        },
      });

      res.json({ url: session.url, sessionId: session.id });
    } catch (err) {
      console.error("[Stripe] Failed to create checkout:", err);
      res.status(500).json({ error: "Failed to create checkout session" });
    }
  }
);

router.post(
  "/stripe/create-portal",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    const { returnUrl } = req.body as { returnUrl: string };

    try {
      const user = await getUser(req.userId!);
      if (!user?.stripe_customer_id) {
        res.status(400).json({ error: "No Stripe customer found" });
        return;
      }

      const stripe = await getUncachableStripeClient();
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: returnUrl,
      });

      res.json({ url: session.url });
    } catch (err) {
      console.error("[Stripe] Failed to create portal:", err);
      res.status(500).json({ error: "Failed to create billing portal" });
    }
  }
);

router.post(
  "/stripe/sync-subscription",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await getUser(req.userId!);
      const stripe = await getUncachableStripeClient();

      if (user?.stripe_subscription_id) {
        const subscription = await stripe.subscriptions.retrieve(
          user.stripe_subscription_id
        );
        await handleSubscriptionUpsert(subscription);
      } else if (user?.stripe_customer_id) {
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripe_customer_id,
          status: "all",
          limit: 1,
        });
        const latest = subscriptions.data[0];
        if (latest) {
          await handleSubscriptionUpsert(latest);
          console.log(`[Sync] Found subscription via customer lookup: ${latest.id}`);
        } else {
          res.json({ tier: "free" });
          return;
        }
      } else {
        res.json({ tier: "free" });
        return;
      }

      const updated = await getUser(req.userId!);
      res.json({ tier: updated?.subscription_tier ?? "free" });
    } catch (err) {
      console.error("[Stripe] Failed to sync subscription:", err);
      res.status(500).json({ error: "Failed to sync subscription" });
    }
  }
);

// ── POST /api/stripe/create-setup-intent ─────────────────────────────────────
router.post(
  "/stripe/create-setup-intent",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      let user = await getUser(req.userId!);
      if (!user) user = await upsertUser(req.userId!, req.userEmail);

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.userEmail,
          metadata: { userId: req.userId! },
        });
        customerId = customer.id;
        await updateUserStripeCustomerId(req.userId!, customerId);
      }

      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
        usage: "off_session",
      });

      res.json({ clientSecret: setupIntent.client_secret });
    } catch (err) {
      console.error("[Stripe] Failed to create setup intent:", err);
      res.status(500).json({ error: "Failed to create setup intent" });
    }
  }
);

// ── POST /api/stripe/set-default-payment-method ───────────────────────────────
router.post(
  "/stripe/set-default-payment-method",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const { paymentMethodId } = req.body as { paymentMethodId: string };
      if (!paymentMethodId) {
        res.status(400).json({ error: "paymentMethodId required" });
        return;
      }
      const user = await getUser(req.userId!);
      if (!user?.stripe_customer_id) {
        res.status(400).json({ error: "No Stripe customer found" });
        return;
      }
      const stripe = await getUncachableStripeClient();

      // Attach PM to customer (idempotent if already attached)
      try {
        await stripe.paymentMethods.attach(paymentMethodId, { customer: user.stripe_customer_id });
      } catch { /* already attached */ }

      // Set as default for invoices
      await stripe.customers.update(user.stripe_customer_id, {
        invoice_settings: { default_payment_method: paymentMethodId },
      });

      // Also update the subscription's default PM if one exists
      if (user.stripe_subscription_id) {
        await stripe.subscriptions.update(user.stripe_subscription_id, {
          default_payment_method: paymentMethodId,
        });
      }

      res.json({ success: true });
    } catch (err) {
      console.error("[Stripe] Failed to set default payment method:", err);
      res.status(500).json({ error: "Failed to set default payment method" });
    }
  }
);

// ── GET /api/stripe/invoices ─────────────────────────────────────────────────
router.get(
  "/stripe/invoices",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await getUser(req.userId!);
      if (!user?.stripe_customer_id) {
        res.json({ invoices: [] });
        return;
      }
      const stripe = await getUncachableStripeClient();
      const list = await stripe.invoices.list({
        customer: user.stripe_customer_id,
        limit: 24,
      });
      const invoices = list.data.map((inv) => ({
        id: inv.id,
        number: inv.number,
        status: inv.status,
        amount: inv.amount_paid,
        currency: inv.currency,
        date: inv.created,
        periodStart: inv.period_start,
        periodEnd: inv.period_end,
        pdfUrl: inv.invoice_pdf,
        hostedUrl: inv.hosted_invoice_url,
        description: (inv.lines?.data?.[0] as any)?.description ?? null,
      }));
      res.json({ invoices });
    } catch (err) {
      console.error("[Stripe] Failed to list invoices:", err);
      res.status(500).json({ error: "Failed to list invoices" });
    }
  }
);

// ── GET /api/stripe/payment-method ───────────────────────────────────────────
router.get(
  "/stripe/payment-method",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await getUser(req.userId!);
      if (!user?.stripe_customer_id) {
        res.json({ paymentMethod: null });
        return;
      }
      const stripe = await getUncachableStripeClient();
      const pms = await stripe.paymentMethods.list({
        customer: user.stripe_customer_id,
        type: "card",
        limit: 1,
      });
      if (!pms.data.length) {
        res.json({ paymentMethod: null });
        return;
      }
      const pm = pms.data[0];
      res.json({
        paymentMethod: {
          id: pm.id,
          brand: pm.card?.brand ?? "card",
          last4: pm.card?.last4 ?? "••••",
          expMonth: pm.card?.exp_month,
          expYear: pm.card?.exp_year,
        },
      });
    } catch (err) {
      console.error("[Stripe] Failed to get payment method:", err);
      res.status(500).json({ error: "Failed to get payment method" });
    }
  }
);

// ── POST /api/stripe/cancel-subscription ─────────────────────────────────────
router.post(
  "/stripe/cancel-subscription",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await getUser(req.userId!);
      if (!user?.stripe_subscription_id) {
        res.status(400).json({ error: "No active subscription found" });
        return;
      }
      const stripe = await getUncachableStripeClient();
      // Cancel at period end (graceful — user keeps access until billing date)
      const updated = await stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: true,
      });
      console.log(`[Stripe] Subscription ${user.stripe_subscription_id} set to cancel at period end`);
      res.json({ cancelAtPeriodEnd: updated.cancel_at_period_end, currentPeriodEnd: updated.current_period_end });
    } catch (err) {
      console.error("[Stripe] Failed to cancel subscription:", err);
      res.status(500).json({ error: "Failed to cancel subscription" });
    }
  }
);

// ── POST /api/stripe/resume-subscription ─────────────────────────────────────
router.post(
  "/stripe/resume-subscription",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await getUser(req.userId!);
      if (!user?.stripe_subscription_id) {
        res.status(400).json({ error: "No subscription found" });
        return;
      }
      const stripe = await getUncachableStripeClient();
      const updated = await stripe.subscriptions.update(user.stripe_subscription_id, {
        cancel_at_period_end: false,
      });
      res.json({ cancelAtPeriodEnd: updated.cancel_at_period_end });
    } catch (err) {
      console.error("[Stripe] Failed to resume subscription:", err);
      res.status(500).json({ error: "Failed to resume subscription" });
    }
  }
);

router.post(
  "/stripe/create-embedded-checkout",
  requireAuth as any,
  async (req: AuthRequest, res: Response) => {
    const { priceId, returnUrl } = req.body as { priceId: string; returnUrl: string };

    if (!priceId || !returnUrl) {
      res.status(400).json({ error: "Missing required fields" });
      return;
    }

    try {
      let user = await getUser(req.userId!);
      if (!user) user = await upsertUser(req.userId!, req.userEmail);

      const stripe = await getUncachableStripeClient();

      let customerId = user.stripe_customer_id;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: req.userEmail,
          metadata: { userId: req.userId! },
        });
        customerId = customer.id;
        await updateUserStripeCustomerId(req.userId!, customerId);
      }

      const priceDetails = await stripe.prices.retrieve(priceId, { expand: ["product"] });
      const tier = (priceDetails.metadata?.tier ?? (priceDetails.product as any)?.metadata?.tier) as string | undefined;
      const isExplorer = tier === "explorer";

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: priceId, quantity: 1 }],
        mode: "subscription",
        ui_mode: "embedded",
        return_url: returnUrl,
        allow_promotion_codes: true,
        subscription_data: {
          metadata: { userId: req.userId! },
          ...(isExplorer ? { trial_period_days: 30 } : {}),
        },
      });

      res.json({ clientSecret: session.client_secret });
    } catch (err) {
      console.error("[Stripe] Failed to create embedded checkout:", err);
      res.status(500).json({ error: "Failed to create embedded checkout session" });
    }
  }
);

export default router;

export async function handleStripeWebhook(req: Request, res: Response) {
  const stripe = await getUncachableStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: any;

  if (webhookSecret) {
    const sig = req.headers["stripe-signature"] as string;
    try {
      event = stripe.webhooks.constructEvent(
        (req as any).rawBody ?? req.body,
        sig,
        webhookSecret
      );
    } catch (err: any) {
      console.error("[Webhook] Signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  } else {
    event = req.body;
  }

  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object);
      break;
    default:
      break;
  }

  res.json({ received: true });
}
