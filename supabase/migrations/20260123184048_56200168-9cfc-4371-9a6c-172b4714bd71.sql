-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete purchases
CREATE POLICY "Admins can delete purchases"
ON public.purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat_messages
CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat_rooms
CREATE POLICY "Admins can delete chat rooms"
ON public.chat_rooms
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete credit_purchases
CREATE POLICY "Admins can delete credit purchases"
ON public.credit_purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));