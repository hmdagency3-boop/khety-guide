-- ═══════════════════════════════════════════════════════════
--  KHETY GUIDE — Community: Add multi-image support
--  Run this in Supabase SQL Editor (after community.sql)
-- ═══════════════════════════════════════════════════════════

-- Add image_urls array column (keeps old image_url for backwards compat)
ALTER TABLE public.community_posts
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- Migrate existing single image_url into the array
UPDATE public.community_posts
SET image_urls = ARRAY[image_url]
WHERE image_url IS NOT NULL
  AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);
