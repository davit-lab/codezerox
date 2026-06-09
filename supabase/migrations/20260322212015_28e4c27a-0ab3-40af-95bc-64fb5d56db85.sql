
-- Replace overly permissive policy with authenticated-only
DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.user_notifications
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
