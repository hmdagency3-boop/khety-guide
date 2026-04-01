-- Fix RLS for app_users table
-- The API server uses the anon key, so we need to allow server-side writes.
-- Run this in the Supabase SQL Editor.

-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can read own subscription" ON public.app_users;

-- Allow full access from the API server (anon key validates user identity itself)
CREATE POLICY "Allow full access to app_users"
  ON public.app_users
  FOR ALL
  USING (true)
  WITH CHECK (true);
