import { supabase } from './supabase'

export async function sendMagicLink(email) {
  return await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: window.location.origin + '/onboarding'
    }
  })
}

export async function signOut() {
  return await supabase.auth.signOut()
}

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error fetching active session:', error)
    return null
  }
  return session
}
