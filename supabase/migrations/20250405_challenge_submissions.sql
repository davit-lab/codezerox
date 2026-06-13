-- Challenge code submissions
CREATE TABLE IF NOT EXISTS challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES hub_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  html_code text DEFAULT '',
  css_code text DEFAULT '',
  js_code text DEFAULT '',
  notes text DEFAULT '',
  status text NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'winner')),
  admin_feedback text,
  bonus_xp integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE challenge_submissions ENABLE ROW LEVEL SECURITY;

-- Everyone can view submissions
DROP POLICY IF EXISTS "Anyone can view submissions" ON challenge_submissions;
CREATE POLICY "Anyone can view submissions" ON challenge_submissions FOR SELECT USING (true);

-- Users can insert their own
DROP POLICY IF EXISTS "Users can submit" ON challenge_submissions;
CREATE POLICY "Users can submit" ON challenge_submissions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own (before it's reviewed)
DROP POLICY IF EXISTS "Users can update own submission" ON challenge_submissions;
CREATE POLICY "Users can update own submission" ON challenge_submissions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'submitted');

-- Admins can update any (for reviewing/picking winners)
DROP POLICY IF EXISTS "Admins can manage submissions" ON challenge_submissions;
CREATE POLICY "Admins can manage submissions" ON challenge_submissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Function: admin picks a winner and awards bonus XP
DROP FUNCTION IF EXISTS public.pick_challenge_winner(uuid, integer, text);
CREATE OR REPLACE FUNCTION public.pick_challenge_winner(
  _submission_id uuid,
  _bonus_xp integer DEFAULT 200,
  _feedback text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _challenge_id uuid;
BEGIN
  -- Get submission info
  SELECT user_id, challenge_id INTO _user_id, _challenge_id
  FROM challenge_submissions WHERE id = _submission_id;

  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Submission not found';
  END IF;

  -- Mark as winner
  UPDATE challenge_submissions
  SET status = 'winner', bonus_xp = _bonus_xp, admin_feedback = _feedback, updated_at = now()
  WHERE id = _submission_id;

  -- Award bonus XP (award_xp params: _user_id, _amount, _action, _ref)
  PERFORM award_xp(_user_id, _bonus_xp, 'challenge_winner', _challenge_id::text);
END;
$$;
