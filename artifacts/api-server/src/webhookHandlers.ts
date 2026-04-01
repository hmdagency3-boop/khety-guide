import type Stripe from "stripe";
import {
  getUserByStripeCustomerId,
  updateUserSubscription,
  cancelUserSubscription,
} from "./storage.js";

function getTierFromPriceId(priceId: string): string {
  const map: Record<string, string> = {};
  const explorerMonthly = process.env.EXPLORER_MONTHLY_PRICE_ID;
  const explorerYearly = process.env.EXPLORER_YEARLY_PRICE_ID;
  const pharaohMonthly = process.env.PHARAOH_MONTHLY_PRICE_ID;
  const pharaohYearly = process.env.PHARAOH_YEARLY_PRICE_ID;

  if (explorerMonthly) map[explorerMonthly] = "explorer";
  if (explorerYearly) map[explorerYearly] = "explorer";
  if (pharaohMonthly) map[pharaohMonthly] = "pharaoh";
  if (pharaohYearly) map[pharaohYearly] = "pharaoh";

  return map[priceId] ?? "explorer";
}

export async function handleSubscriptionUpsert(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) {
    console.warn(`[Webhook] No user found for customer ${customerId}`);
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price.id ?? "";
  const tier = getTierFromPriceId(priceId);
  const periodEndRaw = item?.current_period_end ?? (subscription as any).current_period_end;
  const periodEnd = periodEndRaw ? new Date(periodEndRaw * 1000) : null;

  await updateUserSubscription(user.id, {
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    subscriptionStatus: subscription.status,
    subscriptionTier:
      subscription.status === "active" || subscription.status === "trialing"
        ? tier
        : "free",
    currentPeriodEnd: periodEnd,
  });

  console.log(
    `[Webhook] Updated subscription for user ${user.id}: ${tier} (${subscription.status})`
  );
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer.id;

  const user = await getUserByStripeCustomerId(customerId);
  if (!user) return;

  await cancelUserSubscription(user.id);
  console.log(`[Webhook] Cancelled subscription for user ${user.id}`);
}
