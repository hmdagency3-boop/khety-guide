-- ============================================================
-- Khety Guide – إضافات جديدة
-- تشغيل هذا الملف في Supabase → SQL Editor
-- ============================================================


-- ============================================================
-- 7. VISITOR_FINGERPRINTS – تتبع الزوار وبصماتهم
-- ============================================================

CREATE TABLE IF NOT EXISTS public.visitor_fingerprints (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fingerprint_id TEXT UNIQUE NOT NULL,      -- SHA-256 hash من بيانات الجهاز
  ip_address     TEXT,                      -- عنوان الـ IP
  user_agent     TEXT,                      -- User-Agent الكامل (حتى 500 حرف)
  device_name    TEXT,                      -- اسم الجهاز (iPhone, Galaxy S21, ...)
  browser        TEXT,                      -- المتصفح (Chrome, Safari, ...)
  os             TEXT,                      -- نظام التشغيل (iOS, Android, Windows, ...)
  screen         TEXT,                      -- دقة الشاشة مثل 390x844
  timezone       TEXT,                      -- المنطقة الزمنية مثل Africa/Cairo
  language       TEXT,                      -- اللغة مثل ar-EG
  canvas_hash    TEXT,                      -- بصمة canvas (للتعرف الدقيق)
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,  -- ربط بالمستخدم إن سجّل

  visit_count    INTEGER NOT NULL DEFAULT 1,  -- عدد مرات الدخول
  first_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- أول زيارة
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()   -- آخر زيارة
);

CREATE INDEX IF NOT EXISTS idx_visitor_fingerprints_fingerprint_id
  ON public.visitor_fingerprints(fingerprint_id);

CREATE INDEX IF NOT EXISTS idx_visitor_fingerprints_ip
  ON public.visitor_fingerprints(ip_address);

CREATE INDEX IF NOT EXISTS idx_visitor_fingerprints_user_id
  ON public.visitor_fingerprints(user_id);

CREATE INDEX IF NOT EXISTS idx_visitor_fingerprints_first_seen
  ON public.visitor_fingerprints(first_seen_at DESC);

-- دالة لزيادة عداد الزيارات
CREATE OR REPLACE FUNCTION public.increment_visit_count(fid TEXT)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.visitor_fingerprints
  SET visit_count = visit_count + 1,
      last_seen_at = NOW()
  WHERE fingerprint_id = fid;
$$;

-- RLS
ALTER TABLE public.visitor_fingerprints ENABLE ROW LEVEL SECURITY;

-- الزوار يُدرجون فقط (بدون قراءة) — الأدمن يقرأ الكل
CREATE POLICY "visitor_fingerprints: insert"
  ON public.visitor_fingerprints FOR INSERT
  WITH CHECK (true);

CREATE POLICY "visitor_fingerprints: update own"
  ON public.visitor_fingerprints FOR UPDATE
  USING (true);

CREATE POLICY "visitor_fingerprints: admin read"
  ON public.visitor_fingerprints FOR SELECT
  USING (public.is_admin());


-- ============================================================
-- 8. WELCOME_MEDIA – الوسائط الترحيبية (صورة أو فيديو)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.welcome_media (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_url    TEXT NOT NULL,                      -- رابط الملف من Supabase Storage
  media_type   TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  duration     INTEGER NOT NULL DEFAULT 5,          -- مدة العرض بالثواني (للصور)
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,        -- هل هو المعروض حالياً؟
  display_mode TEXT NOT NULL DEFAULT 'first_time'   -- 'first_time' | 'always'
                CHECK (display_mode IN ('first_time', 'always')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- إضافة العمود لو الجدول موجود بالفعل بدون العمود
ALTER TABLE public.welcome_media
  ADD COLUMN IF NOT EXISTS display_mode TEXT NOT NULL DEFAULT 'first_time'
  CHECK (display_mode IN ('first_time', 'always'));

-- RLS
ALTER TABLE public.welcome_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "welcome_media: public read"
  ON public.welcome_media FOR SELECT
  USING (true);

CREATE POLICY "welcome_media: admin manage"
  ON public.welcome_media FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- Storage Bucket: welcome-to-pocket
-- ملاحظة: أنشئ البوكيت يدوياً في Supabase Dashboard → Storage
-- اسم البوكيت: welcome-to-pocket
-- اجعله Public bucket
-- ============================================================

-- سياسة Storage للأدمن فقط (رفع + حذف)
-- قم بإضافة هذا في Dashboard → Storage → Policies
-- أو نفّذه هنا إذا كانت الصلاحيات متاحة:

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'welcome-to-pocket',
  'welcome-to-pocket',
  true,
  104857600,   -- 100 MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO NOTHING;

-- سياسة القراءة العامة للملفات
CREATE POLICY "welcome-to-pocket: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'welcome-to-pocket');

-- سياسة رفع الأدمن فقط
CREATE POLICY "welcome-to-pocket: admin upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'welcome-to-pocket'
    AND public.is_admin()
  );

-- سياسة حذف الأدمن
CREATE POLICY "welcome-to-pocket: admin delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'welcome-to-pocket'
    AND public.is_admin()
  );


-- ============================================================
-- ملخص الإضافات الجديدة
-- ============================================================
-- visitor_fingerprints  → تتبع بصمة كل زائر (IP + جهاز + متصفح + ...)
-- welcome_media         → صورة/فيديو ترحيبي يُعرض أول مرة
-- welcome-to-pocket     → بوكيت التخزين للوسائط الترحيبية
-- increment_visit_count → دالة لزيادة عداد الزيارات
-- ============================================================
