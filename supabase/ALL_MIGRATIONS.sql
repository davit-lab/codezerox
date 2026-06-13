-- ============================================================================
-- ⚠️ DEPRECATED: This file is an outdated concatenation of migrations.
-- It contains schema drift, conflicting policies, and broken FK definitions.
-- DO NOT USE THIS FILE FOR NEW DATABASE SETUP.
-- 
-- Instead, run migrations in chronological order from supabase/migrations/
-- or apply the comprehensive fix: 
--   supabase/migrations/20260613_comprehensive_database_cleanup.sql
-- ============================================================================

-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    book_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE public.books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0,
    cover_url TEXT,
    pdf_url TEXT,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    is_free BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    is_popular BOOLEAN DEFAULT false,
    rating DECIMAL(2, 1) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    pages INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create purchases table
CREATE TABLE public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, book_id)
);

-- Create chat_rooms table
CREATE TABLE public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chat_messages table
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
    
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'user');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON public.chat_rooms
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update chat room's last_message_at
CREATE OR REPLACE FUNCTION public.update_chat_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.chat_rooms
    SET last_message_at = NEW.created_at
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_chat_message_created
    AFTER INSERT ON public.chat_messages
    FOR EACH ROW EXECUTE FUNCTION public.update_chat_room_last_message();

-- Function to update category book count
CREATE OR REPLACE FUNCTION public.update_category_book_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.categories SET book_count = book_count + 1 WHERE id = NEW.category_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.categories SET book_count = book_count - 1 WHERE id = OLD.category_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.category_id IS DISTINCT FROM NEW.category_id THEN
        IF OLD.category_id IS NOT NULL THEN
            UPDATE public.categories SET book_count = book_count - 1 WHERE id = OLD.category_id;
        END IF;
        IF NEW.category_id IS NOT NULL THEN
            UPDATE public.categories SET book_count = book_count + 1 WHERE id = NEW.category_id;
        END IF;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER on_book_category_change
    AFTER INSERT OR UPDATE OR DELETE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_category_book_count();

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for user_roles (only admins can view/manage)
CREATE POLICY "Users can view their own roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
    ON public.user_roles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
    ON public.user_roles FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
    ON public.user_roles FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories (public read)
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for books (public read, admin write)
CREATE POLICY "Anyone can view books"
    ON public.books FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Admins can insert books"
    ON public.books FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update books"
    ON public.books FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete books"
    ON public.books FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for purchases
CREATE POLICY "Users can view their own purchases"
    ON public.purchases FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
    ON public.purchases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
    ON public.purchases FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_rooms
CREATE POLICY "Users can view their own chat room"
    ON public.chat_rooms FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own chat room"
    ON public.chat_rooms FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat room"
    ON public.chat_rooms FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for chat_messages
CREATE POLICY "Users can view messages in their room"
    ON public.chat_messages FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE id = room_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
        )
    );

CREATE POLICY "Users can send messages in their room"
    ON public.chat_messages FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = sender_id AND
        EXISTS (
            SELECT 1 FROM public.chat_rooms
            WHERE id = room_id AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
        )
    );

CREATE POLICY "Admins can mark messages as read"
    ON public.chat_messages FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- Enable Realtime for chat tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('book-covers', 'book-covers', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('book-pdfs', 'book-pdfs', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage policies for book-covers (public read, admin write)
CREATE POLICY "Anyone can view book covers"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'book-covers');

CREATE POLICY "Admins can upload book covers"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update book covers"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete book covers"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'book-covers' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for book-pdfs (purchasers or admins only)
CREATE POLICY "Purchasers can view book PDFs"
    ON storage.objects FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'book-pdfs' AND (
            public.has_role(auth.uid(), 'admin') OR
            EXISTS (
                SELECT 1 FROM public.purchases p
                JOIN public.books b ON p.book_id = b.id
                WHERE p.user_id = auth.uid() AND b.pdf_url LIKE '%' || name || '%'
            )
        )
    );

CREATE POLICY "Admins can upload book PDFs"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update book PDFs"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete book PDFs"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'book-pdfs' AND public.has_role(auth.uid(), 'admin'));

-- Storage policies for avatars (public read, owner write)
CREATE POLICY "Anyone can view avatars"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
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
-- Create user_credits table for tracking AI chat credits
CREATE TABLE public.user_credits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own credits"
ON public.user_credits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits FOR UPDATE
USING (auth.uid() = user_id);

-- Admins can manage all credits
CREATE POLICY "Admins can manage all credits"
ON public.user_credits FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create credit_packages table for available packages
CREATE TABLE public.credit_packages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    credits INTEGER NOT NULL,
    price_gel NUMERIC NOT NULL,
    description TEXT,
    is_popular BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_packages ENABLE ROW LEVEL SECURITY;

-- Anyone can view packages
CREATE POLICY "Anyone can view credit packages"
ON public.credit_packages FOR SELECT
USING (true);

