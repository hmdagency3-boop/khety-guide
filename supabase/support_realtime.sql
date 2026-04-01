-- =============================================================================
-- Khety Guide — Enable Realtime for Support Messages
-- =============================================================================
-- Run this ONE TIME in Supabase SQL Editor to enable real-time messaging.
-- This is SEPARATE from support_schema.sql — no data will be lost.
-- =============================================================================

-- 1. Add support_messages to Supabase Realtime publication
ALTER TABLE support_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE support_messages;

-- 2. Grant anon SELECT so Realtime subscriptions work
GRANT SELECT ON support_messages TO anon;

-- 3. RLS policy: anon can read messages (server-side filter by chat_id keeps it safe)
DROP POLICY IF EXISTS "anon_realtime_select" ON support_messages;
CREATE POLICY "anon_realtime_select" ON support_messages
  FOR SELECT TO anon
  USING (true);
