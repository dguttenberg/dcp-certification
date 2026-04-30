'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Mail, ChevronRight, ArrowLeft, ShieldCheck } from 'lucide-react'

type Stage = 'email' | 'otp'

export default function LoginPage() {
  const { user, loading, signIn, verifyOtp } = useAuth()
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setError(null)
    setSubmitting(true)
    const result = await signIn(trimmed)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'Sign-in failed.')
      return
    }
    if (result.challenge === 'otp') {
      setCode('')
      setStage('otp')
      return
    }
    router.replace('/course')
  }

  async function handleOtpSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    setError(null)
    setSubmitting(true)
    const result = await verifyOtp(email.trim(), trimmed)
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'Verification failed.')
      return
    }
    router.replace('/course')
  }

  async function handleResend() {
    setError(null)
    setSubmitting(true)
    const result = await signIn(email.trim())
    setSubmitting(false)
    if (!result.ok) {
      setError(result.error ?? 'Could not resend code.')
    } else {
      setError('Sent. Check your email.')
    }
  }

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
        {stage === 'email' && (
          <div className="w-full max-w-2xl text-center animate-fade-in">
            <span className="dcp-eyebrow dcp-eyebrow--green inline-block">
              Mandatory Certification
            </span>

            <h1
              className="mt-6 font-bold uppercase text-white leading-[0.95] tracking-tight"
              style={{
                fontSize: 'clamp(48px, 9vw, 104px)',
                letterSpacing: '-0.02em',
              }}
            >
              AI Foundations<br />
              <em className="not-italic text-aurora-green block">Certification</em>
            </h1>

            <p className="mt-8 text-base md:text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
              Cut through the hype, understand what these tools actually do, and learn to use them responsibly on client work.
            </p>

            <form onSubmit={handleEmailSubmit} className="mt-12 max-w-md mx-auto text-left">
              <label
                htmlFor="email"
                className="block text-[11px] font-bold tracking-[0.15em] uppercase text-white/60 mb-3"
              >
                Sign in with your work email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="you@doner.com"
                  required
                  disabled={submitting}
                  className="w-full bg-white/5 border border-white/15 rounded-full text-white placeholder-white/30 pl-11 pr-4 py-3 text-base focus:outline-none focus:border-aurora-green focus:bg-white/10 transition-colors disabled:opacity-60"
                />
              </div>
              {error && (
                <p className="mt-4 text-sm text-ember leading-relaxed">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || !email.trim()}
                className="dcp-btn-primary mt-6 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                    Signing in…
                  </span>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {stage === 'otp' && (
          <div className="w-full max-w-md text-center animate-fade-in">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-aurora-green/15 border border-aurora-green/40">
              <ShieldCheck className="w-8 h-8 text-aurora-green" />
            </div>
            <span className="dcp-eyebrow dcp-eyebrow--green">Admin verification</span>
            <h1 className="mt-3 text-3xl md:text-4xl font-bold uppercase tracking-tight text-white">
              Enter your code
            </h1>
            <p className="mt-4 text-white/70 leading-relaxed">
              We sent a sign-in code to <strong className="text-white">{email}</strong>. Enter it below to access the admin panel.
            </p>

            <form onSubmit={handleOtpSubmit} className="mt-8">
              <label htmlFor="code" className="sr-only">
                Verification code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{4,10}"
                maxLength={10}
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 10))
                  if (error) setError(null)
                }}
                placeholder="Enter code"
                required
                disabled={submitting}
                autoFocus
                className="w-full bg-white/5 border border-white/15 rounded-full text-white placeholder-white/30 px-6 py-4 text-2xl text-center tracking-[0.35em] font-bold tabular-nums focus:outline-none focus:border-aurora-green focus:bg-white/10 transition-colors disabled:opacity-60"
              />
              {error && (
                <p className="mt-4 text-sm text-ember leading-relaxed">{error}</p>
              )}
              <button
                type="submit"
                disabled={submitting || code.length < 4}
                className="dcp-btn-primary mt-6 w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3 h-3 border-2 border-midnight/30 border-t-midnight rounded-full animate-spin" />
                    Verifying…
                  </span>
                ) : (
                  <>
                    Verify
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-6 text-[11px] font-semibold tracking-[0.15em] uppercase">
              <button
                onClick={() => {
                  setStage('email')
                  setCode('')
                  setError(null)
                }}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 text-white/60 hover:text-aurora-green transition-colors disabled:opacity-50"
              >
                <ArrowLeft className="w-3 h-3" />
                Different email
              </button>
              <button
                onClick={handleResend}
                disabled={submitting}
                className="text-white/60 hover:text-aurora-green transition-colors disabled:opacity-50"
              >
                Resend code
              </button>
            </div>
          </div>
        )}
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
