-- Clear all existing code snippets to start fresh with user uploads only
-- This removes any gallery-imported or pre-populated snippets

DELETE FROM public.code_snippets;

-- Reset sequence if using serial/auto-increment (optional)
-- ALTER SEQUENCE IF EXISTS code_snnippets_id_seq RESTART WITH 1;
