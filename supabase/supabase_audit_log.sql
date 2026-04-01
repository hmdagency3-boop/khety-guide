-- Admin Audit Log Table for Khety Guide
-- ✅ آمن للتشغيل أكثر من مرة
-- Run this in Supabase SQL Editor

-- 1. إنشاء جدول سجل الأحداث
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id    uuid,
  admin_name  text,
  action_type text NOT NULL,
  target_type text,
  target_name text,
  details     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- 2. فهرس للأداء (الاستعلامات حسب التاريخ)
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON public.admin_audit_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_action  ON public.admin_audit_log (action_type);

-- 3. تفعيل RLS
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الأمان
DROP POLICY IF EXISTS "Admins can read audit log"   ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can insert audit log"  ON public.admin_audit_log;

-- الأدمن فقط يمكنه قراءة السجل
CREATE POLICY "Admins can read audit log"
  ON public.admin_audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- الأدمن فقط يمكنه إضافة سجلات
CREATE POLICY "Admins can insert audit log"
  ON public.admin_audit_log FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. أنواع الإجراءات المسجّلة (للمرجعية):
--    ban_user          → حظر مستخدم
--    unban_user        → رفع الحظر عن مستخدم
--    delete_user       → حذف مستخدم
--    promote_admin     → ترقية مستخدم لأدمن
--    demote_admin      → إزالة صلاحية الأدمن
--    delete_landmark   → حذف معلم
--    publish_landmark  → نشر معلم
--    unpublish_landmark→ إخفاء معلم
--    delete_conv       → حذف محادثة AI
--    change_setting    → تغيير إعداد (maintenance_mode ...)
--    send_notification → إرسال إشعار
--    delete_media      → حذف وسائط ترحيب

-- للتحقق بعد التشغيل:
-- SELECT * FROM public.admin_audit_log ORDER BY created_at DESC LIMIT 20;
