
-- Allow anonymous users to read book-pdfs for preview functionality
CREATE POLICY "Anon users can read book-pdfs for preview"
ON storage.objects FOR SELECT
TO anon
USING (bucket_id = 'book-pdfs');
