-- Add language column to code_snippets table
ALTER TABLE public.code_snippets 
ADD COLUMN language TEXT NOT NULL DEFAULT 'web';

-- Update existing records
UPDATE public.code_snippets SET language = 'web' WHERE language IS NULL OR language = '';