-- ════════════════════════════════════════════════════════════════════════════
-- KHETY GUIDE — SECURITY FIXES
-- ✅ آمن للتشغيل أكثر من مرة (كل CREATE مسبوق بـ DROP IF EXISTS)
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- FIX 1 & 2: حذف تريجر prevent_role_escalation (كان بيرجّع role لوحده)
-- الأمان محفوظ عبر: RLS "profiles: admin update all" + set_user_role() RPC
-- ────────────────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
DROP FUNCTION IF EXISTS public.prevent_role_escalation();


-- ────────────────────────────────────────────────────────────────────────────
-- FIX 3: Profiles — المستخدم يشوف صفه فقط + الأدمن يشوف الكل
-- ────────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Users can view any profile"     ON public.profiles;
DROP POLICY IF EXISTS "profiles: select own or admin"  ON public.profiles;

CREATE POLICY "profiles: select own or admin"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid()
    OR public.is_admin()
  );


-- ────────────────────────────────────────────────────────────────────────────
-- FIX 4: support_chats — المستخدم يشوف محادثاته فقط
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.support_chats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_chats: own or admin"  ON public.support_chats;
DROP POLICY IF EXISTS "support_chats select"         ON public.support_chats;
DROP POLICY IF EXISTS "Allow all"                    ON public.support_chats;
DROP POLICY IF EXISTS "Enable read access for all"   ON public.support_chats;

CREATE POLICY "support_chats: own or admin"
  ON public.support_chats FOR SELECT
  USING (
    user_id = auth.uid()
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "support_chats: insert"        ON public.support_chats;
CREATE POLICY "support_chats: insert"
  ON public.support_chats FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "support_chats: admin update"  ON public.support_chats;
CREATE POLICY "support_chats: admin update"
  ON public.support_chats FOR UPDATE
  USING (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────────
-- FIX 5: support_messages — قراءة مباشرة للأدمن فقط
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "support_messages: select"               ON public.support_messages;
DROP POLICY IF EXISTS "support_messages: own or admin"         ON public.support_messages;
DROP POLICY IF EXISTS "support_messages: admin only direct read" ON public.support_messages;
DROP POLICY IF EXISTS "Allow all"                              ON public.support_messages;
DROP POLICY IF EXISTS "Enable read access for all"             ON public.support_messages;

CREATE POLICY "support_messages: admin only direct read"
  ON public.support_messages FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "support_messages: insert"     ON public.support_messages;
CREATE POLICY "support_messages: insert"
  ON public.support_messages FOR INSERT
  WITH CHECK (true);


-- ────────────────────────────────────────────────────────────────────────────
-- FIX 6: visitor_fingerprints — مرئي للأدمن فقط
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.visitor_fingerprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "visitor_fingerprints: select"   ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "visitor_fingerprints: admin select" ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "Admins can view fingerprints"   ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "Enable read access for all"     ON public.visitor_fingerprints;

CREATE POLICY "visitor_fingerprints: admin select"
  ON public.visitor_fingerprints FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "visitor_fingerprints: insert"   ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "Anyone can insert fingerprint"  ON public.visitor_fingerprints;
CREATE POLICY "visitor_fingerprints: insert"
  ON public.visitor_fingerprints FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "visitor_fingerprints: update"       ON public.visitor_fingerprints;
DROP POLICY IF EXISTS "visitor_fingerprints: admin update" ON public.visitor_fingerprints;
CREATE POLICY "visitor_fingerprints: admin update"
  ON public.visitor_fingerprints FOR UPDATE
  USING (public.is_admin());


-- ────────────────────────────────────────────────────────────────────────────
-- FIX 7: vip_invite_codes — مرئية ومُدارة للأدمن فقط
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.vip_invite_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vip_invite_codes: select"         ON public.vip_invite_codes;
DROP POLICY IF EXISTS "vip_invite_codes: admin select"   ON public.vip_invite_codes;
DROP POLICY IF EXISTS "Enable read access for all"       ON public.vip_invite_codes;
DROP POLICY IF EXISTS "Admins can manage invite codes"   ON public.vip_invite_codes;

CREATE POLICY "vip_invite_codes: admin select"
  ON public.vip_invite_codes FOR SELECT
  USING (public.is_admin());

DROP POLICY IF EXISTS "vip_invite_codes: admin manage"   ON public.vip_invite_codes;
CREATE POLICY "vip_invite_codes: admin manage"
  ON public.vip_invite_codes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ════════════════════════════════════════════════════════════════════════════
-- للتحقق بعد التشغيل:
-- SELECT tablename, policyname FROM pg_policies
-- WHERE tablename IN ('profiles','support_chats','support_messages',
--                     'visitor_fingerprints','vip_invite_codes')
-- ORDER BY tablename, policyname;
-- ════════════════════════════════════════════════════════════════════════════