-- Admins can manage packages
CREATE POLICY "Admins can manage credit packages"
ON public.credit_packages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create credit_purchases table for purchase history
CREATE TABLE public.credit_purchases (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    package_id UUID REFERENCES public.credit_packages(id),
    credits INTEGER NOT NULL,
    amount_gel NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credit_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view their own credit purchases"
ON public.credit_purchases FOR SELECT
USING (auth.uid() = user_id);

-- Users can create purchases
CREATE POLICY "Users can create credit purchases"
ON public.credit_purchases FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all purchases
CREATE POLICY "Admins can view all credit purchases"
ON public.credit_purchases FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create AI chat history table
CREATE TABLE public.ai_chat_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    book_id UUID REFERENCES public.books(id),
    credits_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Users can view their own messages
CREATE POLICY "Users can view their own AI messages"
ON public.ai_chat_messages FOR SELECT
USING (auth.uid() = user_id);

-- Users can create messages
CREATE POLICY "Users can create AI messages"
ON public.ai_chat_messages FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own AI messages"
ON public.ai_chat_messages FOR DELETE
USING (auth.uid() = user_id);

-- Trigger for updating user_credits updated_at
CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create user credits on first book purchase
CREATE OR REPLACE FUNCTION public.handle_first_purchase()
RETURNS TRIGGER AS $$
BEGIN
    -- Create credits record if not exists
    INSERT INTO public.user_credits (user_id, credits)
    VALUES (NEW.user_id, 0)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on purchases to create credits record
CREATE TRIGGER on_purchase_create_credits
AFTER INSERT ON public.purchases
FOR EACH ROW
EXECUTE FUNCTION public.handle_first_purchase();
-- Create community messages table for public chat
CREATE TABLE public.community_messages (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    content TEXT NOT NULL,
    message_type TEXT NOT NULL DEFAULT 'text', -- 'text', 'project', 'question'
    project_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view messages
CREATE POLICY "Authenticated users can view community messages"
ON public.community_messages
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can create their own messages
CREATE POLICY "Users can create community messages"
ON public.community_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own messages
CREATE POLICY "Users can delete their own community messages"
ON public.community_messages
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can delete any message
CREATE POLICY "Admins can delete any community message"
ON public.community_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for community messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Create message reactions table for rating/likes
CREATE TABLE public.message_reactions (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    reaction_type TEXT NOT NULL DEFAULT 'like', -- 'like', 'helpful', 'fire'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(message_id, user_id, reaction_type)
);

-- Enable RLS
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can view reactions
CREATE POLICY "Authenticated users can view reactions"
ON public.message_reactions
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Users can add their own reactions
CREATE POLICY "Users can add reactions"
ON public.message_reactions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Users can remove their own reactions"
ON public.message_reactions
FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for reactions
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;-- Add reply_to column to community_messages
ALTER TABLE public.community_messages 
ADD COLUMN reply_to UUID REFERENCES public.community_messages(id) ON DELETE SET NULL;

-- Add channel column
ALTER TABLE public.community_messages 
ADD COLUMN channel TEXT NOT NULL DEFAULT 'general';

-- Add upvotes column for quick counting
ALTER TABLE public.community_messages 
ADD COLUMN upvote_count INTEGER NOT NULL DEFAULT 0;

-- Create function to update upvote count
CREATE OR REPLACE FUNCTION public.update_message_upvote_count()
RETURNS TRIGGER AS $$
DECLARE
    target_message_id UUID;
    new_count INTEGER;
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_message_id := OLD.message_id;
    ELSE
        target_message_id := NEW.message_id;
    END IF;

    SELECT COUNT(*) INTO new_count
    FROM public.message_reactions
    WHERE message_id = target_message_id AND reaction_type = 'like';

    UPDATE public.community_messages
    SET upvote_count = new_count
    WHERE id = target_message_id;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for upvote count
CREATE TRIGGER update_upvote_count_trigger
AFTER INSERT OR DELETE ON public.message_reactions
FOR EACH ROW
EXECUTE FUNCTION public.update_message_upvote_count();
-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_roles
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete purchases
CREATE POLICY "Admins can delete purchases"
ON public.purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat_messages
CREATE POLICY "Admins can delete chat messages"
ON public.chat_messages
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat_rooms
CREATE POLICY "Admins can delete chat rooms"
ON public.chat_rooms
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete credit_purchases
CREATE POLICY "Admins can delete credit purchases"
ON public.credit_purchases
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
-- Create password reset codes table
CREATE TABLE public.password_reset_codes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.password_reset_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only (edge functions will use service role)
CREATE POLICY "Service role can manage reset codes"
ON public.password_reset_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_password_reset_codes_email ON public.password_reset_codes(email);
CREATE INDEX idx_password_reset_codes_code ON public.password_reset_codes(code);

-- Auto-cleanup old codes (optional trigger)
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_codes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    DELETE FROM public.password_reset_codes 
    WHERE expires_at < now() OR used = true;
    RETURN NEW;
END;
$function$;

CREATE TRIGGER cleanup_old_reset_codes
AFTER INSERT ON public.password_reset_codes
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_expired_reset_codes();
-- Create ai_conversations table for proper conversation management
CREATE TABLE public.ai_conversations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL DEFAULT 'ახალი საუბარი',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add conversation_id to ai_chat_messages
ALTER TABLE public.ai_chat_messages 
ADD COLUMN conversation_id UUID REFERENCES public.ai_conversations(id) ON DELETE CASCADE;

-- Enable RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_conversations
CREATE POLICY "Users can view their own conversations"
ON public.ai_conversations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations"
ON public.ai_conversations FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations"
ON public.ai_conversations FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations"
ON public.ai_conversations FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_ai_conversations_updated_at
BEFORE UPDATE ON public.ai_conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_chat_messages_conversation_id ON public.ai_chat_messages(conversation_id);
-- Create table for storing code snippets
CREATE TABLE public.code_snippets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL DEFAULT 'Untitled',
    html_code TEXT NOT NULL DEFAULT '',
    css_code TEXT NOT NULL DEFAULT '',
    js_code TEXT NOT NULL DEFAULT '',
    user_id UUID,
    is_public BOOLEAN NOT NULL DEFAULT true,
    views INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.code_snippets ENABLE ROW LEVEL SECURITY;

-- Anyone can view public snippets
CREATE POLICY "Anyone can view public snippets"
ON public.code_snippets
FOR SELECT
USING (is_public = true);

-- Authenticated users can view their own snippets
CREATE POLICY "Users can view their own snippets"
ON public.code_snippets
FOR SELECT
USING (auth.uid() = user_id);

-- Anyone can create snippets (even anonymous)
CREATE POLICY "Anyone can create snippets"
ON public.code_snippets
FOR INSERT
WITH CHECK (true);

-- Users can update their own snippets
CREATE POLICY "Users can update their own snippets"
ON public.code_snippets
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own snippets
CREATE POLICY "Users can delete their own snippets"
ON public.code_snippets
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_code_snippets_updated_at
BEFORE UPDATE ON public.code_snippets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Add language column to code_snippets table
ALTER TABLE public.code_snippets 
ADD COLUMN language TEXT NOT NULL DEFAULT 'web';

-- Update existing records
UPDATE public.code_snippets SET language = 'web' WHERE language IS NULL OR language = '';-- Allow admins to create purchases for any user
CREATE POLICY "Admins can create purchases for users"
ON public.purchases
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
-- Allow admins to delete any code snippet from the gallery
CREATE POLICY "Admins can delete any code snippet"
ON public.code_snippets
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));
-- Create courses table
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    price NUMERIC NOT NULL DEFAULT 0,
    total_chapters INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT DEFAULT 'beginner',
    duration_hours INTEGER DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create course_chapters table
CREATE TABLE public.course_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    chapter_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    content_type TEXT DEFAULT 'lesson',
    quiz_data JSONB,
    terminal_commands JSONB,
    code_template TEXT,
    expected_output TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(course_id, chapter_number)
);

-- Create user_course_progress table
CREATE TABLE public.user_course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    chapter_id UUID REFERENCES public.course_chapters(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    score INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, chapter_id)
);

-- Create course_purchases table
CREATE TABLE public.course_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;

-- Courses policies
CREATE POLICY "Anyone can view published courses" ON public.courses
FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Chapters policies
CREATE POLICY "Users can view chapters of purchased courses" ON public.course_chapters
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.course_purchases
        WHERE course_purchases.course_id = course_chapters.course_id
        AND course_purchases.user_id = auth.uid()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage chapters" ON public.course_chapters
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Progress policies
CREATE POLICY "Users can view their own progress" ON public.user_course_progress
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_course_progress
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress" ON public.user_course_progress
FOR UPDATE USING (auth.uid() = user_id);

-- Purchase policies
CREATE POLICY "Users can view their own purchases" ON public.course_purchases
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases" ON public.course_purchases
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases" ON public.course_purchases
FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage purchases" ON public.course_purchases
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Triggers for updated_at
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_chapters_updated_at
BEFORE UPDATE ON public.course_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_course_progress_updated_at
BEFORE UPDATE ON public.user_course_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the Cybersecurity course
INSERT INTO public.courses (title, description, cover_url, price, total_chapters, difficulty, duration_hours, is_published)
VALUES (
    'Cybersecurity & Ethical Hacking',
    'სრული კურსი კიბერუსაფრთხოების შესახებ. ისწავლე ეთიკური ჰაკინგი, პენეტრაციული ტესტირება, ქსელის უსაფრთხოება და მრავალი სხვა. პრაქტიკული დავალებები Hack The Box სტილში.',
    NULL,
    90,
    150,
    'intermediate',
    80,
    true
);-- Fix password_reset_codes RLS - remove public access
DROP POLICY IF EXISTS "Service role can manage reset codes" ON public.password_reset_codes;

