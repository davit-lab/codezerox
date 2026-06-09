
-- Book updates/editions table
CREATE TABLE public.book_updates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    version_name TEXT NOT NULL DEFAULT 'v2.0',
    description TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    is_free BOOLEAN NOT NULL DEFAULT false,
    pdf_url TEXT,
    pages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Track who purchased the update
CREATE TABLE public.update_purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    update_id UUID NOT NULL REFERENCES public.book_updates(id) ON DELETE CASCADE,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, update_id)
);

-- RLS
ALTER TABLE public.book_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.update_purchases ENABLE ROW LEVEL SECURITY;

-- book_updates policies
CREATE POLICY "Anyone can view book updates" ON public.book_updates FOR SELECT USING (true);
CREATE POLICY "Admins can manage book updates" ON public.book_updates FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- update_purchases policies  
CREATE POLICY "Users can view their own update purchases" ON public.update_purchases FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create update purchases" ON public.update_purchases FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all update purchases" ON public.update_purchases FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can manage update purchases" ON public.update_purchases FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
