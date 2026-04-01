-- ════════════════════════════════════════════════════════════════════════
-- FIX: support_messages — drop ALL existing policies then recreate
-- Run in Supabase SQL Editor
-- ════════════════════════════════════════════════════════════════════════

-- Step 1: Drop ALL policies on support_messages (handles any auto-generated names)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'support_messages'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.support_messages', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END;
$$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

-- Step 3: Create secure policies
-- Direct SELECT: only admins (users read via SECURITY DEFINER RPC)
CREATE POLICY "support_messages: admin select"
  ON public.support_messages FOR SELECT
  USING (public.is_admin());

-- INSERT: via SECURITY DEFINER functions only (keep open for RPC)
CREATE POLICY "support_messages: insert"
  ON public.support_messages FOR INSERT
  WITH CHECK (true);

-- UPDATE/DELETE: admin only
CREATE POLICY "support_messages: admin modify"
  ON public.support_messages FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── Verification ──
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'support_messages'
ORDER BY cmd;