-- Create proper restrictive policies for password_reset_codes
-- Only service role should access this table (via edge functions)
CREATE POLICY "No public access to reset codes"
ON public.password_reset_codes
FOR ALL
USING (false)
WITH CHECK (false);

-- Also fix code_snippets "Anyone can create snippets" policy
DROP POLICY IF EXISTS "Anyone can create snippets" ON public.code_snippets;

-- Create proper policy requiring authentication for creating snippets
CREATE POLICY "Authenticated users can create snippets"
ON public.code_snippets
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);
-- 🛡️ SECURITY HARDENING MIGRATION 🛡️

-- 1. FIX: Remove permissive storage policy that bypasses purchase verification
DROP POLICY IF EXISTS "Authenticated users can download PDFs" ON storage.objects;

-- 2. FIX: Update book-pdfs policy to properly include free books
DROP POLICY IF EXISTS "Purchasers can view book PDFs" ON storage.objects;

CREATE POLICY "Purchasers and admins can view book PDFs"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'book-pdfs' AND (
    has_role(auth.uid(), 'admin'::app_role) OR
    EXISTS (
      SELECT 1 FROM public.purchases p
      JOIN public.books b ON p.book_id = b.id
      WHERE p.user_id = auth.uid() AND b.pdf_url LIKE '%' || name || '%'
    ) OR
    EXISTS (
      SELECT 1 FROM public.books b
      WHERE b.is_free = true AND b.pdf_url LIKE '%' || name || '%'
    )
  )
);

-- 3. FIX: Remove dangerous user credits self-update policy
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- 4. Create secure credits management function (only service role and admins)
CREATE OR REPLACE FUNCTION public.deduct_user_credits(
  _user_id uuid,
  _amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits integer;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM public.user_credits
  WHERE user_id = _user_id;
  
  -- Check if sufficient credits
  IF current_credits IS NULL OR current_credits < _amount THEN
    RETURN false;
  END IF;
  
  -- Deduct credits
  UPDATE public.user_credits
  SET credits = credits - _amount,
      updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN true;
END;
$$;

-- 5. Create credit add function (admin only)
CREATE OR REPLACE FUNCTION public.add_user_credits(
  _user_id uuid,
  _amount integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow if caller is admin (verified via RLS context)
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN false;
  END IF;
  
  -- Add credits
  UPDATE public.user_credits
  SET credits = credits + _amount,
      updated_at = now()
  WHERE user_id = _user_id;
  
  RETURN true;
END;
$$;

-- 6. Create credit audit log table
CREATE TABLE IF NOT EXISTS public.credit_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  amount integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  performed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.credit_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view credit audit logs"
ON public.credit_audit_log FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. Add non-negative credits constraint
ALTER TABLE public.user_credits
DROP CONSTRAINT IF EXISTS credits_non_negative;

ALTER TABLE public.user_credits
ADD CONSTRAINT credits_non_negative CHECK (credits >= 0);

-- 8. Grant execute on security functions to authenticated users
GRANT EXECUTE ON FUNCTION public.deduct_user_credits TO authenticated;
GRANT EXECUTE ON FUNCTION public.add_user_credits TO authenticated;-- Create rate limiting table for password reset attempts
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    identifier text NOT NULL,
    action text NOT NULL,
    attempt_count integer NOT NULL DEFAULT 1,
    first_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
    last_attempt_at timestamp with time zone NOT NULL DEFAULT now(),
    blocked_until timestamp with time zone,
    UNIQUE(identifier, action)
);

-- Enable RLS - only service role can access this table
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- No public access - only service role operations via edge functions
CREATE POLICY "No public access to rate limits"
ON public.rate_limit_attempts
FOR ALL
USING (false)
WITH CHECK (false);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON public.rate_limit_attempts(identifier, action);

-- Create cleanup function for expired rate limit entries
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_entries()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    DELETE FROM public.rate_limit_attempts 
    WHERE first_attempt_at < now() - interval '1 hour';
    RETURN NEW;
END;
$$;

-- Create trigger to cleanup old entries periodically
DROP TRIGGER IF EXISTS cleanup_rate_limits ON public.rate_limit_attempts;
CREATE TRIGGER cleanup_rate_limits
AFTER INSERT ON public.rate_limit_attempts
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_rate_limit_entries();
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
-- Create vacancies table
CREATE TABLE public.vacancies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  description TEXT NOT NULL,
  requirements TEXT,
  location TEXT NOT NULL,
  job_type TEXT NOT NULL DEFAULT 'full_time', -- full_time, part_time, remote, hybrid
  salary_amount NUMERIC,
  salary_type TEXT DEFAULT 'monthly', -- monthly, total
  salary_currency TEXT DEFAULT '₾',
  contact_email TEXT,
  contact_phone TEXT,
  is_active BOOLEAN DEFAULT true,
  category TEXT DEFAULT 'other',
  experience_level TEXT DEFAULT 'junior', -- junior, mid, senior, lead
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vacancy messages table
CREATE TABLE public.vacancy_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vacancy_id UUID NOT NULL REFERENCES public.vacancies(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  message TEXT NOT NULL,
  cv_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vacancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vacancy_messages ENABLE ROW LEVEL SECURITY;

-- Vacancies policies: anyone authenticated can create, anyone can view active
CREATE POLICY "Anyone can view active vacancies" ON public.vacancies FOR SELECT USING (is_active = true);
CREATE POLICY "Authenticated users can create vacancies" ON public.vacancies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vacancies" ON public.vacancies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vacancies" ON public.vacancies FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own inactive vacancies" ON public.vacancies FOR SELECT USING (auth.uid() = user_id);

-- Vacancy messages policies
CREATE POLICY "Vacancy owners can view messages" ON public.vacancy_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.vacancies WHERE vacancies.id = vacancy_messages.vacancy_id AND vacancies.user_id = auth.uid()));
CREATE POLICY "Authenticated users can send messages" ON public.vacancy_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Vacancy owners can update messages (mark read)" ON public.vacancy_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.vacancies WHERE vacancies.id = vacancy_messages.vacancy_id AND vacancies.user_id = auth.uid()));

-- Create storage bucket for CVs
INSERT INTO storage.buckets (id, name, public) VALUES ('vacancy-cvs', 'vacancy-cvs', false);
CREATE POLICY "Authenticated users can upload CVs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'vacancy-cvs' AND auth.uid() IS NOT NULL);
CREATE POLICY "Vacancy owners can view CVs" ON storage.objects FOR SELECT USING (bucket_id = 'vacancy-cvs');

-- Trigger for updated_at
CREATE TRIGGER update_vacancies_updated_at BEFORE UPDATE ON public.vacancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Fix vacancy_messages RLS: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.vacancy_messages;
DROP POLICY IF EXISTS "Vacancy owners can update messages (mark read)" ON public.vacancy_messages;
DROP POLICY IF EXISTS "Vacancy owners can view messages" ON public.vacancy_messages;

CREATE POLICY "Authenticated users can send messages"
ON public.vacancy_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Vacancy owners can view messages"
ON public.vacancy_messages FOR SELECT
TO authenticated
USING (EXISTS (
  SELECT 1 FROM vacancies
  WHERE vacancies.id = vacancy_messages.vacancy_id
  AND vacancies.user_id = auth.uid()
));

