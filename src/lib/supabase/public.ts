import { createClient } from '@supabase/supabase-js';

/**
 * Cookie-less Supabase client for PUBLIC read-only data.
 * Because this client never touches cookies, Next.js won't
 * flag pages that use it as "dynamic" — allowing ISR / unstable_cache
 * to work correctly and dramatically reducing database reads.
 *
 * ⚠️  Do NOT use this for authenticated / admin operations.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );
}
