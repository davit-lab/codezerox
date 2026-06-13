
-- Create course_subscriptions table for monthly subscription model
CREATE TABLE public.course_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  chapters_read_this_month integer NOT NULL DEFAULT 0,
  month_reset_at timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  last_chapter_generated_at date DEFAULT NULL,
  granted_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Track which chapters a user has read
CREATE TABLE public.course_chapter_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Enable RLS
ALTER TABLE public.course_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_chapter_reads ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.course_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.course_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own subscriptions"
  ON public.course_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.course_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for course_chapter_reads
CREATE POLICY "Users can view their own reads"
  ON public.course_chapter_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reads"
  ON public.course_chapter_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage reads"
  ON public.course_chapter_reads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update chapter RLS: allow subscribers to view chapters
DROP POLICY IF EXISTS "Users can view chapters of purchased courses" ON public.course_chapters;
CREATE POLICY "Users can view chapters of subscribed courses"
  ON public.course_chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_subscriptions
      WHERE course_id = course_chapters.course_id
        AND user_id = auth.uid()
        AND expires_at > now()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add monthly_price column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS monthly_price numeric NOT NULL DEFAULT 0;

-- Update course prices to monthly prices
UPDATE public.courses SET monthly_price = 30 WHERE title = 'კიბერუსაფრთხოების საფუძვლები';
UPDATE public.courses SET monthly_price = 25 WHERE title = 'ქსელის უსაფრთხოება';
UPDATE public.courses SET monthly_price = 20 WHERE title = 'შეღწევადობის ტესტირება';
UPDATE public.courses SET monthly_price = 15 WHERE title = 'ვებ აპლიკაციების უსაფრთხოება';
UPDATE public.courses SET monthly_price = 10 WHERE title = 'ინციდენტების მართვა და ფორენზიკა';

-- Trigger to update updated_at
CREATE TRIGGER update_course_subscriptions_updated_at
  BEFORE UPDATE ON public.course_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
