-- Multi-file playground projects.
-- `files` holds [{ "name": "index.html", "content": "..." }, ...].
-- The legacy html_code / css_code / js_code columns are still written so
-- older views (gallery thumbnails, my-projects) keep rendering.
ALTER TABLE public.code_snippets
  ADD COLUMN IF NOT EXISTS files jsonb;
