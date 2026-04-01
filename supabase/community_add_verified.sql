-- ─── Account Verification Badge ──────────────────────────────────────────────
-- Adds is_verified column to profiles (admin-grantable blue checkmark)

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT FALSE;

-- Allow admins to update is_verified
DROP POLICY IF EXISTS "Admin can verify users" ON public.profiles;
CREATE POLICY "Admin can verify users"
ON public.profiles FOR UPDATE
USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
