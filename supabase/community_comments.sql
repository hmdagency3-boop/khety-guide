-- Community comments table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS community_comments (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id      uuid        NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id      uuid        NOT NULL REFERENCES auth.users(id)      ON DELETE CASCADE,
  content      text        NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  author_name  text,
  author_avatar text,
  author_verified boolean  DEFAULT false,
  author_official boolean  DEFAULT false,
  created_at   timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS community_comments_post_id_idx ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS community_comments_user_id_idx ON community_comments(user_id);

-- RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments: anyone can read"
  ON community_comments FOR SELECT USING (true);

CREATE POLICY "comments: authenticated can insert"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comments: owner can delete"
  ON community_comments FOR DELETE
  USING (auth.uid() = user_id);

-- Admin can delete any comment
CREATE POLICY "comments: admin can delete"
  ON community_comments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );
