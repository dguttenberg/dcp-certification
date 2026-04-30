import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedAdmin: SupabaseClient | null = null
let cachedAnon: SupabaseClient | null = null

/**
 * Service-role Supabase client for server-side use.
 * Bypasses RLS — must only be used from API routes.
 */
export function adminClient(): SupabaseClient {
  if (cachedAdmin) return cachedAdmin
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars missing.')
  }
  cachedAdmin = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cachedAdmin
}

/**
 * Anon-key Supabase client. Used server-side for auth.signInWithOtp / verifyOtp,
 * which don't need elevated permissions.
 */
export function anonClient(): SupabaseClient {
  if (cachedAnon) return cachedAnon
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('Supabase env vars missing.')
  }
  cachedAnon = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  return cachedAnon
}