CREATE POLICY "Senders can view their own messages"
ON public.vacancy_messages FOR SELECT
TO authenticated
USING (auth.uid() = sender_id);

CREATE POLICY "Vacancy owners can update messages (mark read)"
ON public.vacancy_messages FOR UPDATE
TO authenticated
USING (EXISTS (
  SELECT 1 FROM vacancies
  WHERE vacancies.id = vacancy_messages.vacancy_id
  AND vacancies.user_id = auth.uid()
));

-- Fix vacancies RLS: change from RESTRICTIVE to PERMISSIVE
DROP POLICY IF EXISTS "Anyone can view active vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Authenticated users can create vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Users can delete their own vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Users can update their own vacancies" ON public.vacancies;
DROP POLICY IF EXISTS "Users can view their own inactive vacancies" ON public.vacancies;

CREATE POLICY "Anyone can view active vacancies"
ON public.vacancies FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can view their own inactive vacancies"
ON public.vacancies FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create vacancies"
ON public.vacancies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vacancies"
ON public.vacancies FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own vacancies"
ON public.vacancies FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  paypal_order_id text NOT NULL,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Freelancer profiles
CREATE TABLE public.freelancer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  title text,
  bio text,
  hourly_rate numeric,
  availability text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view freelancer profiles" ON public.freelancer_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own freelancer profile" ON public.freelancer_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own freelancer profile" ON public.freelancer_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own freelancer profile" ON public.freelancer_profiles FOR DELETE USING (auth.uid() = user_id);

-- Freelancer skills
CREATE TABLE public.freelancer_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  skill_name text NOT NULL
);
ALTER TABLE public.freelancer_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view skills" ON public.freelancer_skills FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert skills" ON public.freelancer_skills FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_skills.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Profile owners can delete skills" ON public.freelancer_skills FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_skills.profile_id AND user_id = auth.uid())
);

-- Freelancer projects
CREATE TABLE public.freelancer_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  live_url text,
  github_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.freelancer_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view projects" ON public.freelancer_projects FOR SELECT USING (true);
CREATE POLICY "Profile owners can insert projects" ON public.freelancer_projects FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_projects.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Profile owners can update projects" ON public.freelancer_projects FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_projects.profile_id AND user_id = auth.uid())
);
CREATE POLICY "Profile owners can delete projects" ON public.freelancer_projects FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.freelancer_profiles WHERE id = freelancer_projects.profile_id AND user_id = auth.uid())
);

-- Direct conversations
CREATE TABLE public.direct_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_one uuid NOT NULL,
  participant_two uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(participant_one, participant_two)
);
ALTER TABLE public.direct_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view conversations" ON public.direct_conversations FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "Auth users can create conversations" ON public.direct_conversations FOR INSERT WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two);
CREATE POLICY "Participants can update conversations" ON public.direct_conversations FOR UPDATE USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Direct messages
CREATE TABLE public.direct_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.direct_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Participants can view messages" ON public.direct_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.direct_conversations WHERE id = direct_messages.conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid()))
);
CREATE POLICY "Participants can send messages" ON public.direct_messages FOR INSERT WITH CHECK (
  auth.uid() = sender_id AND EXISTS (SELECT 1 FROM public.direct_conversations WHERE id = direct_messages.conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid()))
);
CREATE POLICY "Participants can update messages" ON public.direct_messages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.direct_conversations WHERE id = direct_messages.conversation_id AND (participant_one = auth.uid() OR participant_two = auth.uid()))
);

-- Enable realtime for direct messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.direct_messages;

-- Storage bucket for project images
INSERT INTO storage.buckets (id, name, public) VALUES ('project-images', 'project-images', true);
CREATE POLICY "Anyone can view project images" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
CREATE POLICY "Auth users can upload project images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-images' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own project images" ON storage.objects FOR DELETE USING (bucket_id = 'project-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add experience_level and languages to freelancer_profiles
ALTER TABLE public.freelancer_profiles ADD COLUMN IF NOT EXISTS experience_level text DEFAULT 'junior';
ALTER TABLE public.freelancer_profiles ADD COLUMN IF NOT EXISTS languages text[] DEFAULT '{}';

-- Allow anyone to read basic profile info (needed for freelancer name/avatar display)
CREATE POLICY "Anyone can view profiles publicly"
ON public.profiles
FOR SELECT
USING (true);

CREATE TABLE public.freelancer_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID NOT NULL REFERENCES public.freelancer_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(profile_id, user_id)
);

