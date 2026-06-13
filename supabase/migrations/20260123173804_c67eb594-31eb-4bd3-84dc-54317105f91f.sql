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