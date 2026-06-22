// Auth/session state. When Supabase isn't configured the app stays in
// local-only mode (ready immediately, no user).
import { supabase, isCloudConfigured } from '../supabase'
import type { Session } from '@supabase/supabase-js'

export const session = $state({
  configured: isCloudConfigured,
  ready: !isCloudConfigured,
  userId: null as string | null,
  email: null as string | null,
})

function apply(s: Session | null): void {
  session.userId = s?.user?.id ?? null
  session.email = s?.user?.email ?? null
}

let inited = false

export async function initSession(): Promise<void> {
  if (inited) return
  inited = true
  if (!supabase) {
    session.ready = true
    return
  }
  const { data } = await supabase.auth.getSession()
  apply(data.session)
  supabase.auth.onAuthStateChange((_event, s) => apply(s))
  session.ready = true
}

export async function signInWithEmail(email: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Cloud sync is not configured.' }
  const emailRedirectTo = window.location.origin + import.meta.env.BASE_URL
  const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo } })
  return error ? { error: error.message } : {}
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut()
}
