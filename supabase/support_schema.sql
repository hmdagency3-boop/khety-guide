-- =============================================================================
-- Khety Guide — Support System: Supabase SQL Schema
-- =============================================================================
-- Run this in the Supabase SQL Editor (project dashboard → SQL Editor).
-- No transaction wrapper — Supabase SQL Editor handles that automatically.
-- WARNING: Drops existing tables and functions — all data will be lost.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 0. CLEANUP
-- ---------------------------------------------------------------------------
DROP TABLE IF EXISTS support_messages      CASCADE;
DROP TABLE IF EXISTS support_chats         CASCADE;
DROP TABLE IF EXISTS user_location_history CASCADE;
DROP TABLE IF EXISTS user_live_location    CASCADE;
DROP TABLE IF EXISTS user_last_location    CASCADE;

DROP FUNCTION IF EXISTS set_updated_at();
DROP FUNCTION IF EXISTS get_support_chat_by_token(UUID);
DROP FUNCTION IF EXISTS get_support_messages_by_token(UUID);
DROP FUNCTION IF EXISTS send_support_message_by_token(UUID, TEXT, TEXT);
DROP FUNCTION IF EXISTS mark_messages_read_by_token(UUID, TEXT);

-- ---------------------------------------------------------------------------
-- 1. HELPER FUNCTIONS
-- ---------------------------------------------------------------------------

-- Auto-update updated_at column
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Admin check used inside RLS policies
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 2. TABLE: support_chats
-- ---------------------------------------------------------------------------
CREATE TABLE support_chats (
  id                  BIGSERIAL         PRIMARY KEY,
  chat_token          UUID              NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  user_id             UUID,
  user_email          TEXT              NOT NULL,
  user_name           TEXT              NOT NULL,

  user_country        TEXT,
  user_device         TEXT,
  user_browser        TEXT,
  user_os             TEXT,
  user_timezone       TEXT,
  user_ip             INET,

  user_latitude       DOUBLE PRECISION,
  user_longitude      DOUBLE PRECISION,
  user_location_city  TEXT,

  status              TEXT              NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open', 'active', 'resolved', 'closed')),

  last_message        TEXT,
  last_message_at     TIMESTAMPTZ,

  unread_admin        INTEGER           NOT NULL DEFAULT 0 CHECK (unread_admin >= 0),
  unread_user         INTEGER           NOT NULL DEFAULT 0 CHECK (unread_user  >= 0),

  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_support_chats_updated_at
  BEFORE UPDATE ON support_chats
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_sc_email    ON support_chats (user_email);
CREATE INDEX idx_sc_user_id  ON support_chats (user_id)   WHERE user_id IS NOT NULL;
CREATE INDEX idx_sc_status   ON support_chats (status);
CREATE INDEX idx_sc_updated  ON support_chats (updated_at DESC);
CREATE INDEX idx_sc_token    ON support_chats (chat_token);

-- RLS
ALTER TABLE support_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_chats" ON support_chats
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY "users_own_chats" ON support_chats
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND (user_id = auth.uid() OR user_email = auth.email())
  );

-- Anyone (including anonymous) can start a new support chat
CREATE POLICY "anyone_can_start_chat" ON support_chats
  FOR INSERT
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- 3. TABLE: support_messages
-- ---------------------------------------------------------------------------
CREATE TABLE support_messages (
  id          BIGSERIAL     PRIMARY KEY,
  chat_id     BIGINT        NOT NULL
                REFERENCES support_chats(id) ON DELETE CASCADE,

  sender_type TEXT          NOT NULL CHECK (sender_type IN ('user', 'admin')),
  sender_name TEXT          NOT NULL,
  content     TEXT          NOT NULL,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sm_chat    ON support_messages (chat_id);
CREATE INDEX idx_sm_created ON support_messages (created_at);

-- RLS
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_messages" ON support_messages
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY "users_own_messages_select" ON support_messages
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM support_chats sc
      WHERE sc.id = chat_id
        AND (sc.user_id = auth.uid() OR sc.user_email = auth.email())
    )
  );

