-- Add missing columns to existing user_xp table
ALTER TABLE user_xp ADD COLUMN IF NOT EXISTS balance integer NOT NULL DEFAULT 0;
ALTER TABLE user_xp ADD COLUMN IF NOT EXISTS total_earned integer NOT NULL DEFAULT 0;
ALTER TABLE user_xp ADD COLUMN IF NOT EXISTS total_spent integer NOT NULL DEFAULT 0;

-- Sync balance from existing total_xp
UPDATE user_xp SET balance = total_xp, total_earned = total_xp WHERE balance = 0 AND total_xp > 0;

-- Fix award_xp to work with actual schema (has id + user_id, not user_id as PK)
DROP FUNCTION IF EXISTS public.award_xp(uuid, integer, text, text);
CREATE OR REPLACE FUNCTION public.award_xp(
  _user_id uuid,
  _amount integer,
  _action text,
  _ref text DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_balance integer;
  new_level integer;
BEGIN
  IF EXISTS (SELECT 1 FROM user_xp WHERE user_id = _user_id) THEN
    UPDATE user_xp
    SET balance = balance + _amount,
        total_xp = total_xp + _amount,
        total_earned = total_earned + _amount,
        updated_at = now()
    WHERE user_id = _user_id;
  ELSE
    INSERT INTO user_xp (user_id, balance, total_xp, total_earned, level, updated_at)
    VALUES (_user_id, _amount, _amount, _amount, 1, now());
  END IF;

  SELECT total_xp INTO new_balance FROM user_xp WHERE user_id = _user_id;
  new_level := GREATEST(1, (new_balance / 200) + 1);
  UPDATE user_xp SET level = new_level, balance = new_balance WHERE user_id = _user_id;

  INSERT INTO xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _action, _ref);

  SELECT balance INTO new_balance FROM user_xp WHERE user_id = _user_id;
  RETURN new_balance;
END;
$$;

-- Fix redeem_xp_for_promo to work with actual schema
DROP FUNCTION IF EXISTS public.redeem_xp_for_promo(uuid, text);
CREATE OR REPLACE FUNCTION public.redeem_xp_for_promo(
  _user_id uuid,
  _tier text
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
  IF _tier = '500' THEN
    xp_cost := 500; discount_pct := 20;
  ELSIF _tier = '1000' THEN
    xp_cost := 1000; discount_pct := 35;
  ELSE
    RAISE EXCEPTION 'Invalid tier: %', _tier;
  END IF;

  SELECT balance INTO current_bal FROM user_xp WHERE user_id = _user_id;
  IF current_bal IS NULL OR current_bal < xp_cost THEN
    RAISE EXCEPTION 'არასაკმარისი XP. საჭიროა: %, აქვს: %', xp_cost, COALESCE(current_bal, 0);
  END IF;

  promo := 'XP' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 8));

  UPDATE user_xp
  SET balance = balance - xp_cost,
      total_spent = total_spent + xp_cost,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, -xp_cost, 'promo_redeem', promo);

  INSERT INTO promo_codes (code, discount_type, discount_value, max_uses, current_uses, is_active, expires_at)
  VALUES (promo, 'percentage', discount_pct, 1, 0, true, now() + interval '48 hours');

  RETURN promo;
END;
$$;

-- Backfill: award XP for existing challenge participants
INSERT INTO user_xp (user_id, balance, total_xp, total_earned, level, updated_at)
SELECT
  p.user_id,
  COALESCE(SUM(c.points), 0),
  COALESCE(SUM(c.points), 0),
  COALESCE(SUM(c.points), 0),
  1,
  now()
FROM hub_challenge_participants p
JOIN hub_challenges c ON c.id = p.challenge_id
WHERE NOT EXISTS (SELECT 1 FROM user_xp WHERE user_id = p.user_id)
GROUP BY p.user_id
ON CONFLICT DO NOTHING;

-- Update existing users' balance from challenge points
UPDATE user_xp ux
SET balance = balance + sub.pts,
    total_xp = total_xp + sub.pts,
    total_earned = total_earned + sub.pts,
    updated_at = now()
FROM (
  SELECT p.user_id, SUM(c.points) as pts
  FROM hub_challenge_participants p
  JOIN hub_challenges c ON c.id = p.challenge_id
  WHERE NOT EXISTS (
    SELECT 1 FROM xp_transactions t
    WHERE t.user_id = p.user_id AND t.reference_id = p.challenge_id::text AND t.action_type = 'challenge_join'
  )
  GROUP BY p.user_id
) sub
WHERE ux.user_id = sub.user_id;

-- Backfill: log transactions for existing participants
INSERT INTO xp_transactions (user_id, amount, action_type, reference_id)
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
    AND t.action_type = 'challenge_join'
);
