-- ============================================================
-- Khety Guide – نظام الحظر (Ban System)
-- تشغيل هذا الملف في Supabase → SQL Editor
-- ============================================================
-- ماذا يفعل هذا الملف:
--   1. يضيف دالة is_banned() لفحص الحظر في سياسات RLS
--   2. يُحدّث سياسة UPDATE على profiles ليمكن الأدمن من تعديل الأدوار
--   3. يضيف دالة set_user_role() يستخدمها الأدمن لتغيير دور المستخدم
--   4. يُحدّث سياسات RLS لمنع المحظورين من الكتابة في جميع الجداول
--   5. يضيف دالة get_user_email_from_chats() لجلب إيميل المستخدم
-- ============================================================
-- ملاحظة: لا تحتاج إنشاء أي جدول جديد — الحظر يعمل عبر
--         تغيير القيمة في عمود role الموجود بالفعل في جدول profiles
-- ============================================================


-- ============================================================
-- 1. دالة مساعدة: is_banned()
-- تُعيد TRUE إذا كان المستخدم الحالي محظوراً (role = 'banned')
-- SECURITY DEFINER → تتجاوز RLS لتقرأ profiles مباشرة
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_banned()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'banned'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_banned() TO authenticated;


-- ============================================================
-- 2. توثيق: عمود role في جدول profiles
-- القيم المسموح بها الآن: 'user' | 'admin' | 'banned'
-- ============================================================

COMMENT ON COLUMN public.profiles.role
  IS 'أدوار المستخدم: user (عادي) | admin (مدير) | banned (محظور)';


-- ============================================================
-- 3. سياسة UPDATE للأدمن على جدول profiles
-- ** هذا هو سبب عدم عمل الحظر! **
-- بدون هذه السياسة لا يستطيع الأدمن تعديل role المستخدمين
-- ============================================================

DROP POLICY IF EXISTS "profiles: admin update all" ON public.profiles;

CREATE POLICY "profiles: admin update all"
  ON public.profiles FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- تحديث سياسة المستخدم العادي: منع المحظور من تعديل ملفه
DROP POLICY IF EXISTS "profiles: update own" ON public.profiles;

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id AND NOT public.is_banned());


-- ============================================================
-- 4. دالة set_user_role() — تُستخدم من لوحة الأدمن
-- SECURITY DEFINER: تتجاوز RLS وتتحقق من صلاحية الأدمن داخلياً
-- تمنع الأدمن من تغيير دوره الخاص أو دور أدمن آخر
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_user_role(
  p_target_user_id UUID,
  p_new_role        TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role  TEXT;
  v_target_role  TEXT;
BEGIN
  -- تحقق من أن المستدعي أدمن
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_caller_role IS DISTINCT FROM 'admin' THEN
    RETURN jsonb_build_object('error', 'غير مصرح: يجب أن تكون أدمناً لتغيير الأدوار');
  END IF;

  -- تحقق من دور المستخدم المستهدف
  SELECT role INTO v_target_role
  FROM public.profiles
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'المستخدم غير موجود');
  END IF;

  -- منع الأدمن من تغيير دور نفسه
  IF p_target_user_id = auth.uid() THEN
    RETURN jsonb_build_object('error', 'لا يمكنك تغيير دورك الخاص');
  END IF;

  -- منع تغيير دور أدمن آخر (إلا إلى 'user')
  IF v_target_role = 'admin' AND p_new_role = 'banned' THEN
    RETURN jsonb_build_object('error', 'لا يمكن حظر أدمن آخر');
  END IF;

  -- التحقق من صحة القيمة الجديدة
  IF p_new_role NOT IN ('user', 'admin', 'banned') THEN
    RETURN jsonb_build_object('error', 'قيمة الدور غير صالحة');
  END IF;

  -- تنفيذ التحديث
  UPDATE public.profiles
  SET role = p_new_role, updated_at = NOW()
  WHERE id = p_target_user_id;

  RETURN jsonb_build_object('success', true, 'new_role', p_new_role);
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_user_role(UUID, TEXT) TO authenticated;


-- ============================================================
-- 5. تحديث RLS على جدول user_favorites
-- منع المحظور من إضافة أو حذف مفضلاته
-- ============================================================

DROP POLICY IF EXISTS "user_favorites: manage own" ON public.user_favorites;

CREATE POLICY "user_favorites: manage own"
  ON public.user_favorites FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND NOT public.is_banned());


-- ============================================================
-- 6. تحديث RLS على جدول user_visited
-- منع المحظور من تسجيل زياراته للمعالم
-- ============================================================

