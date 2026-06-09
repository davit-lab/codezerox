
-- Create bookmarks table
CREATE TABLE public.book_bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  note TEXT,
  color TEXT DEFAULT 'gold',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.book_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can only see their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON public.book_bookmarks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON public.book_bookmarks
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookmarks" ON public.book_bookmarks
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.book_bookmarks
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Index for fast queries
CREATE INDEX idx_book_bookmarks_user_book ON public.book_bookmarks(user_id, book_id);
