-- Add is_official column to profiles
-- Run this in Supabase SQL Editor

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_official boolean NOT NULL DEFAULT false;

-- Allow admins to update is_official (reuses the same admin policy if already set)
-- If you have a policy named "admin full access" already, this may already be covered.
-- Otherwise add a targeted policy:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'admin can set official'
  ) THEN
    EXECUTE $policy$
      CREATE POLICY "admin can set official"
        ON profiles FOR UPDATE
        USING (
          EXISTS (
            SELECT 1 FROM profiles p
            WHERE p.id = auth.uid()
              AND p.role = 'admin'
          )
        );
    $policy$;
  END IF;
END
$$;
