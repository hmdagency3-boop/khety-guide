-- Install Gate Setting — شاشة تنزيل التطبيق
-- ✅ آمن للتشغيل أكثر من مرة
-- Run this in Supabase SQL Editor

-- إضافة إعداد شاشة التنزيل إلى جدول app_settings
-- (الجدول يجب أن يكون موجوداً مسبقاً — شغّل supabase_app_settings.sql أولاً إذا لم يكن)

INSERT INTO public.app_settings (key, value)
VALUES ('install_gate_enabled', 'false')
ON CONFLICT (key) DO NOTHING;

-- للتحقق:
-- SELECT key, value FROM public.app_settings WHERE key = 'install_gate_enabled';
