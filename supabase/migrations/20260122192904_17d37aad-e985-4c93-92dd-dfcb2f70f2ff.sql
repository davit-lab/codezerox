-- Create book_reviews table
CREATE TABLE public.book_reviews (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, book_id)
);

-- Enable RLS
ALTER TABLE public.book_reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can view reviews
CREATE POLICY "Anyone can view reviews" 
ON public.book_reviews 
FOR SELECT 
USING (true);

-- Users can create reviews for books they purchased
CREATE POLICY "Users can create reviews for purchased books" 
ON public.book_reviews 
FOR INSERT 
WITH CHECK (
    auth.uid() = user_id 
    AND EXISTS (
        SELECT 1 FROM public.purchases 
        WHERE purchases.user_id = auth.uid() 
        AND purchases.book_id = book_reviews.book_id
    )
);

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews" 
ON public.book_reviews 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete their own reviews" 
ON public.book_reviews 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_book_reviews_updated_at
BEFORE UPDATE ON public.book_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update book rating when review is added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_book_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating NUMERIC;
    review_count INTEGER;
    target_book_id UUID;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_book_id := OLD.book_id;
    ELSE
        target_book_id := NEW.book_id;
    END IF;

    SELECT COALESCE(AVG(rating), 0), COUNT(*)
    INTO avg_rating, review_count
    FROM public.book_reviews
    WHERE book_id = target_book_id;

    UPDATE public.books
    SET rating = ROUND(avg_rating, 1),
        rating_count = review_count
    WHERE id = target_book_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for rating updates
CREATE TRIGGER update_rating_on_insert
AFTER INSERT ON public.book_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_book_rating();

CREATE TRIGGER update_rating_on_update
AFTER UPDATE ON public.book_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_book_rating();

CREATE TRIGGER update_rating_on_delete
AFTER DELETE ON public.book_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_book_rating();