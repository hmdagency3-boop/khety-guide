-- ─── Add image_url column to chat_messages ────────────────────────────────────
-- Run this once in Supabase SQL Editor.

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS image_url TEXT;

COMMENT ON COLUMN public.chat_messages.image_url IS
  'Public URL of the image attached by the user (uploaded to chat-images bucket)';
