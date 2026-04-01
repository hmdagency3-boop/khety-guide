-- ─── VIP Invite Codes ──────────────────────────────────────────────────────────
-- Admin-created special codes that trigger a personalized welcome modal

CREATE TABLE IF NOT EXISTS vip_invite_codes (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code          text        NOT NULL UNIQUE,
  welcome_title text        NOT NULL DEFAULT 'أهلاً بك في مجتمعنا',
  welcome_msg   text        NOT NULL DEFAULT 'يسعدنا انضمامك إلى عائلة دليل الفراعنة',
  welcome_glyph text        NOT NULL DEFAULT '𓇳',
  is_active     boolean     DEFAULT true,
  max_uses      int         DEFAULT NULL,   -- NULL = unlimited
  used_count    int         DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- Add VIP flag to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vip_code_used text DEFAULT NULL;

-- RLS
ALTER TABLE vip_invite_codes ENABLE ROW LEVEL SECURITY;

-- Drop old policies
DROP POLICY IF EXISTS "vip_codes_admin_all"          ON vip_invite_codes;
DROP POLICY IF EXISTS "vip_codes_authenticated_read" ON vip_invite_codes;

-- Admins can do everything
CREATE POLICY "vip_codes_admin_all"
  ON vip_invite_codes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ─── validate_invite_code ─────────────────────────────────────────────────────
-- Read-only check callable by anon (before registration).
-- For VIP codes: returns welcome data too so we can store it before signUp.
-- Returns: { type: "vip"|"invite"|"invalid", welcome_title?, welcome_msg?, welcome_glyph? }
CREATE OR REPLACE FUNCTION validate_invite_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_vip_row   vip_invite_codes%ROWTYPE;
  v_inv_count int;
BEGIN
  -- 1. Check VIP codes table
  SELECT * INTO v_vip_row
  FROM vip_invite_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true;

  IF FOUND THEN
    IF v_vip_row.max_uses IS NULL OR v_vip_row.used_count < v_vip_row.max_uses THEN
      -- Return VIP welcome data immediately so frontend can store before signup
      RETURN json_build_object(
        'type',          'vip',
        'welcome_title', v_vip_row.welcome_title,
        'welcome_msg',   v_vip_row.welcome_msg,
        'welcome_glyph', v_vip_row.welcome_glyph
      );
    ELSE
      RETURN json_build_object('type', 'invalid', 'reason', 'exhausted');
    END IF;
  END IF;

  -- 2. Check regular invite codes in profiles
  SELECT COUNT(*) INTO v_inv_count
  FROM profiles
  WHERE UPPER(invite_code) = UPPER(p_code);

  IF v_inv_count > 0 THEN
    RETURN json_build_object('type', 'invite');
  END IF;

  RETURN json_build_object('type', 'invalid');
END;
$$;

-- Allow anyone (even before login) to validate a code
GRANT EXECUTE ON FUNCTION validate_invite_code(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_invite_code(text) TO authenticated;

-- ─── check_vip_code ───────────────────────────────────────────────────────────
-- Called AFTER registration to update the profile (mark as VIP + increment counter).
-- Requires authenticated user.
CREATE OR REPLACE FUNCTION check_vip_code(p_code text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row   vip_invite_codes%ROWTYPE;
  v_uid   uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN json_build_object('error', 'not_authenticated');
  END IF;

  SELECT * INTO v_row
  FROM vip_invite_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'not_found');
  END IF;

  IF v_row.max_uses IS NOT NULL AND v_row.used_count >= v_row.max_uses THEN
    RETURN json_build_object('error', 'exhausted');
  END IF;

  -- Mark the user as VIP
  UPDATE profiles
  SET is_vip = true,
      vip_code_used = v_row.code
  WHERE id = v_uid;

  -- Increment usage counter
  UPDATE vip_invite_codes
  SET used_count = used_count + 1
  WHERE id = v_row.id;

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION check_vip_code(text) TO authenticated;
