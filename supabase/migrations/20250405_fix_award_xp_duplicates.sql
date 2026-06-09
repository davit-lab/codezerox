-- ============================================
-- CRITICAL FIX: XP being awarded multiple times
-- User reports XP increased from 400 to 950 just by refreshing
-- Root cause: award_xp function doesn't check for duplicates
-- ============================================

-- 1. First, let's create a proper duplicate-checking version of award_xp
-- This function will check if XP was already awarded for this action/reference
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
  -- CRITICAL FIX: Check if XP was already awarded for this exact action/reference
  IF _reference_id IS NOT NULL THEN
    IF EXISTS (
      SELECT 1 FROM xp_transactions 
      WHERE user_id = _user_id 
        AND reason = _reason 
        AND reference_id = _reference_id
    ) THEN
      -- Already awarded, just return current balance without adding more XP
      SELECT balance INTO new_balance FROM user_xp WHERE user_id = _user_id;
      RETURN COALESCE(new_balance, 0);
    END IF;
  END IF;

  -- If no duplicate found, proceed with normal XP award
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

-- 2. Also update award_xp_safe to use the same logic (keeping it for backward compatibility)
DROP FUNCTION IF EXISTS public.award_xp_safe(uuid, integer, text, text);
CREATE OR REPLACE FUNCTION public.award_xp_safe(
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
BEGIN
  -- Check if XP was already awarded for this action
  IF _ref IS NOT NULL AND EXISTS (
    SELECT 1 FROM xp_transactions 
    WHERE user_id = _user_id 
      AND reason = _action 
      AND reference_id = _ref
  ) THEN
    -- Already awarded, return current balance without adding XP
    SELECT balance INTO new_balance FROM user_xp WHERE user_id = _user_id;
    RETURN COALESCE(new_balance, 0);
  END IF;

  -- Continue with normal award_xp logic
  INSERT INTO user_xp (user_id, balance, total_earned, updated_at)
  VALUES (_user_id, _amount, _amount, now())
  ON CONFLICT (user_id) DO UPDATE
  SET balance = user_xp.balance + _amount,
      total_earned = user_xp.total_earned + _amount,
      updated_at = now();

  INSERT INTO xp_transactions (user_id, amount, reason, reference_id)
  VALUES (_user_id, _amount, _action, _ref);

  SELECT balance INTO new_balance FROM user_xp WHERE user_id = _user_id;
  RETURN new_balance;
END;
$$;

-- 3. Add comment explaining the fix
COMMENT ON FUNCTION public.award_xp IS 
'Awards XP to a user. CRITICAL FIX: Now checks for duplicates before awarding.
If the same action/reference combination already exists, returns current balance without adding more XP.
This prevents XP farming by refreshing the page.';

-- 4. Ensure unique constraint exists on hub_challenge_participants
ALTER TABLE hub_challenge_participants
DROP CONSTRAINT IF EXISTS unique_challenge_participant;

ALTER TABLE hub_challenge_participants
ADD CONSTRAINT unique_challenge_participant UNIQUE (challenge_id, user_id);

-- 5. Check if there are any existing duplicate transactions and log them
-- This helps identify how many times XP was wrongly awarded
DO $$
DECLARE
  duplicate_count integer;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, reason, reference_id, COUNT(*) as cnt
    FROM xp_transactions
    WHERE reference_id IS NOT NULL
    GROUP BY user_id, reason, reference_id
    HAVING COUNT(*) > 1
  ) dups;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate XP transactions that were awarded multiple times', duplicate_count;
  END IF;
END $$;

-- ============================================
-- INSTRUCTIONS:
-- ============================================
-- 1. Run this migration to fix the award_xp function
-- 2. The function now checks for existing transactions before awarding
-- 3. Duplicate awards will be prevented automatically
-- ============================================
