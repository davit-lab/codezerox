
-- Recreate SELECT policy for book-pdfs (previous one was dropped)
CREATE POLICY "Authenticated users can read book-pdfs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'book-pdfs'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM purchases p
      JOIN books b ON p.book_id = b.id
      WHERE p.user_id = auth.uid()
        AND b.pdf_url = objects.name
    )
    OR EXISTS (
      SELECT 1 FROM books b
      WHERE b.is_free = true
        AND b.pdf_url = objects.name
    )
  )
);
