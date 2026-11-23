import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://cnkhdwcqfxkdmluvikzv.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseAnonKey) {
  throw new Error(
    'Supabase is not configured. Set VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY.',
  );
}

const fetchWithTimeout: typeof fetch = async (input, init: RequestInit = {}) => {
  const controller = new AbortController();
  const requestSignal = init.signal ?? (input instanceof Request ? input.signal : undefined);
  const forwardAbort = () => controller.abort();

  if (requestSignal?.aborted) {
    forwardAbort();
  } else {
    requestSignal?.addEventListener('abort', forwardAbort, { once: true });
  }

  const timeoutId = setTimeout(() => controller.abort(), 20_000);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
    requestSignal?.removeEventListener('abort', forwardAbort);
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: { fetch: fetchWithTimeout },
});
