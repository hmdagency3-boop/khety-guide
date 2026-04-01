-- ─── Community: embed author name & avatar in post row ────────────────────────
-- This ensures display_name / avatar always show, regardless of profiles RLS.
-- Run AFTER community.sql

ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS author_name     TEXT,
  ADD COLUMN IF NOT EXISTS author_avatar   TEXT,
  ADD COLUMN IF NOT EXISTS author_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Back-fill from profiles for any existing rows (runs only if profile is readable)
UPDATE public.community_posts cp
SET
  author_name   = p.display_name,
  author_avatar = p.avatar_url
FROM public.profiles p
WHERE p.id = cp.user_id
  AND (cp.author_name IS NULL OR cp.author_avatar IS NULL);

-- ─── Also fix profiles RLS so anyone can read any profile ─────────────────────
DROP POLICY IF EXISTS "profiles: read all"        ON public.profiles;
DROP POLICY IF EXISTS "Users can view any profile" ON public.profiles;

CREATE POLICY "profiles: read all"
ON public.profiles FOR SELECT
USING (true);
