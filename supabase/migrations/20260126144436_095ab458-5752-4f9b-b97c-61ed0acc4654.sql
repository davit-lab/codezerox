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