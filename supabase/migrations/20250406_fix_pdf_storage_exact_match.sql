-- PDF Storage RLS Policy Fix - Exact Match
-- Problem: LIKE pattern matching was unreliable for PDF file lookups
-- Fix: Use exact equality (=) instead of pattern matching (~~)

-- Drop old policies that used LIKE matching
DROP POLICY IF EXISTS "Authenticated users can download PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Purchasers can view book PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Purchasers and admins can view book PDFs" ON storage.objects;

-- Create new policy with exact match
CREATE POLICY "Purchasers and admins can view book PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'book-pdfs' AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.purchases p
      JOIN public.books b ON p.book_id = b.id
      WHERE p.user_id = auth.uid() AND b.pdf_url = name
    ) OR
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.is_free = true AND b.pdf_url = name
    )
  )
);

-- Keep admin write policies unchanged
DROP POLICY IF EXISTS "Admins can upload PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update PDFs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete PDFs" ON storage.objects;

CREATE POLICY "Admins can upload PDFs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update PDFs"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete PDFs"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));
