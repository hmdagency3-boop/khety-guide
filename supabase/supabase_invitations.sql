-- ============================================================
-- Khety Guide – Invitation / Referral System
-- تشغيل هذا الملف بعد supabase_schema.sql
-- ============================================================

-- 1. Add invite columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS invite_code   TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS invite_points INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS referred_by   UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 2. Function: generate a unique 8-char alphanumeric invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code  TEXT := '';
  i     INT;
BEGIN
  FOR i IN 1..8 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$;

-- 3. Backfill existing users who have no invite_code yet
DO $$
DECLARE
  rec RECORD;
  new_code TEXT;
BEGIN
  FOR rec IN SELECT id FROM public.profiles WHERE invite_code IS NULL LOOP
    LOOP
      new_code := public.generate_invite_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE invite_code = new_code);
    END LOOP;
    UPDATE public.profiles SET invite_code = new_code WHERE id = rec.id;
  END LOOP;
END;
$$;

-- 4. Update handle_new_user to also set invite_code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_code TEXT;
BEGIN
  LOOP
    new_code := public.generate_invite_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.profiles WHERE invite_code = new_code);
  END LOOP;

  INSERT INTO public.profiles (id, display_name, role, invite_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'user',
    new_code
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 5. Invitations table
CREATE TABLE IF NOT EXISTS public.invitations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (invitee_id)  -- each user can only be referred once
);

ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invitations: inviter can read own"
  ON public.invitations FOR SELECT
  USING (auth.uid() = inviter_id OR public.is_admin());

CREATE POLICY "invitations: insert via function only"
  ON public.invitations FOR INSERT
  WITH CHECK (FALSE);

-- 6. SECURITY DEFINER function to redeem an invite code
--    Called from frontend right after a new user registers
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_inviter_id UUID;
  v_invitee_id UUID := auth.uid();
BEGIN
  -- Must be logged in
  IF v_invitee_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Already redeemed?
  IF EXISTS (SELECT 1 FROM public.invitations WHERE invitee_id = v_invitee_id) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_redeemed');
  END IF;

  -- Can't use your own code
  SELECT id INTO v_inviter_id
    FROM public.profiles
    WHERE invite_code = upper(trim(p_code))
      AND id <> v_invitee_id;

  IF v_inviter_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_code');
  END IF;

  -- Record invitation
  INSERT INTO public.invitations (inviter_id, invitee_id)
    VALUES (v_inviter_id, v_invitee_id);

  -- Set referred_by on new user
  UPDATE public.profiles SET referred_by = v_inviter_id WHERE id = v_invitee_id;

  -- Award +50 points to inviter
  UPDATE public.profiles SET invite_points = invite_points + 50 WHERE id = v_inviter_id;

  RETURN jsonb_build_object('ok', true, 'inviter_id', v_inviter_id);
END;
$$;

-- 7. Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(TEXT) TO authenticated;
