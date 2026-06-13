
-- Allow admins to upload to avatars bucket (for banners)
CREATE POLICY "Admins can upload to avatars bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update files in avatars bucket
CREATE POLICY "Admins can update avatars bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete from avatars bucket
CREATE POLICY "Admins can delete from avatars bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);
