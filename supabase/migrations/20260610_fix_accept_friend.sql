-- Fix accept_friend_request: receiver could be either user_a or user_b
-- because send_friend_request orders by UUID (user_a < user_b)

CREATE OR REPLACE FUNCTION public.accept_friend_request(_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.friends
  SET status = 'accepted', updated_at = now()
  WHERE id = _friendship_id
    AND (user_a = auth.uid() OR user_b = auth.uid())
    AND status = 'pending';
  
  RETURN FOUND;
END $$;

-- Also fix decline_friend_request for the same reason
CREATE OR REPLACE FUNCTION public.decline_friend_request(_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.friends
  SET status = 'declined', updated_at = now()
  WHERE id = _friendship_id
    AND (user_a = auth.uid() OR user_b = auth.uid())
    AND status = 'pending';
  
  RETURN FOUND;
END $$;

-- Fix remove_friend for the same reason
CREATE OR REPLACE FUNCTION public.remove_friend(_friendship_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  DELETE FROM public.friends
  WHERE id = _friendship_id
    AND (user_a = auth.uid() OR user_b = auth.uid());
  
  RETURN FOUND;
END $$;
