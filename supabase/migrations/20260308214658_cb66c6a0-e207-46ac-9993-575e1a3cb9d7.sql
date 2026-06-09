
CREATE POLICY "Admins can view all attempts"
ON public.exam_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
