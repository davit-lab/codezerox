-- Add attachment metadata to channel messages
ALTER TABLE public.mentoring_channel_messages
  ADD COLUMN IF NOT EXISTS attachment_name text,
  ADD COLUMN IF NOT EXISTS attachment_type text;

-- Add views to lectures
ALTER TABLE public.mentoring_lectures
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

-- Multi-file attachments for submissions (jsonb array of {url, name, type, size})
ALTER TABLE public.mentoring_assignment_submissions
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

-- RPC: increment lecture view (any hub member who can view the lecture can call)
CREATE OR REPLACE FUNCTION public.increment_lecture_view(_lecture_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _course_id uuid;
  _min_tier integer;
BEGIN
  SELECT course_id, min_tier INTO _course_id, _min_tier
  FROM public.mentoring_lectures WHERE id = _lecture_id;
  IF _course_id IS NULL THEN RETURN; END IF;

  -- Permission: admin, course mentor, or hub member with sufficient tier
  IF NOT (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_course_mentor(auth.uid(), _course_id)
    OR EXISTS (
      SELECT 1 FROM public.mentoring_hub_members m
      WHERE m.course_id = _course_id AND m.user_id = auth.uid()
        AND m.banned = false AND m.package_tier >= COALESCE(_min_tier, 1)
    )
  ) THEN
    RETURN;
  END IF;

  UPDATE public.mentoring_lectures
  SET views_count = views_count + 1
  WHERE id = _lecture_id;
END;
$$;