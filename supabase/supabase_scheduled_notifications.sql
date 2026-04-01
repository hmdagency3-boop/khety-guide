-- ═══════════════════════════════════════════════════════════════════
-- scheduled_notifications  — run this once in the Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS scheduled_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT        NOT NULL,
  title_ar        TEXT,
  body            TEXT        NOT NULL,
  body_ar         TEXT,
  type            TEXT        NOT NULL DEFAULT 'info'
                    CHECK (type IN ('info','success','warning','alert')),
  target_type     TEXT        NOT NULL DEFAULT 'all'
                    CHECK (target_type IN ('all','user')),
  target_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  send_at         TIMESTAMPTZ NOT NULL,
  sent_at         TIMESTAMPTZ,
  status          TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','processing','sent','failed','cancelled')),
  error_message   TEXT,
  created_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE scheduled_notifications ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "admins_all_scheduled"
  ON scheduled_notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Index for the background-job query
CREATE INDEX IF NOT EXISTS idx_sched_notif_status_at
  ON scheduled_notifications (status, send_at);
