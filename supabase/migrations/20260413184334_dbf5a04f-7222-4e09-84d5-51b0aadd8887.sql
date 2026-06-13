
-- Kids lesson progress table
CREATE TABLE public.kids_lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_id uuid NOT NULL,
  lesson_id text NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(child_id, lesson_id)
);

ALTER TABLE public.kids_lesson_progress ENABLE ROW LEVEL SECURITY;

-- Children can view their own progress
CREATE POLICY "Children can view own progress"
ON public.kids_lesson_progress FOR SELECT
USING (auth.uid() = child_id);

-- Children can insert own progress
CREATE POLICY "Children can insert own progress"
ON public.kids_lesson_progress FOR INSERT
WITH CHECK (auth.uid() = child_id);

-- Parents can view their children's progress
CREATE POLICY "Parents can view children progress"
ON public.kids_lesson_progress FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.parent_children pc
    WHERE pc.child_id = kids_lesson_progress.child_id
    AND pc.parent_id = auth.uid()
  )
);

-- Admins full access
CREATE POLICY "Admins can manage all kids progress"
ON public.kids_lesson_progress FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add is_active column to parent_children for admin enable/disable
ALTER TABLE public.parent_children ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Admin policies on parent_children (full CRUD)
CREATE POLICY "Admins can manage all parent_children"
ON public.parent_children FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admin policies on kids_subscriptions
CREATE POLICY "Admins can manage all kids_subscriptions"
ON public.kids_subscriptions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
