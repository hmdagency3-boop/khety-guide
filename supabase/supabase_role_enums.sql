-- ============================================================
-- تقييد قيم role و admin_role في جدول profiles
-- باستخدام CHECK constraints (أكثر أماناً من ENUM)
-- ✅ لا يمس الـ Policies أو النوع — آمن 100%
-- ✅ آمن للتشغيل أكثر من مرة
-- Run this in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. إضافة CHECK على عمود role
--    القيم المسموحة: 'user' | 'admin' | 'banned'
-- ─────────────────────────────────────────────────────────────

-- نشيل القيد القديم لو موجود، ثم نضيف الجديد
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('user', 'admin', 'banned'));

-- ─────────────────────────────────────────────────────────────
-- 2. إضافة عمود admin_role إذا لم يكن موجوداً
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS admin_role TEXT NULL;

-- ─────────────────────────────────────────────────────────────
-- 3. تنظيف أي قيمة غير صالحة قبل إضافة CHECK
-- ─────────────────────────────────────────────────────────────
UPDATE public.profiles
  SET admin_role = NULL
  WHERE admin_role IS NOT NULL
    AND admin_role NOT IN ('super_admin', 'content_admin', 'support_admin');

-- ─────────────────────────────────────────────────────────────
-- 4. إضافة CHECK على عمود admin_role
--    القيم المسموحة: 'super_admin' | 'content_admin' | 'support_admin' | NULL
-- ─────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_admin_role_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_admin_role_check
  CHECK (admin_role IS NULL OR admin_role IN ('super_admin', 'content_admin', 'support_admin'));

-- ─────────────────────────────────────────────────────────────
-- للتحقق بعد التشغيل:
-- SELECT constraint_name, check_clause
-- FROM information_schema.check_constraints
-- WHERE constraint_name IN ('profiles_role_check', 'profiles_admin_role_check');
-- ─────────────────────────────────────────────────────────────

-- القيم المسموحة:
-- role:       'user' | 'admin' | 'banned'
-- admin_role: 'super_admin' | 'content_admin' | 'support_admin' | NULL
