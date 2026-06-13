-- Add preview_pdf_url column to books table (first 10 pages preview)
ALTER TABLE public.books
  ADD COLUMN IF NOT EXISTS preview_pdf_url TEXT;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
