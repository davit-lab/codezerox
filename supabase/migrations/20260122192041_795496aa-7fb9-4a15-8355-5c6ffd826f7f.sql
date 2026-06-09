-- Add storage policies for book-pdfs bucket
-- Allow authenticated users to download PDFs (for purchased books / free books)
CREATE POLICY "Authenticated users can download PDFs"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'book-pdfs');

-- Allow admins to upload PDFs
CREATE POLICY "Admins can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'book-pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to update PDFs
CREATE POLICY "Admins can update PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'book-pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);

-- Allow admins to delete PDFs
CREATE POLICY "Admins can delete PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'book-pdfs' 
  AND public.has_role(auth.uid(), 'admin')
);