-- ─── Profiles Table RLS Policies ─────────────────────────────────────────────
-- Run this once in Supabase SQL Editor if users cannot update their own profile.

-- Enable RLS on profiles (safe to run even if already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view any profile"     ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"   ON public.profiles;
DROP POLICY IF EXISTS "Users can upsert own profile"   ON public.profiles;

-- 1. Anyone (including anon) can read profiles
CREATE POLICY "Users can view any profile"
ON public.profiles FOR SELECT
USING (true);

-- 2. Authenticated users can insert their own profile row
CREATE POLICY "Users can insert own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

-- 3. Authenticated users can update their own profile row
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE TO authenticated
USING     (id = auth.uid())
WITH CHECK (id = auth.uid());

-- 4. Grant upsert (needed when using .upsert() from the JS client)
-- Supabase upsert issues INSERT + UPDATE, so both policies above cover it.
-- No extra grant needed for service role (it bypasses RLS).
