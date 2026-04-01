-- ═══════════════════════════════════════════════════════════
--  KHETY GUIDE — Community Feature
--  Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════

-- 0. Clean up any previous partial run
DROP TABLE IF EXISTS public.community_likes CASCADE;
DROP TABLE IF EXISTS public.community_posts CASCADE;

-- 1. Posts table
CREATE TABLE public.community_posts (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content       TEXT        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  image_url     TEXT,
  landmark_id   TEXT,
  location_tag  TEXT,
  likes_count   INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Likes table (prevents duplicate likes)
CREATE TABLE public.community_likes (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id    UUID        NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- 3. Indexes
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_user    ON public.community_posts(user_id);
CREATE INDEX idx_community_likes_post    ON public.community_likes(post_id);
CREATE INDEX idx_community_likes_user    ON public.community_likes(user_id);

-- 4. Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_community_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_community_post_updated ON public.community_posts;
CREATE TRIGGER trg_community_post_updated
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_community_updated_at();

-- 5. Toggle like RPC (atomic increment/decrement)
CREATE OR REPLACE FUNCTION public.toggle_community_like(p_post_id UUID, p_user_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  already_liked BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM public.community_likes
    WHERE post_id = p_post_id AND user_id = p_user_id
  ) INTO already_liked;

  IF already_liked THEN
    DELETE FROM public.community_likes
      WHERE post_id = p_post_id AND user_id = p_user_id;
    UPDATE public.community_posts
      SET likes_count = GREATEST(likes_count - 1, 0)
      WHERE id = p_post_id;
    RETURN FALSE;
  ELSE
    INSERT INTO public.community_likes (user_id, post_id)
      VALUES (p_user_id, p_post_id)
      ON CONFLICT DO NOTHING;
    UPDATE public.community_posts
      SET likes_count = likes_count + 1
      WHERE id = p_post_id;
    RETURN TRUE;
  END IF;
END;
$$;

-- 6. RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Posts policies
CREATE POLICY "community_posts_select" ON public.community_posts
  FOR SELECT USING (true);

CREATE POLICY "community_posts_insert" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_posts_update" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "community_posts_delete" ON public.community_posts
  FOR DELETE USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Likes policies
CREATE POLICY "community_likes_select" ON public.community_likes
  FOR SELECT USING (true);

CREATE POLICY "community_likes_insert" ON public.community_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "community_likes_delete" ON public.community_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Storage bucket
INSERT INTO storage.buckets (id, name, public)
  VALUES ('community-posts', 'community-posts', true)
  ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "community_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "community_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "community_storage_delete" ON storage.objects;

CREATE POLICY "community_storage_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'community-posts');

CREATE POLICY "community_storage_insert" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'community-posts'
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "community_storage_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'community-posts'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Done ✓
