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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a1628] to-[#1a2744]">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a1628] via-[#12203d] to-[#1a2744] px-6">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-brand-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center max-w-md animate-fade-in">
        {/* Wordmark */}
        <h1
          className="text-7xl md:text-8xl font-bold text-white tracking-tight animate-slide-up"
          style={{ animationDelay: '0.1s', animationFillMode: 'both' }}
        >
          DCP
        </h1>

        {/* Subtitle */}
        <p
          className="mt-4 text-lg md:text-xl text-brand-200 font-medium tracking-wide animate-slide-up"
          style={{ animationDelay: '0.2s', animationFillMode: 'both' }}
        >
          AI Foundations Certification
        </p>

        {/* Description */}
        <p
          className="mt-6 text-surface-400 text-sm md:text-base leading-relaxed animate-slide-up"
          style={{ animationDelay: '0.3s', animationFillMode: 'both' }}
        >
          Complete the mandatory AI certification course for DCP staff.
        </p>

        {/* CTA Button */}
        <button
          onClick={signIn}
          className="mt-10 px-8 py-3.5 bg-white text-surface-900 font-semibold text-base rounded-lg
            hover:bg-surface-100 hover:shadow-lg hover:shadow-white/10
            active:scale-[0.98] transition-all duration-200 animate-slide-up"
          style={{ animationDelay: '0.4s', animationFillMode: 'both' }}
        >
          Sign in with DCP
        </button>

        {/* Footer */}
        <p
          className="mt-16 text-surface-500 text-xs tracking-widest uppercase animate-slide-up"
          style={{ animationDelay: '0.5s', animationFillMode: 'both' }}
        >
          Powered by Stagwell
        </p>
      </div>
    </div>
  )
}
