-- ============================================================
-- إصلاح نهائي: حذف تريجر prevent_role_escalation تماماً
-- ============================================================
-- التريجر ده هو السبب الوحيد لرجوع role و admin_role لـ 'user'
-- الأمان موجود بالفعل في:
--   ✅ RLS: "profiles: admin update all" — فقط الأدمن يعدّل
--   ✅ RLS: "profiles: update own" — المستخدم يعدّل نفسه فقط
--   ✅ set_user_role() RPC — بتتحقق من الصلاحيات داخلياً
-- ============================================================

-- الخطوة 1: حذف التريجر
DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;

-- الخطوة 2: حذف الدالة
DROP FUNCTION IF EXISTS public.prevent_role_escalation();

-- الخطوة 3: تعيين role = 'admin' لإيميلك
-- *** غيّر الإيميل بالإيميل الصحيح بتاعك ***
UPDATE public.profiles
SET role = 'admin', updated_at = NOW()
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'YOUR-EMAIL-HERE'
  LIMIT 1
);

-- ============================================================
-- تحقق من النتيجة:
-- SELECT u.email, p.role, p.admin_role
-- FROM public.profiles p
-- JOIN auth.users u ON u.id = p.id
-- WHERE p.role = 'admin';
-- ============================================================