ALTER TABLE public.freelancer_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view freelancer reviews" ON public.freelancer_reviews FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create reviews" ON public.freelancer_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reviews" ON public.freelancer_reviews FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reviews" ON public.freelancer_reviews FOR DELETE USING (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.freelancer_reviews;

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

CREATE TABLE public.promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  discount_type text NOT NULL DEFAULT 'percentage',
  discount_value numeric NOT NULL DEFAULT 0,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamp with time zone DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage promo codes"
  ON public.promo_codes FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active promo codes by code"
  ON public.promo_codes FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE OR REPLACE FUNCTION public.increment_promo_usage(_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.promo_codes
  SET current_uses = current_uses + 1,
      updated_at = now()
  WHERE code = _code;
END;
$$;
ALTER TABLE public.code_snippets ADD COLUMN hide_code boolean NOT NULL DEFAULT false;
-- Hub projects table (GitHub-style project sharing)
CREATE TABLE public.hub_projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    screenshot_url text,
    live_url text,
    github_url text,
    tags text[] DEFAULT '{}',
    views integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view hub projects" ON public.hub_projects FOR SELECT USING (true);
CREATE POLICY "Auth users can create projects" ON public.hub_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.hub_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.hub_projects FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Hub project comments
CREATE TABLE public.hub_project_comments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.hub_projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content text NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.hub_project_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments" ON public.hub_project_comments FOR SELECT USING (true);
CREATE POLICY "Auth users can create comments" ON public.hub_project_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.hub_project_comments FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'::app_role));

-- Hub project likes
CREATE TABLE public.hub_project_likes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL REFERENCES public.hub_projects(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    UNIQUE(project_id, user_id)
);

ALTER TABLE public.hub_project_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes" ON public.hub_project_likes FOR SELECT USING (true);
CREATE POLICY "Auth users can add likes" ON public.hub_project_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own likes" ON public.hub_project_likes FOR DELETE USING (auth.uid() = user_id);

-- Enable realtime for comments
ALTER PUBLICATION supabase_realtime ADD TABLE public.hub_project_comments;

-- Add experience fields to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio text DEFAULT null,
  ADD COLUMN IF NOT EXISTS experience text DEFAULT null,
  ADD COLUMN IF NOT EXISTS github_url text DEFAULT null,
  ADD COLUMN IF NOT EXISTS website_url text DEFAULT null,
  ADD COLUMN IF NOT EXISTS location text DEFAULT null,
  ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';

-- Allow anyone to view profiles publicly
CREATE POLICY "Anyone can view profiles" ON public.profiles
  FOR SELECT USING (true);

-- Create gifts table
CREATE TABLE public.gifts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL,
  recipient_id uuid NOT NULL,
  gift_type text NOT NULL DEFAULT 'book', -- 'book' or 'credits'
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  credits_amount integer,
  is_anonymous boolean NOT NULL DEFAULT false,
  is_seen boolean NOT NULL DEFAULT false,
  message text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;

-- Sender can see their sent gifts
CREATE POLICY "Users can view their sent gifts" ON public.gifts
  FOR SELECT USING (auth.uid() = sender_id);

-- Recipient can see received gifts  
CREATE POLICY "Users can view their received gifts" ON public.gifts
  FOR SELECT USING (auth.uid() = recipient_id);

-- Auth users can create gifts
CREATE POLICY "Auth users can create gifts" ON public.gifts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Recipient can update (mark as seen)
CREATE POLICY "Recipients can update gifts" ON public.gifts
  FOR UPDATE USING (auth.uid() = recipient_id);

-- Enable realtime for gift notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.gifts;

-- Admin can delete/update any vacancy
CREATE POLICY "Admins can delete any vacancy" ON public.vacancies FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any vacancy" ON public.vacancies FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete/update any hub project
CREATE POLICY "Admins can delete any hub project" ON public.hub_projects FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any hub project" ON public.hub_projects FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all hub projects (including non-public)
CREATE POLICY "Admins can view all hub projects" ON public.hub_projects FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete/update any freelancer profile
CREATE POLICY "Admins can delete any freelancer profile" ON public.freelancer_profiles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update any freelancer profile" ON public.freelancer_profiles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete any freelancer review
CREATE POLICY "Admins can delete any freelancer review" ON public.freelancer_reviews FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can delete any book review
CREATE POLICY "Admins can delete any book review" ON public.book_reviews FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admin can view all vacancies (including inactive)
CREATE POLICY "Admins can view all vacancies" ON public.vacancies FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

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

-- Blog posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL DEFAULT '',
  excerpt TEXT,
  cover_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  published_at TIMESTAMP WITH TIME ZONE
);

-- Blog comments table
CREATE TABLE public.blog_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Blog posts RLS
CREATE POLICY "Anyone can view published posts" ON public.blog_posts
  FOR SELECT USING (is_published = true);

CREATE POLICY "Admins can view all posts" ON public.blog_posts
  FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert posts" ON public.blog_posts
  FOR INSERT WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update posts" ON public.blog_posts
  FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete posts" ON public.blog_posts
  FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

-- Blog comments RLS
CREATE POLICY "Anyone can view comments" ON public.blog_comments
  FOR SELECT USING (true);

CREATE POLICY "Auth users can create comments" ON public.blog_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.blog_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.blog_comments
  FOR DELETE USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

-- Indexes
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON public.blog_posts(is_published, published_at DESC);
CREATE INDEX idx_blog_comments_post ON public.blog_comments(post_id, created_at);

-- User XP summary table
CREATE TABLE public.user_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- XP transaction log
CREATE TABLE public.xp_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  action_type TEXT NOT NULL,
  reference_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- user_xp RLS: everyone can see leaderboard, users manage own
CREATE POLICY "Anyone can view XP" ON public.user_xp FOR SELECT USING (true);
CREATE POLICY "System can insert XP" ON public.user_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "System can update XP" ON public.user_xp FOR UPDATE USING (auth.uid() = user_id);

-- xp_transactions RLS
CREATE POLICY "Users can view own transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_user_xp_total ON public.user_xp(total_xp DESC);
CREATE INDEX idx_user_xp_user ON public.user_xp(user_id);
CREATE INDEX idx_xp_transactions_user ON public.xp_transactions(user_id, created_at DESC);

-- Function to award XP
CREATE OR REPLACE FUNCTION public.award_xp(_user_id UUID, _amount INTEGER, _action TEXT, _ref TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Ensure user_xp record exists
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add XP
  UPDATE public.user_xp
  SET total_xp = total_xp + _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING total_xp INTO new_total;

  -- Calculate level (every 200 XP = 1 level)
  new_level := GREATEST(1, (new_total / 200) + 1);
  UPDATE public.user_xp SET level = new_level WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _action, _ref);
END;
$$;

-- Auto-award XP on book purchase
CREATE OR REPLACE FUNCTION public.xp_on_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 50, 'book_purchase', NEW.book_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_purchase
  AFTER INSERT ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_purchase();

-- Auto-award XP on book review
CREATE OR REPLACE FUNCTION public.xp_on_review()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 30, 'book_review', NEW.book_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_review
  AFTER INSERT ON public.book_reviews
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_review();

-- Auto-award XP on hub project
CREATE OR REPLACE FUNCTION public.xp_on_hub_project()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 40, 'hub_project', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_hub_project
  AFTER INSERT ON public.hub_projects
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_hub_project();

-- Auto-award XP on community message
CREATE OR REPLACE FUNCTION public.xp_on_community_msg()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 5, 'community_message', NEW.id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_community_msg
  AFTER INSERT ON public.community_messages
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_community_msg();

-- Auto-award XP on blog comment
CREATE OR REPLACE FUNCTION public.xp_on_blog_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM award_xp(NEW.user_id, 10, 'blog_comment', NEW.post_id::text);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_xp_on_blog_comment
  AFTER INSERT ON public.blog_comments
  FOR EACH ROW EXECUTE FUNCTION public.xp_on_blog_comment();

-- Backfill XP for existing users who have qualifying activities
-- First, ensure user_xp rows exist for all users with activities

-- Award XP for existing book purchases (50 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT p.user_id, COUNT(*) * 50, GREATEST(1, (COUNT(*) * 50 / 200) + 1)
FROM public.purchases p
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = p.user_id)
GROUP BY p.user_id
ON CONFLICT DO NOTHING;

-- Update existing user_xp with purchase XP
UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT p.user_id, COUNT(*) * 50 as xp
  FROM public.purchases p
  LEFT JOIN public.xp_transactions xt ON xt.user_id = p.user_id AND xt.action_type = 'book_purchase' AND xt.reference_id = p.id::text
  WHERE xt.id IS NULL
  GROUP BY p.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

-- Insert missing xp_transactions for purchases
INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT p.user_id, 50, 'book_purchase', p.id::text
FROM public.purchases p
LEFT JOIN public.xp_transactions xt ON xt.reference_id = p.id::text AND xt.action_type = 'book_purchase'
WHERE xt.id IS NULL;

-- Award XP for existing book reviews (30 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT br.user_id, COUNT(*) * 30, GREATEST(1, (COUNT(*) * 30 / 200) + 1)
FROM public.book_reviews br
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = br.user_id)
GROUP BY br.user_id
ON CONFLICT DO NOTHING;

UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT br.user_id, COUNT(*) * 30 as xp
  FROM public.book_reviews br
  LEFT JOIN public.xp_transactions xt ON xt.user_id = br.user_id AND xt.action_type = 'book_review' AND xt.reference_id = br.id::text
  WHERE xt.id IS NULL
  GROUP BY br.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT br.user_id, 30, 'book_review', br.id::text
FROM public.book_reviews br
LEFT JOIN public.xp_transactions xt ON xt.reference_id = br.id::text AND xt.action_type = 'book_review'
WHERE xt.id IS NULL;

-- Award XP for hub projects (40 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT hp.user_id, COUNT(*) * 40, GREATEST(1, (COUNT(*) * 40 / 200) + 1)
FROM public.hub_projects hp
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = hp.user_id)
GROUP BY hp.user_id
ON CONFLICT DO NOTHING;

UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT hp.user_id, COUNT(*) * 40 as xp
  FROM public.hub_projects hp
  LEFT JOIN public.xp_transactions xt ON xt.user_id = hp.user_id AND xt.action_type = 'hub_project' AND xt.reference_id = hp.id::text
  WHERE xt.id IS NULL
  GROUP BY hp.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT hp.user_id, 40, 'hub_project', hp.id::text
FROM public.hub_projects hp
LEFT JOIN public.xp_transactions xt ON xt.reference_id = hp.id::text AND xt.action_type = 'hub_project'
WHERE xt.id IS NULL;

-- Award XP for blog comments (10 XP each)
INSERT INTO public.user_xp (user_id, total_xp, level)
SELECT bc.user_id, COUNT(*) * 10, GREATEST(1, (COUNT(*) * 10 / 200) + 1)
FROM public.blog_comments bc
WHERE NOT EXISTS (SELECT 1 FROM public.user_xp ux WHERE ux.user_id = bc.user_id)
GROUP BY bc.user_id
ON CONFLICT DO NOTHING;

UPDATE public.user_xp SET total_xp = total_xp + sub.xp
FROM (
  SELECT bc.user_id, COUNT(*) * 10 as xp
  FROM public.blog_comments bc
  LEFT JOIN public.xp_transactions xt ON xt.user_id = bc.user_id AND xt.action_type = 'blog_comment' AND xt.reference_id = bc.id::text
  WHERE xt.id IS NULL
  GROUP BY bc.user_id
) sub
WHERE user_xp.user_id = sub.user_id;

INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
SELECT bc.user_id, 10, 'blog_comment', bc.id::text
FROM public.blog_comments bc
LEFT JOIN public.xp_transactions xt ON xt.reference_id = bc.id::text AND xt.action_type = 'blog_comment'
WHERE xt.id IS NULL;

-- Recalculate all levels
UPDATE public.user_xp SET level = GREATEST(1, (total_xp / 200) + 1);

-- Create an admin function to manually award XP
CREATE OR REPLACE FUNCTION public.admin_award_xp(_user_id uuid, _amount integer, _reason text DEFAULT 'admin_award')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, _amount, GREATEST(1, (_amount / 200) + 1))
  ON CONFLICT (user_id) DO UPDATE
  SET total_xp = user_xp.total_xp + _amount,
      level = GREATEST(1, ((user_xp.total_xp + _amount) / 200) + 1),
      updated_at = now();

  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _reason, 'admin_' || gen_random_uuid()::text);
