import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'

type Profile = { id: string; full_name: string; email: string; phone: string | null; avatar_url: string | null; account_type: string }
type AuthContextValue = { session: Session | null; user: User | null; profile: Profile | null; loading: boolean; error: string | null; signIn: (email: string, password: string) => Promise<{ error: string | null }>; signUp: (details: { fullName: string; email: string; phone: string; password: string; accountType: string }) => Promise<{ error: string | null }>; signOut: () => Promise<void>; resetPassword: (email: string) => Promise<{ error: string | null }>; updateProfile: (details: { fullName: string; phone: string; avatarUrl: string }) => Promise<{ error: string | null }> }

const AuthContext = createContext<AuthContextValue | null>(null)
const getSignUpError = (message: string) => {
  const normalizedMessage = message.toLowerCase()
  if (normalizedMessage.includes('already registered') || normalizedMessage.includes('already exists')) return 'This email already has an account. Please sign in instead.'
  if (normalizedMessage.includes('password')) return 'Please use a password with at least 6 characters.'
  if (normalizedMessage.includes('invalid email')) return 'Please enter a valid email address.'
  return 'Unable to create your account. Please check your details and try again.'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null); const [profile, setProfile] = useState<Profile | null>(null); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null)
  const loadProfile = async (userId: string) => { if (!supabase) return; const { data } = await supabase.from('profiles').select('id, full_name, email, phone, avatar_url, account_type').eq('id', userId).maybeSingle(); setProfile(data as Profile | null) }
  useEffect(() => { if (!supabase) { setLoading(false); return } let active = true; supabase.auth.getSession().then(async ({ data }) => { if (!active) return; setSession(data.session); if (data.session) await loadProfile(data.session.user.id); setLoading(false) }); const { data: listener } = supabase.auth.onAuthStateChange((_, nextSession) => { setSession(nextSession); if (nextSession) { void (async () => { await loadProfile(nextSession.user.id) })() } else setProfile(null) }); return () => { active = false; listener.subscription.unsubscribe() } }, [])
  const value = useMemo<AuthContextValue>(() => ({ session, user: session?.user ?? null, profile, loading, error, async signIn(email, password) { if (!supabase) return { error: 'Authentication is not configured.' }; setError(null); const { error: authError } = await supabase.auth.signInWithPassword({ email, password }); if (authError) { const message = 'Unable to sign you in. Please check your email and password.'; setError(message); return { error: message } } return { error: null } }, async signUp({ fullName, email, phone, password, accountType }) { if (!supabase) return { error: 'Authentication is not configured.' }; setError(null); const { error: authError } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone, account_type: accountType } } }); if (authError) { const message = getSignUpError(authError.message); setError(message); return { error: message } } return { error: null } }, async signOut() { if (supabase) await supabase.auth.signOut() }, async resetPassword(email) { if (!supabase) return { error: 'Authentication is not configured.' }; const { error: authError } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/reset-password` }); if (authError) return { error: 'We could not send the reset email. Please try again.' }; return { error: null } }, async updateProfile({ fullName, phone, avatarUrl }) { if (!supabase || !session) return { error: 'Please sign in to update your profile.' }; const { data, error: updateError } = await supabase.from('profiles').update({ full_name: fullName, phone, avatar_url: avatarUrl || null }).eq('id', session.user.id).select('id, full_name, email, phone, avatar_url, account_type').maybeSingle(); if (updateError || !data) return { error: 'We could not update your profile. Please try again.' }; setProfile(data as Profile); return { error: null } } }), [session, profile, loading, error])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error('useAuth must be used within AuthProvider'); return value }
