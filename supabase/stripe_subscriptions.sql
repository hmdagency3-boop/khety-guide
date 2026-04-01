-- Stripe subscription data table
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.app_users (
  id              TEXT PRIMARY KEY,
  email           TEXT,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT,
  stripe_price_id         TEXT,
  subscription_status     TEXT NOT NULL DEFAULT 'free',
  subscription_tier       TEXT NOT NULL DEFAULT 'free',
  current_period_end      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for webhook lookups by Stripe customer ID
CREATE INDEX IF NOT EXISTS app_users_stripe_customer_id_idx
  ON public.app_users (stripe_customer_id);

-- Updated-at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS app_users_set_updated_at ON public.app_users;
CREATE TRIGGER app_users_set_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: Allow full access (the API server validates user identity via JWT)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to app_users"
  ON public.app_users
  FOR ALL
  USING (true)
  WITH CHECK (true);
