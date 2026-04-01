-- ══════════════════════════════════════════════════════════════════════
--  Khety Guide — Gallery + Canned Replies + Sub-Admin Roles
--  شغّل هذا الملف كاملاً مرة واحدة في Supabase → SQL Editor
-- ══════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────
-- STEP 0 : أضف عمود admin_role أولاً
--          (لازم يكون موجود قبل تحديث دالة is_admin)
-- ─────────────────────────────────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS admin_role text DEFAULT NULL;

COMMENT ON COLUMN profiles.admin_role IS
  'NULL = سوبر أدمن (يتطلب role=admin) | content_admin | support_admin';

-- ─────────────────────────────────────────────────────────────────────
-- STEP 1 : حدّث دالة is_admin() لتقبل أدمن المحتوى والدعم أيضاً
--
--  القاعدة الجديدة:
--    • role = ''admin''              → سوبر أدمن (كل الصلاحيات)
--    • admin_role IS NOT NULL        → أدمن محتوى أو دعم
--
--  الدالة SECURITY DEFINER فتتجاوز RLS وتقرأ profiles مباشرةً
-- ─────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (
        role = 'admin'
        OR (admin_role IS NOT NULL AND admin_role <> '')
      )
  );
$$;

-- ─────────────────────────────────────────────────────────────────────
-- STEP 2 : جدول landmark_images (معرض الصور المتعددة)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS landmark_images (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  landmark_id text        NOT NULL REFERENCES landmarks(id) ON DELETE CASCADE,
  image_url   text        NOT NULL,
  caption     text,
  caption_ar  text,
  sort_order  integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

ALTER TABLE landmark_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_landmark_images"  ON landmark_images;
DROP POLICY IF EXISTS "admin_manage_landmark_images" ON landmark_images;

CREATE POLICY "public_read_landmark_images"
  ON landmark_images FOR SELECT USING (true);

CREATE POLICY "admin_manage_landmark_images"
  ON landmark_images FOR ALL USING (is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- STEP 3 : Storage bucket للصور (landmark-gallery)
-- ─────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
  VALUES ('landmark-gallery', 'landmark-gallery', true)
  ON CONFLICT (id) DO NOTHING;

-- أسقط السياسات القديمة أولاً لتجنب التعارض
DROP POLICY IF EXISTS "public_read_gallery"   ON storage.objects;
DROP POLICY IF EXISTS "admin_upload_gallery"  ON storage.objects;
DROP POLICY IF EXISTS "admin_delete_gallery"  ON storage.objects;
DROP POLICY IF EXISTS "admin_update_gallery"  ON storage.objects;

CREATE POLICY "public_read_gallery"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'landmark-gallery');

CREATE POLICY "admin_upload_gallery"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'landmark-gallery' AND is_admin());

CREATE POLICY "admin_update_gallery"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'landmark-gallery' AND is_admin());

CREATE POLICY "admin_delete_gallery"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'landmark-gallery' AND is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- STEP 4 : جدول canned_replies (الردود السريعة)
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS canned_replies (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title      text        NOT NULL,
  title_ar   text,
  body       text        NOT NULL,
  body_ar    text,
  category   text        DEFAULT 'general',
  sort_order integer     DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE canned_replies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_canned_replies" ON canned_replies;

CREATE POLICY "admin_manage_canned_replies"
  ON canned_replies FOR ALL USING (is_admin());

-- ردود أولية (لن تُضاف لو موجودة بالفعل)
INSERT INTO canned_replies (title, title_ar, body, body_ar, category, sort_order)
VALUES
  ('ترحيب',          'Welcome',       'أهلاً وسهلاً! كيف يمكنني مساعدتك اليوم؟',               'Welcome! How can I assist you today?',                          'general', 0),
  ('ساعات العمل',    'Opening Hours', 'تفتح معظم المواقع الأثرية من 6 صباحاً حتى 10 مساءً.',   'Most sites open 6 AM – 10 PM. Check before visiting.',          'info',    1),
  ('أسعار التذاكر',  'Ticket Prices', 'تتفاوت أسعار التذاكر حسب الموقع. راجع صفحة المعلم.',   'Prices vary by site. Check the landmark page for details.',     'info',    2),
  ('شكراً',          'Thank You',     'شكراً لتواصلك معنا! هل هناك شيء آخر يمكنني مساعدتك به؟','Thank you! Is there anything else I can help with?',           'general', 3)
ON CONFLICT DO NOTHING;

-- ══════════════════════════════════════════════════════════════════════
--  كيفية تعيين الصلاحيات (للمرجع — لا تشغّل إلا عند الحاجة)
-- ══════════════════════════════════════════════════════════════════════
--
--  ① سوبر أدمن (يرى كل التابات):
--       UPDATE profiles
--       SET role = 'admin', admin_role = NULL
--       WHERE id = 'your-user-uuid';
--
--  ② أدمن محتوى (معالم / بانرات / وسائط):
--       UPDATE profiles
--       SET admin_role = 'content_admin'
--       WHERE id = 'your-user-uuid';
--
--  ③ أدمن دعم (شات / مستخدمين / ردود سريعة):
--       UPDATE profiles
--       SET admin_role = 'support_admin'
--       WHERE id = 'your-user-uuid';
--
--  ④ إلغاء كل الصلاحيات:
--       UPDATE profiles
--       SET role = 'user', admin_role = NULL
--       WHERE id = 'your-user-uuid';
--
--  ملاحظة: يمكنك معرفة uuid المستخدم من:
--       SELECT id, email, role, admin_role FROM profiles ORDER BY created_at DESC;
-- ══════════════════════════════════════════════════════════════════════
