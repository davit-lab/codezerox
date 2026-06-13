-- XP balance per user
CREATE TABLE IF NOT EXISTS user_xp (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- XP transaction log
CREATE TABLE IF NOT EXISTS xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount integer NOT NULL, -- positive = earned, negative = spent
  reason text NOT NULL, -- 'challenge_join', 'promo_redeem', etc.
  reference_id text, -- challenge_id or promo code
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;

-- user_xp policies
DROP POLICY IF EXISTS "Users can view own XP" ON user_xp;
CREATE POLICY "Users can view own XP" ON user_xp FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can manage XP" ON user_xp;
CREATE POLICY "System can manage XP" ON user_xp FOR ALL USING (true);

-- xp_transactions policies
DROP POLICY IF EXISTS "Users can view own transactions" ON xp_transactions;
CREATE POLICY "Users can view own transactions" ON xp_transactions FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "System can insert transactions" ON xp_transactions;
CREATE POLICY "System can insert transactions" ON xp_transactions FOR INSERT WITH CHECK (true);

-- Function: award XP to a user (called after challenge join etc.)
DROP FUNCTION IF EXISTS public.award_xp(uuid, integer, text, text);
CREATE OR REPLACE FUNCTION public.award_xp(
  _user_id uuid,
  _amount integer,
  _reason text,
  _reference_id text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_balance integer;
BEGIN
  -- Upsert user_xp row
  INSERT INTO user_xp (user_id, balance, total_earned, updated_at)
  VALUES (_user_id, _amount, _amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_xp.balance + _amount,
      total_earned = user_xp.total_earned + _amount,
      updated_at = now();

  -- Log transaction
  INSERT INTO xp_transactions (user_id, amount, reason, reference_id)
  VALUES (_user_id, _amount, _reason, _reference_id);

  SELECT balance INTO new_balance FROM user_xp WHERE user_id = _user_id;
  RETURN new_balance;
END;
$$;

-- Function: redeem XP for a promo code
-- 500 XP => 20% discount, 1000 XP => 35% discount
-- Generates a one-time code with 48h expiry
DROP FUNCTION IF EXISTS public.redeem_xp_for_promo(uuid, text);
CREATE OR REPLACE FUNCTION public.redeem_xp_for_promo(
  _user_id uuid,
  _tier text -- '500' or '1000'
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  xp_cost integer;
  discount_pct numeric;
  current_bal integer;
  promo text;
BEGIN
  -- Determine tier
  IF _tier = '500' THEN
    xp_cost := 500;
    discount_pct := 20;
  ELSIF _tier = '1000' THEN
    xp_cost := 1000;
    discount_pct := 35;
  ELSE
    RAISE EXCEPTION 'Invalid tier: %', _tier;
  END IF;

  -- Check balance
  SELECT balance INTO current_bal FROM user_xp WHERE user_id = _user_id;
  IF current_bal IS NULL OR current_bal < xp_cost THEN
    RAISE EXCEPTION 'არასაკმარისი XP. საჭიროა: %, აქვს: %', xp_cost, COALESCE(current_bal, 0);
  END IF;

  -- Generate unique promo code
  promo := 'XP' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  -- Deduct XP
  UPDATE user_xp
  SET balance = balance - xp_cost,
      total_spent = total_spent + xp_cost,
      updated_at = now()
  WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO xp_transactions (user_id, amount, reason, reference_id)
  VALUES (_user_id, -xp_cost, 'promo_redeem', promo);

  -- Create promo code in existing promo_codes table (48h expiry, one-time use)
  INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, current_uses, is_active, expires_at)
  VALUES (promo, 'percentage', discount_pct, 1, 0, true, now() + interval '48 hours');

  RETURN promo;
END;
$$;

-- Backfill: award XP for existing challenge participants who don't have XP yet
INSERT INTO user_xp (user_id, balance, total_earned, updated_at)
SELECT
  p.user_id,
  COALESCE(SUM(c.points), 0),
  COALESCE(SUM(c.points), 0),
  now()
FROM hub_challenge_participants p
JOIN hub_challenges c ON c.id = p.challenge_id
WHERE NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = p.user_id)
GROUP BY p.user_id
ON CONFLICT (user_id) DO UPDATE
SET balance = user_xp.balance + EXCLUDED.balance,
    total_earned = user_xp.total_earned + EXCLUDED.total_earned,
    updated_at = now();

-- Backfill: log transactions for existing participants
INSERT INTO xp_transactions (user_id, amount, reason, reference_id)
SELECT
  p.user_id,
  c.points,
  'challenge_join',
  p.challenge_id::text
FROM hub_challenge_participants p
JOIN hub_challenges c ON c.id = p.challenge_id
WHERE NOT EXISTS (
  SELECT 1 FROM xp_transactions t
  WHERE t.user_id = p.user_id
    AND t.reference_id = p.challenge_id::text
    AND t.reason = 'challenge_join'
);
