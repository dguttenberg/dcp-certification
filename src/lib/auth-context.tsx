'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User } from './types'
import { isDemo, getDemoUser, resetDemoData } from './demo-store'

interface SignInResult {
  ok: boolean
  error?: string
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  signIn: (email: string) => Promise<SignInResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signIn: async () => ({ ok: false, error: 'not initialized' }),
  signOut: async () => {},
})

const DEMO_SIGNED_IN_KEY = 'dcp-cert-signed-in'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // ---------- Initialise ----------
  useEffect(() => {
    let cancelled = false

    async function init() {
      if (isDemo()) {
        if (
          typeof window !== 'undefined' &&
          localStorage.getItem(DEMO_SIGNED_IN_KEY) === 'true'
        ) {
          setUser(getDemoUser())
        }
        setLoading(false)
        return
      }

      try {
        const res = await fetch('/api/me', { cache: 'no-store' })
        if (!cancelled && res.ok) {
          const body = await res.json()
          setUser(body.user ?? null)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  // ---------- Sign in ----------
  const signIn = useCallback(async (email: string): Promise<SignInResult> => {
    if (isDemo()) {
      localStorage.setItem(DEMO_SIGNED_IN_KEY, 'true')
      setUser(getDemoUser())
      return { ok: true }
    }

    const trimmed = email.trim().toLowerCase()
    if (!trimmed) {
      return { ok: false, error: 'Please enter your work email.' }
    }

    try {
      const res = await fetch('/api/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        return {
          ok: false,
          error: body.error ?? 'Could not sign you in. Try again.',
        }
      }
      const body = await res.json()
      setUser(body.user ?? null)
      return { ok: true }
    } catch (err) {
      console.error('Sign-in error:', err)
      return { ok: false, error: 'Network error. Try again.' }
    }
  }, [])

  // ---------- Sign out ----------
  const signOut = useCallback(async () => {
    if (isDemo()) {
      localStorage.removeItem(DEMO_SIGNED_IN_KEY)
      resetDemoData()
      setUser(null)
      return
    }

    try {
      await fetch('/api/sign-out', { method: 'POST' })
    } catch (err) {
      console.error('Sign-out error:', err)
    }
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
