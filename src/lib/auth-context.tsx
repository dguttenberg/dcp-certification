'use client'

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import type { User } from './types'
import { isDemo, getDemoUser, resetDemoData } from './demo-store'

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------
interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

const DEMO_SIGNED_IN_KEY = 'dcp-cert-signed-in'

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Initialise on mount
  useEffect(() => {
    async function init() {
      if (isDemo()) {
        // Only restore user if they previously signed in
        if (typeof window !== 'undefined' && localStorage.getItem(DEMO_SIGNED_IN_KEY) === 'true') {
          setUser(getDemoUser())
        }
        setLoading(false)
        return
      }

      // Production — check Supabase session
      try {
        const { createClient } = await import('./supabase/client')
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const meta = session.user.user_metadata ?? {}
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            full_name: (meta.full_name as string) ?? '',
            agency: (meta.agency as string) ?? '',
            role: (meta.role as 'learner' | 'admin') ?? 'learner',
            created_at: session.user.created_at,
          })
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  // Sign in -------------------------------------------------------------------
  const signIn = useCallback(async () => {
    if (isDemo()) {
      localStorage.setItem(DEMO_SIGNED_IN_KEY, 'true')
      setUser(getDemoUser())
      return
    }

    // Production — trigger SAML SSO via Supabase
    try {
      const { createClient } = await import('./supabase/client')
      const supabase = createClient()
      await supabase.auth.signInWithSSO({
        domain: window.location.hostname,
      })
    } catch (err) {
      console.error('Sign-in error:', err)
    }
  }, [])

  // Sign out ------------------------------------------------------------------
  const signOut = useCallback(async () => {
    if (isDemo()) {
      localStorage.removeItem(DEMO_SIGNED_IN_KEY)
      resetDemoData()
      setUser(null)
      return
    }

    try {
      const { createClient } = await import('./supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (err) {
      console.error('Sign-out error:', err)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
