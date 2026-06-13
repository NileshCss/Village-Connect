import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

export function createClient() {
  const cookieStore = cookies();

  const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const rawKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const url = (rawUrl && rawUrl !== 'undefined' && rawUrl !== 'null' && rawUrl.trim() !== '')
    ? rawUrl
    : 'https://placeholder.supabase.co';

  const anonKey = (rawKey && rawKey !== 'undefined' && rawKey !== 'null' && rawKey.trim() !== '')
    ? rawKey
    : 'placeholder';

  return createServerClient<Database>(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component — cookies can't be set from here
          }
        },
      },
    }
  );
}
