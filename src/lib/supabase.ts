import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// These are PUBLIC values (safe to ship in the browser / commit). The anon key
// is protected by Row Level Security on the database side.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Null when the app hasn't been given Supabase credentials — the whole auth /
 * sync layer degrades gracefully to local-only in that case.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/** One JSONB row per user holds the whole progress blob. */
export const PROGRESS_TABLE = 'progress';
