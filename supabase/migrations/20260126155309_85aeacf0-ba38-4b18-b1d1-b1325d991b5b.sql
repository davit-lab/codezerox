-- Allow admins to delete any code snippet from the gallery
CREATE POLICY "Admins can delete any code snippet"
ON public.code_snippets
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));