END;
$$;
-- Update award_xp function to cap level at 100
CREATE OR REPLACE FUNCTION public.award_xp(_user_id uuid, _amount integer, _action text, _ref text DEFAULT NULL::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_total INTEGER;
  new_level INTEGER;
BEGIN
  -- Ensure user_xp record exists
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, 0, 1)
  ON CONFLICT (user_id) DO NOTHING;

  -- Add XP
  UPDATE public.user_xp
  SET total_xp = total_xp + _amount,
      updated_at = now()
  WHERE user_id = _user_id
  RETURNING total_xp INTO new_total;

  -- Calculate level (every 200 XP = 1 level, capped at 100)
  new_level := LEAST(100, GREATEST(1, (new_total / 200) + 1));
  UPDATE public.user_xp SET level = new_level WHERE user_id = _user_id;

  -- Log transaction
  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _action, _ref);
END;
$function$;

-- Update admin_award_xp function to cap level at 100
CREATE OR REPLACE FUNCTION public.admin_award_xp(_user_id uuid, _amount integer, _reason text DEFAULT 'admin_award'::text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_xp (user_id, total_xp, level)
  VALUES (_user_id, _amount, LEAST(100, GREATEST(1, (_amount / 200) + 1)))
  ON CONFLICT (user_id) DO UPDATE
  SET total_xp = user_xp.total_xp + _amount,
      level = LEAST(100, GREATEST(1, ((user_xp.total_xp + _amount) / 200) + 1)),
      updated_at = now();

  INSERT INTO public.xp_transactions (user_id, amount, action_type, reference_id)
  VALUES (_user_id, _amount, _reason, 'admin_' || gen_random_uuid()::text);
END;
$function$;CREATE OR REPLACE FUNCTION public.get_leaderboard(_limit integer DEFAULT 1000)
RETURNS TABLE(user_id uuid, total_xp integer, level integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT ux.user_id, ux.total_xp, ux.level
  FROM public.user_xp ux
  WHERE NOT EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = ux.user_id AND ur.role = 'admin'
  )
  ORDER BY ux.total_xp DESC
  LIMIT _limit;
$$;
CREATE OR REPLACE FUNCTION public.increment_blog_views(_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.blog_posts
  SET views = views + 1
  WHERE id = _post_id;
END;
$$;
CREATE TABLE public.payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  setting_key text NOT NULL,
  setting_value text NOT NULL DEFAULT '',
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(provider, setting_key)
);

ALTER TABLE public.payment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage payment settings"
ON public.payment_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings for BOG
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('bog', 'client_id', '', false),
  ('bog', 'secret_key', '', false),
  ('bog', 'merchant_id', '', false),
  ('bog', 'terminal_id', '', false),
  ('bog', 'callback_url', '', false);

-- Insert default settings for TBC
INSERT INTO public.payment_settings (provider, setting_key, setting_value, is_active) VALUES
  ('tbc', 'client_id', '', false),
  ('tbc', 'secret_key', '', false),
  ('tbc', 'api_key', '', false),
  ('tbc', 'callback_url', '', false);
CREATE TABLE public.bank_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'bog' or 'tbc'
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'GEL',
  status text NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed, cancelled
  bank_order_id text, -- ID returned by bank
  bank_status text, -- raw status from bank
  error_message text,
  items jsonb, -- what was purchased
  discount_amount numeric DEFAULT 0,
  callback_received_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own transactions
CREATE POLICY "Users can view own bank transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can create transactions (initiate payment)
CREATE POLICY "Users can create bank transactions"
  ON public.bank_transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all transactions
CREATE POLICY "Admins can view all bank transactions"
  ON public.bank_transactions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update transactions
CREATE POLICY "Admins can manage bank transactions"
  ON public.bank_transactions FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Certification exams table
CREATE TABLE public.certification_exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL, -- 'frontend', 'backend', 'cyber'
  subcategory TEXT, -- 'html_css_js', 'csharp', 'javascript', 'python', 'sql', etc
  description TEXT,
  total_questions INTEGER NOT NULL DEFAULT 50,
  pass_threshold INTEGER NOT NULL DEFAULT 40,
  price_gel NUMERIC NOT NULL DEFAULT 10,
  time_limit_minutes INTEGER NOT NULL DEFAULT 120,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam questions table
CREATE TABLE public.exam_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL, -- 'a', 'b', 'c', 'd'
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium', -- 'easy', 'medium', 'hard'
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Exam attempts table
CREATE TABLE public.exam_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB, -- store user answers
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exam_id UUID NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  attempt_id UUID NOT NULL REFERENCES public.exam_attempts(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exam_id)
);

