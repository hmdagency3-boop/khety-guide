-- App Settings Table for Khety Guide Admin Panel
-- ✅ آمن للتشغيل أكثر من مرة — يضيف فوق الموجود بدون أخطاء
-- Run this in Supabase SQL Editor

-- 1. إنشاء الجدول إن لم يكن موجوداً
CREATE TABLE IF NOT EXISTS public.app_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. تفعيل RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- 3. حذف السياسات القديمة وإعادة إنشاؤها (يتجنب خطأ "policy already exists")
DROP POLICY IF EXISTS "Public can read app_settings"   ON public.app_settings;
DROP POLICY IF EXISTS "Admins can modify app_settings" ON public.app_settings;

CREATE POLICY "Public can read app_settings"
  ON public.app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can modify app_settings"
  ON public.app_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. إدراج كل الإعدادات (يتجاهل المفاتيح الموجودة مسبقاً)
INSERT INTO public.app_settings (key, value) VALUES
  -- الإعدادات الأساسية
  ('maintenance_mode',          'false'),
  ('announcement_enabled',      'false'),
  ('announcement_text',         ''),
  ('announcement_color',        'info'),

  -- إعدادات الصيانة المتقدمة (جديدة)
  ('maintenance_type',          'planned'),
  ('maintenance_message_ar',    'نعمل على تحسين تجربتك. سنعود قريباً!'),
  ('maintenance_message_en',    'We''re working to improve your experience. We''ll be back soon!'),
  ('maintenance_end_time',      ''),
  ('maintenance_progress',      '0'),
  ('maintenance_contact_email', '')
ON CONFLICT (key) DO NOTHING;

-- للتحقق بعد التشغيل:
-- SELECT key, value FROM public.app_settings ORDER BY key;
