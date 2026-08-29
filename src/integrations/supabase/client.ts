import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Lovable Cloud injects these at build time. They are also readable from a
 * local .env for `npm run dev` (see .env.example).
 *
 * Newer Lovable projects name the key PUBLISHABLE_KEY; older ones ANON_KEY.
 * Both are the public, RLS-guarded key — safe to ship in the bundle.
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ??
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/**
 * Null when the app is running without Supabase credentials (e.g. a bare
 * local checkout). Callers must handle that case rather than assume a client.
 */
export const supabase: SupabaseClient | null =
  SUPABASE_URL && SUPABASE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true } })
    : null;
