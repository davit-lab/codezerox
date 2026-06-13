-- Grant admin role to academy@codezero.ge
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  target_user_id UUID;
  existing_role RECORD;
BEGIN
  -- Find user by email from auth.users
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = 'academy@codezero.ge'
  LIMIT 1;

  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email academy@codezero.ge not found';
  END IF;

  -- Check if user already has a role
  SELECT * INTO existing_role
  FROM public.user_roles
  WHERE user_id = target_user_id;

  IF existing_role IS NULL THEN
    -- Insert new role
    INSERT INTO public.user_roles (user_id, role, created_at)
    VALUES (target_user_id, 'admin', NOW());
    RAISE NOTICE 'Admin role inserted for academy@codezero.ge';
  ELSE
    -- Update existing role to admin
    UPDATE public.user_roles
    SET role = 'admin', created_at = NOW()
    WHERE user_id = target_user_id;
    RAISE NOTICE 'Admin role updated for academy@codezero.ge';
  END IF;
END $$;
