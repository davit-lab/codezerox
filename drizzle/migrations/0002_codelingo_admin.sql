CREATE OR REPLACE FUNCTION public.admin_codelingo_overview()
RETURNS TABLE(user_id uuid, email text, full_name text, learner_name text, lessons_done integer, last_active timestamptz, pro_status text, pro_expires timestamptz)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
 RETURN QUERY
 SELECT u.id, u.email::text, p.full_name::text,
  (ls.state->'profile'->>'name')::text,
  COALESCE(jsonb_array_length(ls.state->'completed'),0)::int,
  ls.updated_at, s.status::text, s.expires_at
 FROM auth.users u
 LEFT JOIN public.profiles p ON p.user_id=u.id
 LEFT JOIN public.learner_state ls ON ls.user_id=u.id
 LEFT JOIN public.codelingo_subscriptions s ON s.user_id=u.id
 WHERE ls.user_id IS NOT NULL OR s.user_id IS NOT NULL
 ORDER BY ls.updated_at DESC NULLS LAST;
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_codelingo_pro(_user_id uuid, _days integer)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
 IF _days<=0 THEN
  UPDATE public.codelingo_subscriptions SET status='cancelled', expires_at=now(), updated_at=now() WHERE user_id=_user_id;
 ELSE
  INSERT INTO public.codelingo_subscriptions(user_id,status,started_at,expires_at,amount_gel,updated_at)
  VALUES(_user_id,'active',now(),now()+make_interval(days=>_days),0,now())
  ON CONFLICT (user_id) DO UPDATE SET status='active',
   expires_at=GREATEST(public.codelingo_subscriptions.expires_at,now())+make_interval(days=>_days), updated_at=now();
 END IF;
END $$;

REVOKE ALL ON FUNCTION public.admin_codelingo_overview() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.admin_set_codelingo_pro(uuid,integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_codelingo_overview() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_codelingo_pro(uuid,integer) TO authenticated;