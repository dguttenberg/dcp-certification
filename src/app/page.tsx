'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace('/course')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dcp-gradient-dark">
        <div className="w-8 h-8 border-2 border-aurora-green/30 border-t-aurora-green rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen relative overflow-hidden dcp-gradient-dark flex flex-col">
      {/* Atmospheric accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-aurora-violet/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-aurora-green/10 blur-3xl" />
      </div>

      {/* Nav */}
      <header className="relative z-10 px-6 md:px-10 py-5 flex items-center justify-between">
        <div className="dcp-logo">
          <span className="dcp-logo-mark">DCP</span>
          <span className="dcp-logo-wordmark">Doner<br />Colle<br />Partners.</span>
        </div>
        <span className="hidden sm:block text-[11px] font-semibold tracking-[0.2em] uppercase text-white/50">
          AI Foundations
        </span>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <div className="max-w-3xl text-center animate-fade-in">
          <span
            className="dcp-eyebrow dcp-eyebrow--green animate-slide-up inline-block"
            style={{ animationDelay: '0.05s', animationFillMode: 'both' }}
          >
            Mandatory Certification
          </span>

          <h1
            className="mt-6 font-bold uppercase text-white leading-[0.95] tracking-tight animate-slide-up"
            style={{
              fontSize: 'clamp(48px, 9vw, 104px)',
              letterSpacing: '-0.02em',
              animationDelay: '0.1s',
              animationFillMode: 'both',
            }}
          >
            AI Foundations<br />
            <em className="not-italic text-aurora-green block">Certification</em>
          </h1>

          <p
            className="mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed animate-slide-up"
            style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
          >
            Cut through the hype, understand what these tools actually do, and learn to use them responsibly on client work.
          </p>

          <button
            onClick={signIn}
            className="dcp-btn-primary mt-12 animate-slide-up"
            style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
          >
            Sign in with DCP
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 px-6 md:px-10 py-6 flex items-center justify-between border-t border-white/5">
        <div className="flex gap-6 text-[11px] font-medium uppercase tracking-[0.1em] text-white/40">
          <span>Chicago</span>
          <span>Detroit</span>
          <span>Minneapolis</span>
        </div>
        <span className="text-[11px] tracking-[0.2em] uppercase text-white/30">
          Powered by Stagwell
        </span>
      </footer>
    </div>
  )
}
