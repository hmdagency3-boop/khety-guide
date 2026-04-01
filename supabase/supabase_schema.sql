-- ============================================================
-- Khety Guide – دليل الفراعنة
-- Supabase Database Schema
-- ============================================================
-- تشغيل هذا الملف مرة واحدة في Supabase → SQL Editor
-- ============================================================


-- ============================================================
-- 1. PROFILES – الملف الشخصي للمستخدم
-- يتم إنشاؤه تلقائيًا عند تسجيل حساب جديد
-- ============================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name       TEXT,
  avatar_url         TEXT,
  bio                TEXT,
  role               TEXT NOT NULL DEFAULT 'user',   -- 'user' | 'admin'
  country            TEXT,
  preferred_language TEXT DEFAULT 'en',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ترقيم تلقائي لـ updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- إنشاء profile تلقائيًا عند إنشاء مستخدم جديد في auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- دالة مساعدة لفحص صلاحية Admin بدون recursion
-- SECURITY DEFINER = تتجاوز RLS تلقائياً
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

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: read own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "profiles: insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- ============================================================
-- 2. TRAVEL_PROFILES – تفضيلات الرحلة (Onboarding)
-- يُملأ بعد التسجيل مباشرة في صفحة "أكمل تفضيلاتك"
-- ============================================================

CREATE TABLE IF NOT EXISTS public.travel_profiles (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- مدة الزيارة: '1-3' | '4-7' | '8+'
  trip_duration      TEXT,

  -- الغرض من الزيارة (اختيار واحد)
  -- قيم: 'tourism' | 'culture' | 'relaxation' | 'adventure' | 'religious' | 'business' | 'photography'
  visit_purpose      TEXT,

  -- أنواع السياحة المفضلة (اختيار متعدد – مخزن كـ JSON array)
  -- قيم: 'pharaonic' | 'museums' | 'islamic' | 'coptic' | 'beaches' | 'desert' | 'safari' | 'shopping' | 'food' | 'nile'
  tourism_types      JSONB NOT NULL DEFAULT '[]',

  -- المدن المهتم بزيارتها (اختيار متعدد – JSON array)
  -- قيم: 'cairo' | 'giza' | 'luxor' | 'aswan' | 'alexandria' | 'sharm' | 'hurghada' | 'siwa'
  preferred_cities   JSONB NOT NULL DEFAULT '[]',

  -- الميزانية: 'budget' | 'mid' | 'luxury'
  budget_range       TEXT,

  -- عدد المسافرين
  travelers_count    SMALLINT DEFAULT 1 CHECK (travelers_count >= 1),

  -- هل معه أطفال؟
  has_children       BOOLEAN DEFAULT FALSE,

  -- اللغة المفضلة: 'ar' | 'en' | 'fr' | 'de' | 'es' | 'it' | 'zh' | 'ru'
  preferred_language TEXT DEFAULT 'en',

  -- هل هذه أول زيارة لمصر؟
  first_visit        BOOLEAN DEFAULT TRUE,

  -- ملاحظات إضافية حرة (اختياري)
  notes              TEXT,

  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER travel_profiles_updated_at
  BEFORE UPDATE ON public.travel_profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- فهرس للبحث بـ user_id
CREATE INDEX IF NOT EXISTS idx_travel_profiles_user_id ON public.travel_profiles(user_id);

-- RLS
ALTER TABLE public.travel_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "travel_profiles: manage own"
  ON public.travel_profiles FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 3. USER_FAVORITES – المعالم المفضلة
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landmark_id TEXT NOT NULL,    -- يتوافق مع id المعلم في الـ API (مثل 'pyramids-of-giza')
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, landmark_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id ON public.user_favorites(user_id);

-- RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_favorites: manage own"
  ON public.user_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 4. USER_VISITED – المعالم التي تمت زيارتها
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_visited (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landmark_id TEXT NOT NULL,
  visited_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes       TEXT,             -- ملاحظات شخصية عن الزيارة (اختياري)

  UNIQUE (user_id, landmark_id)
);

CREATE INDEX IF NOT EXISTS idx_user_visited_user_id ON public.user_visited(user_id);

-- RLS
ALTER TABLE public.user_visited ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_visited: manage own"
  ON public.user_visited FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 5. CONVERSATIONS – جلسات الدردشة مع خيتي
-- ============================================================

CREATE TABLE IF NOT EXISTS public.conversations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT,              -- عنوان المحادثة (يمكن توليده من الرسالة الأولى)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);

-- RLS
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations: manage own"
  ON public.conversations FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- 6. CHAT_MESSAGES – رسائل الدردشة
-- يتم إدراج رسالة المستخدم ثم تُملأ response بواسطة Edge Function
-- ============================================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,

  -- رسالة المستخدم
  prompt          TEXT NOT NULL,

  -- رد خيتي (يُملأ من Edge Function)
  response        TEXT,

  -- حالة المعالجة: 'pending' | 'done' | 'error'
  status          TEXT NOT NULL DEFAULT 'pending',

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_status ON public.chat_messages(status);

-- RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages: manage own"
  ON public.chat_messages FOR ALL
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- ملخص الجداول
-- ============================================================
-- profiles          → بيانات المستخدم الأساسية (اسم، صورة، دور)
-- travel_profiles   → تفضيلات الرحلة بعد الـ Onboarding (جديد)
-- user_favorites    → المعالم التي أضافها المستخدم لمفضلته
-- user_visited      → المعالم التي زارها المستخدم
-- conversations     → جلسات دردشة خيتي
-- chat_messages     → رسائل ورد خيتي (prompt + response)
-- ============================================================
