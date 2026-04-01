-- ============================================================
-- Khety Guide — System Notifications + Web Push
-- Run this in your Supabase SQL Editor
-- ⚠️  يحذف كل الجداول القديمة ويعيد إنشاءها من الصفر
-- ============================================================

-- ── حذف كل شيء قديم (بالترتيب الصحيح) ─────────────────────

DROP VIEW  IF EXISTS my_notifications CASCADE;

DROP TABLE IF EXISTS push_subscriptions   CASCADE;
DROP TABLE IF EXISTS notification_reads   CASCADE;
DROP TABLE IF EXISTS system_notifications CASCADE;

-- ============================================================
-- 1. system_notifications
-- ============================================================

CREATE TABLE system_notifications (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title          text        NOT NULL,
  title_ar       text,
  body           text        NOT NULL,
  body_ar        text,
  type           text        NOT NULL DEFAULT 'info'
                             CHECK (type IN ('info', 'warning', 'success', 'alert')),
  target_type    text        NOT NULL DEFAULT 'all'
                             CHECK (target_type IN ('all', 'user')),
  target_user_id uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by     uuid        REFERENCES auth.users(id),
  created_at     timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. notification_reads — تتبع ما قرأه كل مستخدم
-- ============================================================

CREATE TABLE notification_reads (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid        NOT NULL REFERENCES system_notifications(id) ON DELETE CASCADE,
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  read_at         timestamptz NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- ============================================================
-- 3. push_subscriptions — اشتراكات Web Push
-- ============================================================

CREATE TABLE push_subscriptions (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid        REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint   text        NOT NULL,
  p256dh     text        NOT NULL,
  auth       text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(endpoint)
);

-- ============================================================
-- 4. Indexes للأداء
-- ============================================================

CREATE INDEX idx_notifications_target  ON system_notifications(target_type, target_user_id);
CREATE INDEX idx_notifications_created ON system_notifications(created_at DESC);
CREATE INDEX idx_reads_user            ON notification_reads(user_id);
CREATE INDEX idx_reads_notification    ON notification_reads(notification_id);
CREATE INDEX idx_push_subs_user        ON push_subscriptions(user_id);

-- ============================================================
-- 5. Row Level Security
-- ============================================================

ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_reads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions   ENABLE ROW LEVEL SECURITY;

-- ── RLS: system_notifications ────────────────────────────────

-- المستخدمون المسجّلون يرون الإشعارات العامة + المخصصة لهم
CREATE POLICY "notifications_select_users"
  ON system_notifications FOR SELECT TO authenticated
  USING (target_type = 'all' OR target_user_id = auth.uid());

-- الزوار غير المسجّلين يرون الإشعارات العامة فقط
CREATE POLICY "notifications_select_anon"
  ON system_notifications FOR SELECT TO anon
  USING (target_type = 'all');

-- الإدمن فقط يضيف إشعارات
CREATE POLICY "notifications_insert_admin"
  ON system_notifications FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- الإدمن فقط يحذف إشعارات
CREATE POLICY "notifications_delete_admin"
  ON system_notifications FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ── RLS: notification_reads ───────────────────────────────────

CREATE POLICY "reads_select_own"
  ON notification_reads FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "reads_insert_own"
  ON notification_reads FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "reads_delete_own"
  ON notification_reads FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- ── RLS: push_subscriptions ───────────────────────────────────

-- كل مستخدم يتحكم في اشتراكه الخاص
CREATE POLICY "push_manage_own"
  ON push_subscriptions FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- الإدمن يقرأ كل الاشتراكات (لإرسال Push للجميع)
CREATE POLICY "push_admin_read_all"
  ON push_subscriptions FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR user_id = auth.uid()
  );

-- ============================================================
-- 6. View مساعد: الإشعارات مع حالة القراءة للمستخدم الحالي
-- ============================================================

CREATE OR REPLACE VIEW my_notifications AS
  SELECT
    n.*,
    (r.id IS NOT NULL) AS is_read,
    r.read_at
  FROM system_notifications n
  LEFT JOIN notification_reads r
    ON r.notification_id = n.id AND r.user_id = auth.uid()
  WHERE
    n.target_type = 'all'
    OR n.target_user_id = auth.uid()
  ORDER BY n.created_at DESC;
