import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './generated';

export type TypedSupabaseClient = SupabaseClient<any, 'public', any>;

/**
 * Browser / public client — uses anon key, subject to RLS.
 */
export function createBrowserClient(url: string, anonKey: string): TypedSupabaseClient {
  return createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/**
 * Server client — uses service role key, bypasses RLS.
 * NEVER expose this to the client. Only use in trusted backend code.
 */
export function createServiceClient(url: string, serviceRoleKey: string): TypedSupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