DROP POLICY IF EXISTS "user_visited: manage own" ON public.user_visited;

CREATE POLICY "user_visited: manage own"
  ON public.user_visited FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND NOT public.is_banned());


-- ============================================================
-- 7. تحديث RLS على جدول conversations (محادثات خيتي)
-- منع المحظور من بدء محادثة جديدة مع خيتي
-- ============================================================

DROP POLICY IF EXISTS "conversations: manage own" ON public.conversations;

CREATE POLICY "conversations: manage own"
  ON public.conversations FOR ALL
  USING  (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id AND NOT public.is_banned());


-- ============================================================
-- 8. تحديث RLS على جدول chat_messages (رسائل خيتي)
-- منع المحظور من إرسال رسائل لخيتي
-- ============================================================

DROP POLICY IF EXISTS "chat_messages: manage own" ON public.chat_messages;

CREATE POLICY "chat_messages: manage own"
  ON public.chat_messages FOR ALL
  USING  (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id AND NOT public.is_banned());


-- ============================================================
-- 9. تحديث RLS على جدول support_chats
-- منع المحظور من فتح محادثة دعم جديدة
-- (المستخدم الضيف / غير المسجّل لا يزال مسموحاً له)
-- ============================================================

DROP POLICY IF EXISTS "anyone_can_start_chat" ON support_chats;

CREATE POLICY "anyone_can_start_chat" ON support_chats
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL            -- ضيف بدون حساب → مسموح دائماً
    OR NOT public.is_banned()     -- مسجّل غير محظور → مسموح
  );


-- ============================================================
-- 10. تحديث RLS على جدول support_messages
-- منع المحظور من إرسال رسائل داخل جلسات الدعم
-- ============================================================

DROP POLICY IF EXISTS "users_send_messages" ON support_messages;

CREATE POLICY "users_send_messages" ON support_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'user'
    AND auth.uid() IS NOT NULL
    AND NOT public.is_banned()
    AND EXISTS (
      SELECT 1 FROM support_chats sc
      WHERE sc.id = chat_id
        AND (sc.user_id = auth.uid() OR sc.user_email = auth.email())
    )
  );


-- ============================================================
-- 11. دالة get_user_email_from_chats()
-- تُستخدم في لوحة الأدمن لعرض البريد الإلكتروني لكل مستخدم
-- (يُستخرج من أول جلسة دعم أنشأها المستخدم)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_email_from_chats(p_user_id UUID)
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_email
  FROM support_chats
  WHERE user_id = p_user_id
  ORDER BY created_at ASC
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_email_from_chats(UUID) TO authenticated;


-- ============================================================
-- ملخص التغييرات
-- ============================================================
-- ** السبب الجذري لعدم عمل الحظر: **
--    سياسة RLS "profiles: update own" كانت تسمح فقط للمستخدم
--    بتعديل ملفه الشخصي، مما يمنع الأدمن من تعديل role الآخرين.
--    الحل: إضافة "profiles: admin update all" + دالة set_user_role()
--
-- الدوال الجديدة:
--   is_banned()               → TRUE إذا كان role = 'banned'
--   set_user_role()           → الأدمن يغير role أي مستخدم بأمان
--   get_user_email_from_chats() → إيميل المستخدم من سجل الدعم
--
-- السياسات المُضافة:
--   profiles: admin update all → الأدمن يعدّل أي profile
--
-- السياسات المُحدَّثة (منع المحظور من الكتابة):
--   profiles          → لا يستطيع تعديل ملفه الشخصي
--   user_favorites    → لا يستطيع إضافة/حذف المفضلات
--   user_visited      → لا يستطيع تسجيل زيارات المعالم
--   conversations     → لا يستطيع بدء محادثة مع خيتي
--   chat_messages     → لا يستطيع إرسال رسائل لخيتي
--   support_chats     → لا يستطيع فتح جلسة دعم جديدة
--   support_messages  → لا يستطيع إرسال رسائل داخل الدعم
--
-- التطبيق (App-level):
--   Layout.tsx → يعرض "تم تعليق حسابك" إذا role = 'banned'
--   Admin.tsx  → يستدعي set_user_role() عبر Supabase RPC
-- ============================================================
-- حظر مستخدم يدوياً:
--   UPDATE profiles SET role = 'banned' WHERE id = '<uuid>';
-- رفع الحظر:
--   UPDATE profiles SET role = 'user'   WHERE id = '<uuid>';
-- ============================================================
