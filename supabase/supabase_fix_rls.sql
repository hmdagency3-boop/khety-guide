-- ============================================================
-- FIX: Infinite recursion in profiles RLS policies
-- شغّل هذا الملف في Supabase → SQL Editor
-- ============================================================

-- الخطوة 1: احذف كل السياسات القديمة التي تسبب التكرار اللانهائي
DROP POLICY IF EXISTS "profiles: admins read all" ON public.profiles;
DROP POLICY IF EXISTS "profiles: read own" ON public.profiles;
DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;

DROP POLICY IF EXISTS "travel_profiles: manage own" ON public.travel_profiles;
DROP POLICY IF EXISTS "travel_profiles: admins read all" ON public.travel_profiles;

DROP POLICY IF EXISTS "conversations: manage own" ON public.conversations;
DROP POLICY IF EXISTS "conversations: admins read all" ON public.conversations;

DROP POLICY IF EXISTS "chat_messages: manage own" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_messages: admins read all" ON public.chat_messages;

DROP POLICY IF EXISTS "user_favorites: manage own" ON public.user_favorites;
DROP POLICY IF EXISTS "user_visited: manage own" ON public.user_visited;

-- ============================================================
-- الخطوة 2: أنشئ دالة مساعدة تتحقق من صلاحية Admin
-- SECURITY DEFINER = تعمل بصلاحيات المالك وتتجاوز RLS تلقائياً
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- الخطوة 3: أعد إنشاء السياسات بشكل صحيح
-- ============================================================

-- profiles
CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- travel_profiles
CREATE POLICY "travel_profiles: manage own"
  ON public.travel_profiles FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- user_favorites
CREATE POLICY "user_favorites: manage own"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_visited
CREATE POLICY "user_visited: manage own"
  ON public.user_visited FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- conversations
CREATE POLICY "conversations: manage own"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- chat_messages
CREATE POLICY "chat_messages: manage own"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- تم الإصلاح ✓
-- السبب: السياسات القديمة كانت تسأل جدول profiles عن صلاحية
-- الأدمن من داخل سياسة جدول profiles نفسه = recursion.
-- الحل: دالة is_admin() تعمل بـ SECURITY DEFINER فتتجاوز RLS.
-- ============================================================
