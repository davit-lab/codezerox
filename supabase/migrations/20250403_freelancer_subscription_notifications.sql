-- 1. Add reminder_sent_at to freelancer_subscriptions
ALTER TABLE freelancer_subscriptions
  ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

-- 2. Create user_notifications table
CREATE TABLE IF NOT EXISTS user_notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'general',
  title         TEXT NOT NULL,
  body          TEXT,
  is_read       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_notifications_user_id_idx ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS user_notifications_is_read_idx  ON user_notifications(user_id, is_read);

ALTER TABLE user_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON user_notifications;
DROP POLICY IF EXISTS "Service role can insert notifications" ON user_notifications;

CREATE POLICY "Users can view own notifications"
  ON user_notifications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- Service role can insert (edge function uses service role)
CREATE POLICY "Service role can insert notifications"
  ON user_notifications FOR INSERT WITH CHECK (true);

-- 3. Schedule the cron job (runs every day at 09:00 UTC)
-- Requires pg_cron extension (enabled in Supabase by default)
SELECT cron.schedule(
  'freelancer-subscription-reminder',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url    := current_setting('app.supabase_url') || '/functions/v1/freelancer-subscription-cron',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body   := '{}'::jsonb
  );
  $$
);
