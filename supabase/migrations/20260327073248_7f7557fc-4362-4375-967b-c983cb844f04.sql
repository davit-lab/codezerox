-- Fix: allow anyone to view chapter metadata (content is gated in UI)
DROP POLICY IF EXISTS "Users can view chapters of subscribed courses" ON public.course_chapters;

-- Allow all authenticated users to view chapters (content gating is done in app)
CREATE POLICY "Anyone can view chapters"
  ON public.course_chapters
  FOR SELECT
  USING (true);
