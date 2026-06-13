CREATE OR REPLACE FUNCTION public.auto_add_hub_member() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN IF NEW.status IN ('paid','granted') THEN INSERT INTO public.mentoring_hub_members (course_id, user_id, role, package_tier) VALUES (NEW.course_id, NEW.user_id, 'student', COALESCE(NEW.package_tier, 1)) ON CONFLICT (course_id, user_id) DO UPDATE SET package_tier = GREATEST(public.mentoring_hub_members.package_tier, EXCLUDED.package_tier), banned = false; END IF; RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.get_assignment_submission_stats(_assignment_id uuid) RETURNS TABLE(submitted bigint, total bigint) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$ SELECT (SELECT count(*) FROM public.mentoring_assignment_submissions s WHERE s.assignment_id = _assignment_id), (SELECT count(*) FROM public.mentoring_hub_members m JOIN public.mentoring_assignments a ON a.course_id = m.course_id WHERE a.id = _assignment_id AND m.banned = false AND m.package_tier >= a.min_tier); $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_live_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_lectures;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_assignments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mentoring_assignment_submissions;