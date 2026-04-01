-- ─── Profile Pictures Storage Bucket ─────────────────────────────────────────
-- Run this once in Supabase SQL Editor to create the storage bucket
-- and set the correct access policies.

-- 1. Create the bucket (public so avatar URLs work without auth tokens)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'Profile pictures',
  'Profile pictures',
  true,
  5242880,          -- 5 MB
  ARRAY['image/jpeg','image/png','image/webp','image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public            = true,
  file_size_limit   = 5242880,
  allowed_mime_types = ARRAY['image/jpeg','image/png','image/webp','image/gif'];

-- 2. Allow authenticated users to upload ONLY to their own folder (user_id/*)
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'Profile pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 3. Allow authenticated users to update/replace their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'Profile pictures'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 4. Everyone can read (bucket is public, but RLS still applies)
CREATE POLICY "Public read access for avatars"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'Profile pictures');
