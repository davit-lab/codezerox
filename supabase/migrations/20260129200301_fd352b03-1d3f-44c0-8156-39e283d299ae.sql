-- Create storage bucket for course content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-content', 'course-content', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admins can upload course content"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-content' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow public read access to course content images
CREATE POLICY "Course content is publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-content');

-- Allow admins to delete course content
CREATE POLICY "Admins can delete course content"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-content' 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);