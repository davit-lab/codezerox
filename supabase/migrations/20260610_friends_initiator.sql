-- Add initiator_id to friends table so we can tell who sent the request
ALTER TABLE public.friends ADD COLUMN IF NOT EXISTS initiator_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL;

-- Update send_friend_request to store initiator_id
CREATE OR REPLACE FUNCTION public.send_friend_request(_target_user_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _user_a uuid;
  _user_b uuid;
  _existing_id uuid;
  _new_id uuid;
BEGIN
  IF auth.uid() = _target_user_id THEN
    RAISE EXCEPTION 'Cannot send friend request to yourself';
  END IF;

  IF auth.uid() < _target_user_id THEN
    _user_a := auth.uid();
    _user_b := _target_user_id;
  ELSE
    _user_a := _target_user_id;
    _user_b := auth.uid();
  END IF;

  SELECT id INTO _existing_id FROM public.friends
  WHERE user_a = _user_a AND user_b = _user_b;

  IF _existing_id IS NOT NULL THEN
    UPDATE public.friends
    SET status = 'pending', initiator_id = auth.uid(), updated_at = now()
    WHERE id = _existing_id AND status IN ('declined', 'rejected');
    RETURN _existing_id;
  ELSE
    INSERT INTO public.friends (user_a, user_b, status, initiator_id)
    VALUES (_user_a, _user_b, 'pending', auth.uid())
    RETURNING id INTO _new_id;
    RETURN _new_id;
  END IF;
END $$;

-- Fix get_pending_requests: return requests sent TO current user (where they are NOT the initiator)
CREATE OR REPLACE FUNCTION public.get_pending_requests(_user_id uuid)
RETURNS TABLE (
  requester_id uuid,
  friendship_id uuid,
  created_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    initiator_id as requester_id,
    id as friendship_id,
    created_at
  FROM public.friends
  WHERE (user_a = _user_id OR user_b = _user_id)
    AND status = 'pending'
    AND initiator_id IS NOT NULL
    AND initiator_id != _user_id
  ORDER BY created_at DESC;
$$;

-- New: get_sent_requests - requests the current user initiated that are still pending
CREATE OR REPLACE FUNCTION public.get_sent_requests(_user_id uuid)
RETURNS TABLE (
  target_user_id uuid,
  friendship_id uuid,
  created_at timestamptz
) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    CASE WHEN user_a = _user_id THEN user_b ELSE user_a END as target_user_id,
    id as friendship_id,
    created_at
  FROM public.friends
  WHERE (user_a = _user_id OR user_b = _user_id)
    AND status = 'pending'
    AND initiator_id = _user_id
  ORDER BY created_at DESC;
$$;
