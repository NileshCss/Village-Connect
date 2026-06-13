import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/database';

export function createClient() {
  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url = (rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null' && rawUrl.trim() !== '')
    ? rawUrl
    : 'https://placeholder.supabase.co';

  const anonKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null' && rawKey.trim() !== '')
    ? rawKey
    : 'placeholder';

  return createBrowserClient<Database>(url, anonKey);
}
