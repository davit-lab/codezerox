-- Add package tier to vacancies
ALTER TABLE vacancies 
  ADD COLUMN IF NOT EXISTS package_tier TEXT DEFAULT 'basic' 
    CHECK (package_tier IN ('basic', 'normal', 'premium', 'depremium')),
  ADD COLUMN IF NOT EXISTS package_paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS package_expires_at TIMESTAMPTZ;

-- Update existing vacancies to basic (already paid/free for now)
UPDATE vacancies SET package_tier = 'basic', package_paid = TRUE WHERE package_tier IS NULL OR package_tier = 'basic';

-- Freelancer subscriptions table
CREATE TABLE IF NOT EXISTS freelancer_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'expired', 'cancelled')),
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  amount_gel NUMERIC DEFAULT 10,
  transaction_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE freelancer_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscription" ON freelancer_subscriptions;
CREATE POLICY "Users can view own subscription" ON freelancer_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subscription" ON freelancer_subscriptions;
CREATE POLICY "Users can insert own subscription" ON freelancer_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to check if freelancer subscription is active
CREATE OR REPLACE FUNCTION is_freelancer_subscription_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM freelancer_subscriptions
    WHERE user_id = p_user_id
      AND status = 'active'
      AND expires_at > NOW()
  );
$$ LANGUAGE SQL SECURITY DEFINER;

-- Package tier sort order helper
COMMENT ON COLUMN vacancies.package_tier IS 'depremium=10₾ first, premium=5₾, normal=3₾, basic=1₾';
