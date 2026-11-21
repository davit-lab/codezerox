CREATE TABLE IF NOT EXISTS public.learner_state (
  user_id uuid PRIMARY KEY,
  state jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.learner_state TO authenticated;
GRANT ALL ON public.learner_state TO service_role;
ALTER TABLE public.learner_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "learner owns state select" ON public.learner_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "learner owns state insert" ON public.learner_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "learner owns state update" ON public.learner_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.save_learner_state(new_state jsonb, expected_revision integer)
RETURNS integer LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
DECLARE current_revision integer; next_revision integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in before saving progress.'; END IF;
  IF octet_length(new_state::text) > 3000000 THEN RAISE EXCEPTION 'Progress too large'; END IF;
  SELECT revision INTO current_revision FROM public.learner_state WHERE user_id = auth.uid() FOR UPDATE;
  IF expected_revision IS NOT NULL AND coalesce(current_revision,0) IS DISTINCT FROM expected_revision THEN
    RAISE EXCEPTION 'Cloud progress changed on another device. Read and merge before saving.';
  END IF;
  next_revision := coalesce(current_revision,0) + 1;
  INSERT INTO public.learner_state(user_id,state,revision,updated_at) VALUES(auth.uid(),new_state,next_revision,now())
  ON CONFLICT(user_id) DO UPDATE SET state=excluded.state, revision=excluded.revision, updated_at=excluded.updated_at;
  RETURN next_revision;
END; $$;
REVOKE ALL ON FUNCTION public.save_learner_state(jsonb,integer) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.save_learner_state(jsonb,integer) TO authenticated;

CREATE TABLE IF NOT EXISTS public.codelingo_subscriptions (
  user_id uuid PRIMARY KEY,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  amount_gel numeric NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.codelingo_subscriptions TO authenticated;
GRANT ALL ON public.codelingo_subscriptions TO service_role;
ALTER TABLE public.codelingo_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own codelingo sub" ON public.codelingo_subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
