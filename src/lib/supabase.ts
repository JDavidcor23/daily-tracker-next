import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_URL = 'dt_supabase_url';
const STORAGE_KEY_KEY = 'dt_supabase_anon_key';

// Initialize with environment variables for server-side and default client-side use
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('Supabase URL or Anon Key is missing from environment variables.');
}

// Named export 'supabase' as used in API routes
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export function getCredentials(): { url: string; anonKey: string } {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window === 'undefined') {
    return { url: envUrl, anonKey: envKey };
  }

  return {
    url: localStorage.getItem(STORAGE_KEY_URL) ?? envUrl,
    anonKey: localStorage.getItem(STORAGE_KEY_KEY) ?? envKey,
  };
}

export function saveCredentials(url: string, anonKey: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
}

let _client: SupabaseClient | null = null;

/**
 * Returns a Supabase client. 
 * On the client side, it prioritizes credentials from localStorage.
 * On the server side, it uses environment variables.
 */
export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getCredentials();
  if (!url || !anonKey) return null;

  // Re-create if credentials changed or if it doesn't exist
  if (
    !_client ||
    (_client as any).supabaseUrl !== url
  ) {
    _client = createClient(url, anonKey);
  }
  return _client;
}

export function resetSupabaseClient(): void {
  _client = null;
}
