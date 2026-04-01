-- ─── Chat Images Storage Bucket ───────────────────────────────────────────────
-- Run this once in Supabase SQL Editor to enable image sending in Khety chat.

-- 1. Create the bucket (public so image URLs work without auth tokens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-images',
  'chat-images',
  true,
  5242880,          -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif','image/heic'];

-- 2. Allow authenticated users to upload to their own folder (user_id/*)
CREATE POLICY "Users can upload chat images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Everyone can read chat images (bucket is public)
CREATE POLICY "Public read access for chat images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'chat-images');

-- 4. Users can delete their own chat images
CREATE POLICY "Users can delete their own chat images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-images'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
