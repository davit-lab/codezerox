-- General Friends/Connections System for the entire platform

-- Create ENUM for friendship status
DO $$ BEGIN
  CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Friends table (general, not course-specific)
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_b uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status public.friendship_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  -- Ensure user_a < user_b to avoid duplicates
  CHECK (user_a < user_b),
  UNIQUE (user_a, user_b)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_friends_user_a ON public.friends(user_a);
CREATE INDEX IF NOT EXISTS idx_friends_user_b ON public.friends(user_b);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
CREATE INDEX IF NOT EXISTS idx_friends_created_at ON public.friends(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_friends_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_friends_updated_at ON public.friends;
CREATE TRIGGER trg_friends_updated_at BEFORE UPDATE ON public.friends
FOR EACH ROW EXECUTE FUNCTION public.update_friends_updated_at();

-- RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Users can see their own friendships
CREATE POLICY "friends_select_own" ON public.friends FOR SELECT
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can insert friendship requests (only as user_a)
CREATE POLICY "friends_insert" ON public.friends FOR INSERT
WITH CHECK (
  auth.uid() = user_a
  AND status = 'pending'
);

-- Users can update friendships they're involved in
CREATE POLICY "friends_update" ON public.friends FOR UPDATE
USING (auth.uid() = user_a OR auth.uid() = user_b)
WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- Users can delete friendships they're involved in
CREATE POLICY "friends_delete" ON public.friends FOR DELETE
USING (auth.uid() = user_a OR auth.uid() = user_b);

-- Admin can do everything
CREATE POLICY "friends_admin_all" ON public.friends FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Realtime
ALTER TABLE public.friends REPLICA IDENTITY FULL;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Helper function to get accepted friends for a user
CREATE OR REPLACE FUNCTION public.get_user_friends(_user_id uuid)
RETURNS TABLE (
  friend_id uuid,
  status public.friendship_status,
  created_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE WHEN user_a = _user_id THEN user_b ELSE user_a END as friend_id,
    status,
    created_at
  FROM public.friends
  WHERE (user_a = _user_id OR user_b = _user_id)
    AND status = 'accepted'
  ORDER BY created_at DESC;
$$;

-- Helper function to get pending friend requests
CREATE OR REPLACE FUNCTION public.get_pending_requests(_user_id uuid)
RETURNS TABLE (
  requester_id uuid,
  friendship_id uuid,
  created_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    user_a as requester_id,
    id as friendship_id,
    created_at
  FROM public.friends
  WHERE user_b = _user_id
    AND status = 'pending'
  ORDER BY created_at DESC;
$$;

-- Helper function to send friend request
CREATE OR REPLACE FUNCTION public.send_friend_request(_target_user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user_a uuid;
  _user_b uuid;
  _existing_id uuid;
  _new_id uuid;
BEGIN
  -- Check if users are the same
  IF auth.uid() = _target_user_id THEN
    RAISE EXCEPTION 'Cannot send friend request to yourself';
  END IF;

  -- Determine order (user_a < user_b)
  IF auth.uid() < _target_user_id THEN
    _user_a := auth.uid();
    _user_b := _target_user_id;
  ELSE
    _user_a := _target_user_id;
    _user_b := auth.uid();
  END IF;

  -- Check if friendship already exists
  SELECT id INTO _existing_id FROM public.friends
  WHERE user_a = _user_a AND user_b = _user_b;

  IF _existing_id IS NOT NULL THEN
    -- If declined, allow re-request
    UPDATE public.friends
    SET status = 'pending', updated_at = now()
    WHERE id = _existing_id AND status = 'declined';
    
    RETURN _existing_id;
  ELSE
    -- Create new friendship request
    INSERT INTO public.friends (user_a, user_b, status)
    VALUES (_user_a, _user_b, 'pending')
    RETURNING id INTO _new_id;
    
    RETURN _new_id;
  END IF;
END $$;

-- Helper function to accept friend request
CREATE OR REPLACE FUNCTION public.accept_friend_request(_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.friends
  SET status = 'accepted', updated_at = now()
  WHERE id = _friendship_id
    AND user_b = auth.uid()
    AND status = 'pending';
  
  RETURN FOUND;
END $$;

-- Helper function to decline friend request
CREATE OR REPLACE FUNCTION public.decline_friend_request(_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.friends
  SET status = 'declined', updated_at = now()
  WHERE id = _friendship_id
    AND user_b = auth.uid()
    AND status = 'pending';
  
  RETURN FOUND;
END $$;

-- Helper function to remove friend
CREATE OR REPLACE FUNCTION public.remove_friend(_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.friends
  WHERE id = _friendship_id
    AND (user_a = auth.uid() OR user_b = auth.uid());
  
  RETURN FOUND;
END $$;

-- Helper function to block user
CREATE OR REPLACE FUNCTION public.block_user(_target_user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user_a uuid;
  _user_b uuid;
  _existing_id uuid;
  _new_id uuid;
BEGIN
  IF auth.uid() = _target_user_id THEN
    RAISE EXCEPTION 'Cannot block yourself';
  END IF;

  IF auth.uid() < _target_user_id THEN
    _user_a := auth.uid();
    _user_b := _target_user_id;
  ELSE
    _user_a := _target_user_id;
    _user_b := auth.uid();
  END IF;

  -- Check if friendship exists
  SELECT id INTO _existing_id FROM public.friends
  WHERE user_a = _user_a AND user_b = _user_b;

  IF _existing_id IS NOT NULL THEN
    UPDATE public.friends
    SET status = 'blocked', updated_at = now()
    WHERE id = _existing_id;
    
    RETURN _existing_id;
  ELSE
    INSERT INTO public.friends (user_a, user_b, status)
    VALUES (_user_a, _user_b, 'blocked')
    RETURNING id INTO _new_id;
    
    RETURN _new_id;
  END IF;
END $$;