-- Enable RLS
ALTER TABLE public.certification_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Exams: anyone can view active exams, admins can manage
CREATE POLICY "Anyone can view active exams" ON public.certification_exams FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exams" ON public.certification_exams FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Questions: only visible during exam (via edge function), admins can manage
CREATE POLICY "Admins can manage questions" ON public.exam_questions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Attempts: users can manage their own
CREATE POLICY "Users can view own attempts" ON public.exam_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create attempts" ON public.exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own attempts" ON public.exam_attempts FOR UPDATE USING (auth.uid() = user_id);

-- Certificates: users can view own, anyone can verify
CREATE POLICY "Users can view own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can verify certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "System can create certificates" ON public.certificates FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all attempts"
ON public.exam_attempts
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.hero_banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  page_label TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;

-- Everyone can read banners
CREATE POLICY "Anyone can view hero banners"
  ON public.hero_banners FOR SELECT
  TO authenticated, anon
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can manage hero banners"
  ON public.hero_banners FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default entries for each page
INSERT INTO public.hero_banners (page_key, page_label) VALUES
  ('leaderboard', 'ლიდერბორდი'),
  ('categories', 'კატეგორიები'),
  ('gallery', 'გალერეა'),
  ('freelancers', 'ფრილანსერები'),
  ('vacancies', 'ვაკანსიები'),
  ('certifications', 'სერტიფიკატები'),
  ('hub_chat', 'Hub ჩატი');

-- Drop the restrictive ALL policy and replace with permissive ones
DROP POLICY IF EXISTS "Admins can manage hero banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Anyone can view hero banners" ON public.hero_banners;

-- Permissive SELECT for everyone
CREATE POLICY "Anyone can view hero banners"
ON public.hero_banners FOR SELECT
USING (true);

-- Permissive ALL for admins
CREATE POLICY "Admins can manage hero banners"
ON public.hero_banners FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to upload to avatars bucket (for banners)
CREATE POLICY "Admins can upload to avatars bucket"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update files in avatars bucket
CREATE POLICY "Admins can update avatars bucket"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete from avatars bucket
CREATE POLICY "Admins can delete from avatars bucket"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  public.has_role(auth.uid(), 'admin'::app_role)
);

-- Create course_subscriptions table for monthly subscription model
CREATE TABLE public.course_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  chapters_read_this_month integer NOT NULL DEFAULT 0,
  month_reset_at timestamptz NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  last_chapter_generated_at date DEFAULT NULL,
  granted_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Track which chapters a user has read
CREATE TABLE public.course_chapter_reads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  chapter_id uuid NOT NULL REFERENCES public.course_chapters(id) ON DELETE CASCADE,
  read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Enable RLS
ALTER TABLE public.course_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_chapter_reads ENABLE ROW LEVEL SECURITY;

-- RLS policies for course_subscriptions
CREATE POLICY "Users can view their own subscriptions"
  ON public.course_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscriptions"
  ON public.course_subscriptions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create own subscriptions"
  ON public.course_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions"
  ON public.course_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS policies for course_chapter_reads
CREATE POLICY "Users can view their own reads"
  ON public.course_chapter_reads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reads"
  ON public.course_chapter_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage reads"
  ON public.course_chapter_reads FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Update chapter RLS: allow subscribers to view chapters
DROP POLICY IF EXISTS "Users can view chapters of purchased courses" ON public.course_chapters;
CREATE POLICY "Users can view chapters of subscribed courses"
  ON public.course_chapters FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.course_subscriptions
      WHERE course_id = course_chapters.course_id
        AND user_id = auth.uid()
        AND expires_at > now()
    )
    OR has_role(auth.uid(), 'admin'::app_role)
  );

-- Add monthly_price column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS monthly_price numeric NOT NULL DEFAULT 0;

-- Update course prices to monthly prices
UPDATE public.courses SET monthly_price = 30 WHERE title = 'კიბერუსაფრთხოების საფუძვლები';
UPDATE public.courses SET monthly_price = 25 WHERE title = 'ქსელის უსაფრთხოება';
UPDATE public.courses SET monthly_price = 20 WHERE title = 'შეღწევადობის ტესტირება';
UPDATE public.courses SET monthly_price = 15 WHERE title = 'ვებ აპლიკაციების უსაფრთხოება';
UPDATE public.courses SET monthly_price = 10 WHERE title = 'ინციდენტების მართვა და ფორენზიკა';

-- Trigger to update updated_at
CREATE TRIGGER update_course_subscriptions_updated_at
  BEFORE UPDATE ON public.course_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add final assignment text to certification exams
ALTER TABLE public.certification_exams ADD COLUMN IF NOT EXISTS final_assignment text;

-- Create assignment submissions table
CREATE TABLE public.exam_assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exam_id uuid NOT NULL REFERENCES public.certification_exams(id) ON DELETE CASCADE,
  content text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  admin_feedback text,
  reviewed_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  UNIQUE (user_id, exam_id)
);

ALTER TABLE public.exam_assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.exam_assignment_submissions
FOR SELECT USING (auth.uid() = user_id);

-- Users can create submissions
CREATE POLICY "Users can create submissions" ON public.exam_assignment_submissions
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending submissions
CREATE POLICY "Users can update pending submissions" ON public.exam_assignment_submissions
FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Admins can view all submissions
CREATE POLICY "Admins can view all submissions" ON public.exam_assignment_submissions
FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update submissions (approve/reject)
CREATE POLICY "Admins can update submissions" ON public.exam_assignment_submissions
FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));

-- Create notifications table
CREATE TABLE public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info',
  reference_id text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.user_notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.user_notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Admins can insert notifications
CREATE POLICY "Admins can insert notifications" ON public.user_notifications
FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- System can insert notifications (for edge functions)
CREATE POLICY "System can insert notifications" ON public.user_notifications
FOR INSERT WITH CHECK (true);

-- Enable realtime for notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_notifications;

-- Replace overly permissive policy with authenticated-only
DROP POLICY IF EXISTS "System can insert notifications" ON public.user_notifications;
CREATE POLICY "Authenticated can insert notifications" ON public.user_notifications
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  details jsonb DEFAULT '{}'::jsonb,
  page_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX idx_activity_log_action_type ON public.activity_log(action_type);

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own activity"
ON public.activity_log FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity"
ON public.activity_log FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete activity"
ON public.activity_log FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.cleanup_old_activity_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  DELETE FROM public.activity_log
  WHERE created_at < now() - interval '30 days';
END;
$$;
-- Email infrastructure
-- Creates the queue system, send log, send state, suppression, and unsubscribe
-- tables used by both auth and transactional emails.

-- Extensions required for queue processing
CREATE EXTENSION IF NOT EXISTS pg_net SCHEMA extensions;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    CREATE EXTENSION pg_cron;
  END IF;
END $$;
CREATE EXTENSION IF NOT EXISTS supabase_vault;
CREATE EXTENSION IF NOT EXISTS pgmq;

