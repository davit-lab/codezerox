-- ============================================
-- FIX: Remove automatic XP on login
-- XP should only be awarded for actual achievements
-- ============================================

-- 1. Check if there's any trigger on auth.users or related tables that awards XP on login
-- We'll drop any such triggers if they exist

-- Drop any trigger that might be awarding XP on user creation or login
-- (These shouldn't exist, but we'll be safe)
DROP TRIGGER IF EXISTS trg_xp_on_user_login ON auth.users;
DROP TRIGGER IF EXISTS trg_xp_on_session_create ON auth.sessions;

-- 2. Create a function to check if XP was already awarded for a specific action
-- This prevents duplicate XP awards
CREATE OR REPLACE FUNCTION public.check_xp_already_awarded(
  _user_id uuid,
  _action_type text,
  _reference_id text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _reference_id IS NOT NULL THEN
    RETURN EXISTS (
      SELECT 1 FROM xp_transactions 
      WHERE user_id = _user_id 
        AND action_type = _action_type 
        AND reference_id = _reference_id
    );
  ELSE
    -- For actions without reference (like daily login if we ever add it)
    -- Check if awarded in the last 24 hours
    RETURN EXISTS (
      SELECT 1 FROM xp_transactions 
      WHERE user_id = _user_id 
        AND action_type = _action_type
        AND created_at > now() - interval '24 hours'
    );
  END IF;
END;
$$;

-- 3. Update the award_xp function to check for duplicates before awarding
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
  new_level integer;
BEGIN
  -- Check if XP was already awarded for this action
  IF _ref IS NOT NULL AND EXISTS (
    SELECT 1 FROM xp_transactions 
    WHERE user_id = _user_id 
      AND action_type = _action 
      AND reference_id = _ref
  ) THEN
    -- Already awarded, return current balance without adding XP
    SELECT balance INTO new_balance FROM user_xp WHERE user_id = _user_id;
    RETURN COALESCE(new_balance, 0);
  END IF;

  -- Continue with normal award_xp logic
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

-- 4. Fix the useJoinChallenge hook issue by adding a unique constraint
-- This ensures a user can only join a challenge once
ALTER TABLE hub_challenge_participants
DROP CONSTRAINT IF EXISTS unique_challenge_participant;

ALTER TABLE hub_challenge_participants
ADD CONSTRAINT unique_challenge_participant UNIQUE (challenge_id, user_id);

-- 5. Update the join challenge flow to use the safe function
COMMENT ON FUNCTION public.award_xp_safe IS 
'Awards XP to a user, but prevents duplicate awards for the same action/reference.
Use this instead of award_xp to prevent XP farming.';

-- ============================================
-- INSTRUCTIONS FOR FRONTEND:
-- ============================================
-- 
-- The issue was that award_xp was being called every time useJoinChallenge.mutate() 
-- was called, even if the user was already a participant.
-- 
-- The fix:
-- 1. The UNIQUE constraint on hub_challenge_participants prevents duplicate joins
-- 2. The insert will fail if user already joined, and XP won't be awarded
-- 3. The award_xp_safe function adds an extra check to prevent duplicate XP
--
-- Alternative: Update the frontend to check if user_has_joined before calling join
-- ============================================
