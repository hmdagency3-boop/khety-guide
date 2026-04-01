-- ============================================================
-- BANNERS TABLE — Khety Guide
-- Run this in the Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS banners (
  id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT              NOT NULL DEFAULT '',
  title_ar    TEXT              NOT NULL DEFAULT '',
  subtitle    TEXT              NOT NULL DEFAULT '',
  subtitle_ar TEXT              NOT NULL DEFAULT '',
  image_url   TEXT,
  link_url    TEXT,
  bg_from     TEXT              NOT NULL DEFAULT '#1a1a2e',
  bg_to       TEXT              NOT NULL DEFAULT '#16213e',
  accent      TEXT              NOT NULL DEFAULT '#d4af37',
  is_active   BOOLEAN           NOT NULL DEFAULT true,
  sort_order  INTEGER           NOT NULL DEFAULT 0,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_banners_active ON banners (is_active, sort_order);

ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "banners_admin_all"   ON banners;
DROP POLICY IF EXISTS "banners_public_read" ON banners;

CREATE POLICY "banners_admin_all"   ON banners USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "banners_public_read" ON banners FOR SELECT USING (true);

GRANT SELECT ON banners TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON banners TO authenticated;

-- ============================================================
-- STORAGE BUCKET for Banner Images
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'banners',
  'banners',
  true,
  5242880,   -- 5 MB max per file
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Allow anyone to read banner images (public bucket)
DROP POLICY IF EXISTS "banners_storage_public_read" ON storage.objects;
CREATE POLICY "banners_storage_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'banners');

-- Only admins can upload/delete banner images
DROP POLICY IF EXISTS "banners_storage_admin_insert" ON storage.objects;
CREATE POLICY "banners_storage_admin_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'banners' AND is_admin());

DROP POLICY IF EXISTS "banners_storage_admin_delete" ON storage.objects;
CREATE POLICY "banners_storage_admin_delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'banners' AND is_admin());

-- ============================================================
-- seed one starter banner (no image — add via admin panel)
-- ============================================================
INSERT INTO banners (title, title_ar, subtitle, subtitle_ar, bg_from, bg_to, accent, sort_order)
VALUES (
  'Discover Ancient Egypt',
  'اكتشف مصر الفرعونية',
  'Explore 12 iconic landmarks with your AI guide',
  'استكشف 12 معلماً تاريخياً مع مرشدك الذكي',
  '#1a0a00',
  '#3d1a00',
  '#d4af37',
  0
) ON CONFLICT DO NOTHING;
