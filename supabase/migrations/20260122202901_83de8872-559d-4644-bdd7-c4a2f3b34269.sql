-- Create reading progress table
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  scroll_position NUMERIC DEFAULT 0,
  last_page INTEGER DEFAULT 1,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own reading progress
CREATE POLICY "Users can view their own reading progress"
ON public.reading_progress
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own reading progress
CREATE POLICY "Users can insert their own reading progress"
ON public.reading_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reading progress
CREATE POLICY "Users can update their own reading progress"
ON public.reading_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own reading progress
CREATE POLICY "Users can delete their own reading progress"
ON public.reading_progress
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_reading_progress_updated_at
BEFORE UPDATE ON public.reading_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();