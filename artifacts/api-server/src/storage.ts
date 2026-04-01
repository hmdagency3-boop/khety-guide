import { supabaseAdmin } from "./supabaseAdmin.js";

type AppUser = {
  id: string;
  email: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  subscription_status: string;
  subscription_tier: string;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
};

export async function upsertUser(
  userId: string,
  email?: string
): Promise<AppUser> {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .upsert({ id: userId, email: email ?? null }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw new Error(`[storage] upsertUser: ${error.message}`);
  return data as AppUser;
}

export async function getUserByStripeCustomerId(
  customerId: string
): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("*")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();

  if (error) throw new Error(`[storage] getUserByStripeCustomerId: ${error.message}`);
  return data as AppUser | null;
}

export async function getUser(userId: string): Promise<AppUser | null> {
  const { data, error } = await supabaseAdmin
    .from("app_users")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(`[storage] getUser: ${error.message}`);
  return data as AppUser | null;
}

export async function updateUserStripeCustomerId(
  userId: string,
  customerId: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("app_users")
    .update({ stripe_customer_id: customerId })
    .eq("id", userId);

  if (error) throw new Error(`[storage] updateUserStripeCustomerId: ${error.message}`);
}

export async function updateUserSubscription(
  userId: string,
  data: {
    stripeSubscriptionId: string;
    stripePriceId: string;
    subscriptionStatus: string;
    subscriptionTier: string;
    currentPeriodEnd: Date | null;
  }
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("app_users")
    .update({
      stripe_subscription_id: data.stripeSubscriptionId,
      stripe_price_id: data.stripePriceId,
      subscription_status: data.subscriptionStatus,
      subscription_tier: data.subscriptionTier,
      current_period_end: data.currentPeriodEnd?.toISOString() ?? null,
    })
    .eq("id", userId);

  if (error) throw new Error(`[storage] updateUserSubscription: ${error.message}`);
}

export async function cancelUserSubscription(userId: string): Promise<void> {
  const { error } = await supabaseAdmin
    .from("app_users")
    .update({
      stripe_subscription_id: null,
      stripe_price_id: null,
      subscription_status: "free",
      subscription_tier: "free",
      current_period_end: null,
    })
    .eq("id", userId);

  if (error) throw new Error(`[storage] cancelUserSubscription: ${error.message}`);
}
