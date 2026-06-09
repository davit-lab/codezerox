-- ============================================================================
-- FULL DATABASE SCHEMA - FIXED VERSION (app_role already exists)
-- ============================================================================

-- Skip app_role creation - it already exists!
-- CREATE TYPE public.app_role AS ENUM ('admin', 'user');  -- REMOVED

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',  -- Uses existing app_role type
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'folder',
    book_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create books table
CREATE TABLE IF NOT EXISTS public.books (
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
CREATE TABLE IF NOT EXISTS public.purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, book_id)
);

-- ============================================================================
-- BOOK SUBSCRIPTION SYSTEM (NEW!)
-- ============================================================================

-- Subscription plans table
CREATE TABLE IF NOT EXISTS book_subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- 'monthly', 'yearly'
    display_name TEXT NOT NULL, -- 'თვიური', 'წლიური'
    price_gel NUMERIC NOT NULL,
    interval TEXT NOT NULL, -- 'month', 'year'
    interval_count INTEGER NOT NULL DEFAULT 1,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans (if not exists)
INSERT INTO book_subscription_plans (name, display_name, price_gel, interval, interval_count, description)
SELECT 'monthly', 'თვიური', 20, 'month', 1, 'ყველა წიგნზე წვდომა თვეში'
WHERE NOT EXISTS (SELECT 1 FROM book_subscription_plans WHERE name = 'monthly');

INSERT INTO book_subscription_plans (name, display_name, price_gel, interval, interval_count, description)
SELECT 'yearly', 'წლიური', 120, 'year', 1, 'ყველა წიგნზე წვდომა წელიწადში (40% ფასდაკლება)'
WHERE NOT EXISTS (SELECT 1 FROM book_subscription_plans WHERE name = 'yearly');

-- User subscriptions table
CREATE TABLE IF NOT EXISTS book_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES book_subscription_plans(id),
    status TEXT NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_provider TEXT,
    payment_reference TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on subscription tables
ALTER TABLE IF EXISTS book_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS book_subscriptions ENABLE ROW LEVEL SECURITY;

-- Simple SELECT policy for everyone
DROP POLICY IF EXISTS "allow_select_plans" ON book_subscription_plans;
CREATE POLICY "allow_select_plans" ON book_subscription_plans
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_select_own_sub" ON book_subscriptions;
CREATE POLICY "allow_select_own_sub" ON book_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Indexes for subscriptions
CREATE INDEX IF NOT EXISTS idx_book_sub_user_id ON book_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_book_sub_status ON book_subscriptions(status);

-- Function to check active subscription
CREATE OR REPLACE FUNCTION has_active_book_subscription(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM book_subscriptions
        WHERE user_id = user_uuid
        AND status = 'active'
        AND current_period_end > NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION has_active_book_subscription(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION has_active_book_subscription(UUID) TO anon;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_book_subscriptions_updated_at ON book_subscriptions;
CREATE TRIGGER update_book_subscriptions_updated_at
    BEFORE UPDATE ON book_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for categories (public read)
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories"
    ON public.categories FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.categories;
CREATE POLICY "Admins can manage categories"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for books (public read, admin write)
DROP POLICY IF EXISTS "Anyone can view books" ON public.books;
CREATE POLICY "Anyone can view books"
    ON public.books FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can insert books" ON public.books;
CREATE POLICY "Admins can insert books"
    ON public.books FOR INSERT
    TO authenticated
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can update books" ON public.books;
CREATE POLICY "Admins can update books"
    ON public.books FOR UPDATE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can delete books" ON public.books;
CREATE POLICY "Admins can delete books"
    ON public.books FOR DELETE
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases"
    ON public.purchases FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create purchases" ON public.purchases;
CREATE POLICY "Users can create purchases"
    ON public.purchases FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- INDEXES & TRIGGERS FOR CORE TABLES
-- ============================================================================

-- Indexes
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_books_category ON public.books(category_id);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON public.books;
CREATE TRIGGER update_books_updated_at
    BEFORE UPDATE ON public.books
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- DONE!
-- ============================================================================
-- Test with:
-- SELECT * FROM book_subscription_plans;
-- Should return: monthly (20₾) and yearly (120₾)
