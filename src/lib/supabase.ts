// Supabase client. Returns null when env vars are absent so the app runs in
// local-only mode (M2 behaviour) until M3 is configured. The anon key is public
// by design and safe to ship because RLS restricts access to the signed-in user.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isCloudConfigured = Boolean(url && anon)

export const supabase: SupabaseClient | null = isCloudConfigured
  ? createClient(url!, anon!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null
