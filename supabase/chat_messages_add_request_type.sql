-- Add request_type column to chat_messages to distinguish different AI request types.
-- Values: 'chat' (default), 'ar_scan', 'golden_age'
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor).

ALTER TABLE public.chat_messages
  ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'chat';

CREATE INDEX IF NOT EXISTS idx_chat_messages_request_type
  ON public.chat_messages(request_type);
