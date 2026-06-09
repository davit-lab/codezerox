-- Update award_xp function to cap level at 100
CREATE OR REPLACE FUNCTION public.award_xp(_user_id uuid, _amount integer, _action text, _ref text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Ensure user_xp record exists
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add XP
  UPDATE public.user_xp
  SET total_xp = total_xp + _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING total_xp INTO new_total;

  -- Calculate level (every 200 XP = 1 level, capped at 100)
  new_level := LEAST(100, GREATEST(1, (new_total / 200) + 1));
  UPDATE public.user_xp SET level = new_level WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _action, _ref);
END;
$function$;

-- Update admin_award_xp function to cap level at 100
CREATE OR REPLACE FUNCTION public.admin_award_xp(_user_id uuid, _amount integer, _reason text DEFAULT 'admin_award'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, _amount, LEAST(100, GREATEST(1, (_amount / 200) + 1)))
  ON CONFLICT (user_id) DO UPDATE
  SET total_xp = user_xp.total_xp + _amount,
      level = LEAST(100, GREATEST(1, ((user_xp.total_xp + _amount) / 200) + 1)),
      updated_at = now();

  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _reason, 'admin_' || gen_random_uuid()::text);
END;
$function$;