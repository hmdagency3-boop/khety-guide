-- ══════════════════════════════════════════════════════════════
--  شغّل هذا الملف كاملاً في Supabase → SQL Editor
--  يحتوي على: جدول VIP + الدالتين اللازمتين للتحقق من الأكواد
-- ══════════════════════════════════════════════════════════════

-- 1. إنشاء جدول VIP Codes
CREATE TABLE IF NOT EXISTS vip_invite_codes (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  code          text        NOT NULL UNIQUE,
  welcome_title text        NOT NULL DEFAULT 'أهلاً بك في مجتمعنا',
  welcome_msg   text        NOT NULL DEFAULT 'يسعدنا انضمامك إلى عائلة دليل الفراعنة',
  welcome_glyph text        NOT NULL DEFAULT '𓇳',
  is_active     boolean     DEFAULT true,
  max_uses      int         DEFAULT NULL,
  used_count    int         DEFAULT 0,
  created_at    timestamptz DEFAULT now()
);

-- 2. إضافة أعمدة VIP لجدول profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vip       boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vip_code_used text    DEFAULT NULL;

-- 3. تفعيل RLS
ALTER TABLE vip_invite_codes ENABLE ROW LEVEL SECURITY;

-- 4. سياسات الصلاحيات
DROP POLICY IF EXISTS "vip_codes_admin_all"          ON vip_invite_codes;
DROP POLICY IF EXISTS "vip_codes_authenticated_read" ON vip_invite_codes;

CREATE POLICY "vip_codes_admin_all"
  ON vip_invite_codes FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 5. دالة التحقق من الكود (تعمل حتى قبل التسجيل - anon)
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
  SELECT * INTO v_vip_row
  FROM vip_invite_codes
  WHERE UPPER(code) = UPPER(p_code)
    AND is_active = true;

  IF FOUND THEN
    IF v_vip_row.max_uses IS NULL OR v_vip_row.used_count < v_vip_row.max_uses THEN
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

  SELECT COUNT(*) INTO v_inv_count
  FROM profiles
  WHERE UPPER(invite_code) = UPPER(p_code);

  IF v_inv_count > 0 THEN
    RETURN json_build_object('type', 'invite');
  END IF;

  RETURN json_build_object('type', 'invalid');
END;
$$;

GRANT EXECUTE ON FUNCTION validate_invite_code(text) TO anon;
GRANT EXECUTE ON FUNCTION validate_invite_code(text) TO authenticated;

-- 6. دالة استرداد كود VIP بعد التسجيل (تحديث الملف الشخصي)
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

  UPDATE profiles
  SET is_vip = true, vip_code_used = v_row.code
  WHERE id = v_uid;

  UPDATE vip_invite_codes
  SET used_count = used_count + 1
  WHERE id = v_row.id;

  RETURN json_build_object('ok', true);
END;
$$;

GRANT EXECUTE ON FUNCTION check_vip_code(text) TO authenticated;
