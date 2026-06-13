-- Allow admins to create purchases for any user
CREATE POLICY "Admins can create purchases for users"
ON public.purchases
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));