CREATE POLICY "users_send_messages" ON support_messages
  FOR INSERT
  WITH CHECK (
    sender_type = 'user'
    AND auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM support_chats sc
      WHERE sc.id = chat_id
        AND (sc.user_id = auth.uid() OR sc.user_email = auth.email())
    )
  );

-- ---------------------------------------------------------------------------
-- 4. TABLE: user_live_location
-- ---------------------------------------------------------------------------
CREATE TABLE user_live_location (
  id            BIGSERIAL         PRIMARY KEY,
  user_id       UUID,
  user_email    TEXT              NOT NULL UNIQUE,
  user_name     TEXT,
  session_id    TEXT,
  latitude      DOUBLE PRECISION  NOT NULL,
  longitude     DOUBLE PRECISION  NOT NULL,
  accuracy      DOUBLE PRECISION,
  altitude      DOUBLE PRECISION,
  speed         DOUBLE PRECISION,
  heading       DOUBLE PRECISION,
  city          TEXT,
  country       TEXT,
  address       TEXT,
  is_sharing    BOOLEAN           NOT NULL DEFAULT TRUE,
  last_updated  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ull_user_id      ON user_live_location (user_id)      WHERE user_id IS NOT NULL;
CREATE INDEX idx_ull_last_updated ON user_live_location (last_updated DESC);

ALTER TABLE user_live_location ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_live_loc" ON user_live_location
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY "users_own_live_loc_select" ON user_live_location
  FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "users_own_live_loc_insert" ON user_live_location
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "users_own_live_loc_update" ON user_live_location
  FOR UPDATE
  USING     (user_email = auth.email())
  WITH CHECK(user_email = auth.email());

-- ---------------------------------------------------------------------------
-- 5. TABLE: user_location_history
-- ---------------------------------------------------------------------------
CREATE TABLE user_location_history (
  id          BIGSERIAL         PRIMARY KEY,
  user_id     UUID,
  user_email  TEXT,
  session_id  TEXT,
  latitude    DOUBLE PRECISION  NOT NULL,
  longitude   DOUBLE PRECISION  NOT NULL,
  accuracy    DOUBLE PRECISION,
  altitude    DOUBLE PRECISION,
  speed       DOUBLE PRECISION,
  heading     DOUBLE PRECISION,
  city        TEXT,
  country     TEXT,
  address     TEXT,
  source      TEXT              NOT NULL DEFAULT 'gps'
                CHECK (source IN ('gps', 'ip', 'manual', 'sos')),
  device_info TEXT,
  created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ulh_email   ON user_location_history (user_email) WHERE user_email IS NOT NULL;
CREATE INDEX idx_ulh_created ON user_location_history (created_at DESC);

ALTER TABLE user_location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_loc_history" ON user_location_history
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY "users_own_loc_history_select" ON user_location_history
  FOR SELECT USING (user_id = auth.uid() OR user_email = auth.email());

CREATE POLICY "users_own_loc_history_insert" ON user_location_history
  FOR INSERT WITH CHECK (user_email = auth.email());

-- ---------------------------------------------------------------------------
-- 6. TABLE: user_last_location
-- ---------------------------------------------------------------------------
CREATE TABLE user_last_location (
  user_id         TEXT              PRIMARY KEY,
  user_email      TEXT,
  user_name       TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  city            TEXT,
  country         TEXT,
  address         TEXT,
  total_locations INTEGER           NOT NULL DEFAULT 0 CHECK (total_locations >= 0),
  first_seen_at   TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ull2_email     ON user_last_location (user_email)   WHERE user_email IS NOT NULL;
CREATE INDEX idx_ull2_last_seen ON user_last_location (last_seen_at DESC);

ALTER TABLE user_last_location ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_all_last_loc" ON user_last_location
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY "users_own_last_loc_select" ON user_last_location
  FOR SELECT USING (user_id = auth.uid()::text OR user_email = auth.email());

CREATE POLICY "users_own_last_loc_insert" ON user_last_location
  FOR INSERT WITH CHECK (user_email = auth.email());

CREATE POLICY "users_own_last_loc_update" ON user_last_location
  FOR UPDATE
  USING     (user_email = auth.email())
  WITH CHECK(user_email = auth.email());

-- ---------------------------------------------------------------------------
-- 7. RPC FUNCTIONS (SECURITY DEFINER — bypass RLS for anonymous access)
-- ---------------------------------------------------------------------------

-- Get a chat by its secret token
CREATE OR REPLACE FUNCTION get_support_chat_by_token(p_token UUID)
RETURNS SETOF support_chats
LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT * FROM support_chats WHERE chat_token = p_token LIMIT 1;
$$;

-- Get messages for a chat by token
CREATE OR REPLACE FUNCTION get_support_messages_by_token(p_token UUID)
RETURNS SETOF support_messages
LANGUAGE SQL SECURITY DEFINER STABLE AS $$
  SELECT sm.*
  FROM support_messages sm
  JOIN support_chats sc ON sc.id = sm.chat_id
  WHERE sc.chat_token = p_token
  ORDER BY sm.created_at ASC;
$$;

-- Send a user message by token (only sender_type = 'user' is allowed)
CREATE OR REPLACE FUNCTION send_support_message_by_token(
  p_token       UUID,
  p_content     TEXT,
  p_sender_name TEXT
)
RETURNS support_messages
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_chat   support_chats;
  v_msg    support_messages;
BEGIN
  SELECT * INTO v_chat FROM support_chats WHERE chat_token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Chat not found';
  END IF;

  INSERT INTO support_messages (chat_id, sender_type, sender_name, content)
  VALUES (v_chat.id, 'user', p_sender_name, p_content)
  RETURNING * INTO v_msg;

  UPDATE support_chats
  SET
    last_message    = LEFT(p_content, 200),
    last_message_at = NOW(),
    status          = CASE
                        WHEN status IN ('closed', 'resolved') THEN status
                        ELSE 'active'
                      END,
    unread_admin    = unread_admin + 1
  WHERE id = v_chat.id;

  RETURN v_msg;
END;
$$;

-- Mark messages as read and reset unread counter
CREATE OR REPLACE FUNCTION mark_messages_read_by_token(p_token UUID, p_side TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_chat_id BIGINT;
  v_sender  TEXT;
BEGIN
  SELECT id INTO v_chat_id FROM support_chats WHERE chat_token = p_token LIMIT 1;
  IF NOT FOUND THEN RETURN; END IF;

  v_sender := CASE p_side WHEN 'user' THEN 'admin' ELSE 'user' END;

  UPDATE support_messages
  SET read_at = NOW()
  WHERE chat_id    = v_chat_id
    AND sender_type = v_sender
    AND read_at    IS NULL;

  IF p_side = 'user' THEN
    UPDATE support_chats SET unread_user  = 0 WHERE id = v_chat_id;
  ELSE
    UPDATE support_chats SET unread_admin = 0 WHERE id = v_chat_id;
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 8. GRANTS
-- ---------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- support_chats
GRANT INSERT                 ON support_chats TO anon;
GRANT SELECT, INSERT, UPDATE ON support_chats TO authenticated;

-- support_messages
GRANT INSERT                 ON support_messages TO anon;
GRANT SELECT, INSERT, UPDATE ON support_messages TO authenticated;

-- location tables (authenticated only)
GRANT SELECT, INSERT, UPDATE ON user_live_location    TO authenticated;
GRANT SELECT, INSERT         ON user_location_history  TO authenticated;
GRANT SELECT, INSERT, UPDATE ON user_last_location     TO authenticated;

-- sequences
GRANT USAGE ON SEQUENCE support_chats_id_seq          TO anon, authenticated;
GRANT USAGE ON SEQUENCE support_messages_id_seq        TO anon, authenticated;
GRANT USAGE ON SEQUENCE user_live_location_id_seq      TO authenticated;
GRANT USAGE ON SEQUENCE user_location_history_id_seq   TO authenticated;

-- RPC functions
GRANT EXECUTE ON FUNCTION get_support_chat_by_token(UUID)                 TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_support_messages_by_token(UUID)             TO anon, authenticated;
GRANT EXECUTE ON FUNCTION send_support_message_by_token(UUID, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION mark_messages_read_by_token(UUID, TEXT)         TO anon, authenticated;
GRANT EXECUTE ON FUNCTION is_admin()                                       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION set_updated_at()                                 TO authenticated;