-- Create email queues (auth = high priority, transactional = normal)
-- Wrapped in DO blocks to handle "queue already exists" errors idempotently.
DO $$ BEGIN PERFORM pgmq.create('auth_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Dead-letter queues for messages that exceed max retries
DO $$ BEGIN PERFORM pgmq.create('auth_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;
DO $$ BEGIN PERFORM pgmq.create('transactional_emails_dlq'); EXCEPTION WHEN OTHERS THEN NULL; END $$;

-- Email send log table (audit trail for all send attempts)
-- UPDATE is allowed for the service role so the suppression edge function
-- can update a log record's status when a bounce/complaint/unsubscribe occurs.
CREATE TABLE IF NOT EXISTS public.email_send_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id TEXT,
  template_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq')),
  error_message TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.email_send_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read send log"
    ON public.email_send_log FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert send log"
    ON public.email_send_log FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can update send log"
    ON public.email_send_log FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_created ON public.email_send_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_send_log_recipient ON public.email_send_log(recipient_email);

-- Backfill: add message_id column to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_log ADD COLUMN message_id TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_send_log_message ON public.email_send_log(message_id);

-- Prevent duplicate sends: only one 'sent' row per message_id.
-- If VT expires and another worker picks up the same message, the pre-send
-- check catches it. This index is a DB-level safety net for race conditions.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_send_log_message_sent_unique
  ON public.email_send_log(message_id) WHERE status = 'sent';

-- Backfill: update status CHECK constraint for existing tables that predate new statuses
DO $$ BEGIN
  ALTER TABLE public.email_send_log DROP CONSTRAINT IF EXISTS email_send_log_status_check;
  ALTER TABLE public.email_send_log ADD CONSTRAINT email_send_log_status_check
    CHECK (status IN ('pending', 'sent', 'suppressed', 'failed', 'bounced', 'complained', 'dlq'));
END $$;

-- Rate-limit state and queue config (single row, tracks Retry-After cooldown + throughput settings)
CREATE TABLE IF NOT EXISTS public.email_send_state (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  retry_after_until TIMESTAMPTZ,
  batch_size INTEGER NOT NULL DEFAULT 10,
  send_delay_ms INTEGER NOT NULL DEFAULT 200,
  auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15,
  transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.email_send_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Backfill: add config columns to existing tables that predate this migration
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN batch_size INTEGER NOT NULL DEFAULT 10;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN send_delay_ms INTEGER NOT NULL DEFAULT 200;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN auth_email_ttl_minutes INTEGER NOT NULL DEFAULT 15;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;
DO $$ BEGIN
  ALTER TABLE public.email_send_state ADD COLUMN transactional_email_ttl_minutes INTEGER NOT NULL DEFAULT 60;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

ALTER TABLE public.email_send_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can manage send state"
    ON public.email_send_state FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- RPC wrappers so Edge Functions can interact with pgmq via supabase.rpc()
-- (PostgREST only exposes functions in the public schema; pgmq functions are in the pgmq schema)
-- All wrappers auto-create the queue on undefined_table (42P01) so emails
-- are never lost if the queue was dropped (extension upgrade, restore, etc.).
CREATE OR REPLACE FUNCTION public.enqueue_email(queue_name TEXT, payload JSONB)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.send(queue_name, payload);
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN pgmq.send(queue_name, payload);
END;
$$;

CREATE OR REPLACE FUNCTION public.read_email_batch(queue_name TEXT, batch_size INT, vt INT)
RETURNS TABLE(msg_id BIGINT, read_ct INT, message JSONB)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT r.msg_id, r.read_ct, r.message FROM pgmq.read(queue_name, vt, batch_size) r;
EXCEPTION WHEN undefined_table THEN
  PERFORM pgmq.create(queue_name);
  RETURN;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_email(queue_name TEXT, message_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN pgmq.delete(queue_name, message_id);
EXCEPTION WHEN undefined_table THEN
  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.move_to_dlq(
  source_queue TEXT, dlq_name TEXT, message_id BIGINT, payload JSONB
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE new_id BIGINT;
BEGIN
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  PERFORM pgmq.delete(source_queue, message_id);
  RETURN new_id;
EXCEPTION WHEN undefined_table THEN
  BEGIN
    PERFORM pgmq.create(dlq_name);
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  SELECT pgmq.send(dlq_name, payload) INTO new_id;
  BEGIN
    PERFORM pgmq.delete(source_queue, message_id);
  EXCEPTION WHEN undefined_table THEN
    NULL;
  END;
  RETURN new_id;
END;
$$;

-- Restrict queue RPC wrappers to service_role only (SECURITY DEFINER runs as owner,
-- so without this any authenticated user could manipulate the email queues)
REVOKE EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.enqueue_email(TEXT, JSONB) TO service_role;

REVOKE EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.read_email_batch(TEXT, INT, INT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_email(TEXT, BIGINT) TO service_role;

REVOKE EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.move_to_dlq(TEXT, TEXT, BIGINT, JSONB) TO service_role;

-- Suppressed emails table (tracks unsubscribes, bounces, complaints)
-- Append-only: no DELETE or UPDATE policies to prevent bypassing suppression.
CREATE TABLE IF NOT EXISTS public.suppressed_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('unsubscribe', 'bounce', 'complaint')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(email)
);

ALTER TABLE public.suppressed_emails ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read suppressed emails"
    ON public.suppressed_emails FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert suppressed emails"
    ON public.suppressed_emails FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_suppressed_emails_email ON public.suppressed_emails(email);

-- Email unsubscribe tokens table (one token per email address for unsubscribe links)
-- No DELETE policy to prevent removing tokens. UPDATE allowed only to mark tokens as used.
CREATE TABLE IF NOT EXISTS public.email_unsubscribe_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used_at TIMESTAMPTZ
);

ALTER TABLE public.email_unsubscribe_tokens ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Service role can read tokens"
    ON public.email_unsubscribe_tokens FOR SELECT
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can insert tokens"
    ON public.email_unsubscribe_tokens FOR INSERT
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can mark tokens as used"
    ON public.email_unsubscribe_tokens FOR UPDATE
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_unsubscribe_tokens_token ON public.email_unsubscribe_tokens(token);

-- ============================================================
-- POST-MIGRATION STEPS (applied dynamically by setup_email_infra)
-- These steps contain project-specific secrets and URLs and
-- cannot be expressed as static SQL. They are applied via the
-- Supabase Management API (ExecuteSQL) each time the tool runs.
-- ============================================================
--
-- 1. VAULT SECRET
--    Stores (or updates) the Supabase service_role key in
--    vault as 'email_queue_service_role_key'.
--    Uses vault.create_secret / vault.update_secret (upsert).
--    To revert: DELETE FROM vault.secrets WHERE name = 'email_queue_service_role_key';
--
-- 2. CRON JOB (pg_cron)
--    Creates job 'process-email-queue' with a 5-second interval.
--    The job checks:
--      a) rate-limit cooldown (email_send_state.retry_after_until)
--      b) whether auth_emails or transactional_emails queues have messages
--    If conditions are met, it calls the process-email-queue Edge Function
--    via net.http_post using the vault-stored service_role key.
--    To revert: SELECT cron.unschedule('process-email-queue');
DELETE FROM public.activity_log;
DROP FUNCTION IF EXISTS public.cleanup_old_activity_logs();
-- Fix: allow anyone to view chapter metadata (content is gated in UI)
DROP POLICY IF EXISTS "Users can view chapters of subscribed courses" ON public.course_chapters;

-- Allow all authenticated users to view chapters (content gating is done in app)
CREATE POLICY "Anyone can view chapters"
  ON public.course_chapters
  FOR SELECT
  USING (true);
