-- Visibility Settings for Khety Guide Admin Panel
-- ✅ آمن للتشغيل أكثر من مرة — يضيف فوق الموجود بدون أخطاء
-- Run this in Supabase SQL Editor
-- ⚠️ تأكد أنك شغّلت supabase_app_settings.sql أولاً لإنشاء الجدول والسياسات

-- إدراج إعدادات ظهور الصفحات (كل الصفحات مفعّلة افتراضياً)
INSERT INTO public.app_settings (key, value) VALUES
  (
    'page_visibility',
    '{"home":true,"explore":true,"map":true,"chat":true,"safety":true,"transit":true,"guides":true,"support":true}'
  )
ON CONFLICT (key) DO NOTHING;

-- إدراج إعدادات ظهور تابات لوحة الإدارة (كل التابات مفعّلة افتراضياً)
INSERT INTO public.app_settings (key, value) VALUES
  (
    'admin_tabs_visibility',
    '{"support_chats":true,"overview":true,"notifications":true,"analytics":true,"landmarks":true,"users":true,"conversations":true,"live_users":true,"visitors":true,"locations":true,"welcome_media":true,"settings":true,"audit_log":true,"reports":true,"static_content":true,"banners":true}'
  )
ON CONFLICT (key) DO NOTHING;

-- للتحقق بعد التشغيل:
-- SELECT key, value FROM public.app_settings WHERE key IN ('page_visibility', 'admin_tabs_visibility');
