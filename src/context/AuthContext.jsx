import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../services/supabase'
import { sendMagicLink, signOut as authSignOut } from '../services/auth'
import { identify } from '../services/analytics'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 1. Fetch current active session on boot
    const fetchInitialSession = async () => {
      try {
        const { data: { session: activeSession }, error } = await supabase.auth.getSession()
        if (error) throw error
        setSession(activeSession)
        setUser(activeSession?.user || null)
      } catch (err) {
        console.error('Failed to resolve initial authentication session:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialSession()

    // 2. Establish real-time authentication event listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, activeSession) => {
      setSession(activeSession)
      setUser(activeSession?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (user) {
      identify(user.id, { email: user.email })
    }
  }, [user])

  const isAuthenticated = !!user

  const contextValue = {
    user,
    session,
    isLoading,
    isAuthenticated,
    signIn: sendMagicLink,
    signOut: authSignOut
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
