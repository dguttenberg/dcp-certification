'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { isDemo, getSectionProgress, getCompletion, setAdminMode, resetDemoData, isAdminMode } from '@/lib/demo-store'
import { sections } from '@/content/sections'
import ProgressRing from '@/components/progress-ring'
import { Check, Lock, ChevronRight, Award, Settings, Shield, RotateCcw, LogOut } from 'lucide-react'

export default function CoursePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [mounted, setMounted] = useState(false)

  const refreshProgress = useCallback(() => {
    if (isDemo()) {
      const progress = getSectionProgress()
      setCompletedIds(new Set(progress.map((p) => p.section_id)))
    }
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      refreshProgress()

      if (isDemo()) {
        const completion = getCompletion()
        if (completion) {
          router.replace('/certificate')
          return
        }
      }
    }
  }, [user, refreshProgress, router])

  if (loading || !user || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-midnight">
        <div className="w-8 h-8 border-2 border-aurora-green/30 border-t-aurora-green rounded-full animate-spin" />
      </div>
    )
  }

  const firstName = user.full_name.split(' ')[0] || 'there'
  const completedCount = completedIds.size
  const totalSections = sections.length
  const progress = totalSections > 0 ? completedCount / totalSections : 0
  const allComplete = completedCount === totalSections

  function isSectionUnlocked(index: number): boolean {
    if (index === 0) return true
    return completedIds.has(sections[index - 1].id)
  }

  function handleToggleAdmin() {
    const current = isAdminMode()
    setAdminMode(!current)
    window.location.reload()
  }

  function handleResetProgress() {
    resetDemoData()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Header */}
      <header className="bg-midnight sticky top-0 z-30 border-b border-aurora-green/10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="dcp-logo">
            <span className="dcp-logo-mark">DCP</span>
            <span className="dcp-logo-wordmark">Doner<br />Colle<br />Partners.</span>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-aurora-green/80 hover:text-aurora-green transition-colors"
              >
                <Shield className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            {isDemo() && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-full text-white/60 hover:text-aurora-green hover:bg-white/5 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettings && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-midnight border border-aurora-violet/30 rounded-xl shadow-xl py-1.5 z-20 animate-fade-in">
                      <button
                        onClick={handleToggleAdmin}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-aurora-violet/10 hover:text-aurora-green transition-colors text-left"
                      >
                        <Shield className="w-4 h-4 text-white/40" />
                        {isAdminMode() ? 'Disable admin mode' : 'Enable admin mode'}
                      </button>
                      <button
                        onClick={handleResetProgress}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/80 hover:bg-aurora-violet/10 hover:text-aurora-green transition-colors text-left"
                      >
                        <RotateCcw className="w-4 h-4 text-white/40" />
                        Reset progress
                      </button>
                      <div className="border-t border-white/10 my-1" />
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-ember hover:bg-ember/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        {/* Hero / progress panel */}
        <div className="mb-10 animate-fade-in">
          <span className="dcp-eyebrow">Welcome back</span>
          <h1 className="mt-2 text-3xl md:text-5xl font-bold uppercase tracking-tight text-midnight">
            Hi, {firstName}.
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 bg-midnight rounded-2xl p-8 border border-aurora-violet/30 animate-fade-in">
          <ProgressRing
            progress={progress}
            size={110}
            strokeWidth={8}
            label={`${completedCount}/${totalSections}`}
          />
          <div className="text-center sm:text-left">
            <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-aurora-green">
              Your Progress
            </h2>
            <p className="mt-2 text-lg text-white/80 leading-relaxed">
              {completedCount === 0
                ? 'Start your AI Foundations journey below.'
                : completedCount === totalSections
                  ? 'All sections complete. Ready for the quiz.'
                  : `${completedCount} of ${totalSections} sections completed.`}
            </p>
          </div>
        </div>

        {/* Section cards */}
        <div className="mt-8 space-y-3">
          {sections.map((section, index) => {
            const isCompleted = completedIds.has(section.id)
            const unlocked = isSectionUnlocked(index)
            const isCurrent = unlocked && !isCompleted

            return (
              <div
                key={section.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'both' }}
              >
                {unlocked ? (
                  <Link href={`/course/${section.id}`} className="block group">
                    <div
                      className={`flex items-center gap-5 bg-white rounded-xl p-5 border transition-all duration-200 ${
                        isCurrent
                          ? 'border-aurora-violet shadow-sm hover:shadow-md hover:border-aurora-green'
                          : 'border-surface-200 hover:shadow-sm hover:border-aurora-violet/50'
                      }`}
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold">
                        {isCompleted ? (
                          <span className="w-full h-full rounded-xl bg-aurora-green/15 text-midnight flex items-center justify-center">
                            <Check className="w-5 h-5" strokeWidth={3} />
                          </span>
                        ) : (
                          <span className={`w-full h-full rounded-xl flex items-center justify-center ${
                            isCurrent
                              ? 'bg-aurora-violet/10 text-aurora-violet'
                              : 'bg-surface-100 text-surface-500'
                          }`}>
                            {String(section.number).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-midnight group-hover:text-aurora-violet transition-colors uppercase tracking-tight">
                          {section.title}
                        </h3>
                        <p className="text-sm text-surface-600 mt-1 line-clamp-2">
                          {section.description}
                        </p>
                      </div>

                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <span className="text-[10px] font-bold tracking-[0.15em] text-accent-700 bg-aurora-green/15 px-3 py-1.5 rounded-full uppercase">
                            Done
                          </span>
                        ) : isCurrent ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold tracking-[0.15em] uppercase text-aurora-violet">
                            {index === 0 && completedCount === 0 ? 'Start' : 'Continue'}
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-5 bg-surface-100 rounded-xl p-5 border border-surface-200 opacity-60">
                    <div className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-surface-200 text-surface-400 text-sm">
                      {String(section.number).padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-surface-500 uppercase tracking-tight">{section.title}</h3>
                      <p className="text-sm text-surface-400 mt-1 line-clamp-2">{section.description}</p>
                    </div>
                    <Lock className="w-4 h-4 text-surface-400 flex-shrink-0" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quiz card */}
        <div
          className="mt-8 animate-slide-up"
          style={{ animationDelay: `${sections.length * 0.06}s`, animationFillMode: 'both' }}
        >
          {allComplete ? (
            <Link href="/quiz" className="block group">
              <div className="relative overflow-hidden flex items-center gap-5 bg-midnight rounded-xl p-6 text-white border border-aurora-green/40 shadow-lg transition-all duration-200 hover:border-aurora-green">
                <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-aurora-green/10 blur-3xl" />
                <div className="relative flex-shrink-0 w-14 h-14 rounded-xl bg-aurora-green text-midnight flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div className="relative flex-1">
                  <span className="dcp-eyebrow dcp-eyebrow--green">Final step</span>
                  <h3 className="mt-1 font-bold text-lg uppercase tracking-tight">Take the Certification Quiz</h3>
                  <p className="text-white/60 text-sm mt-0.5">
                    Test your knowledge and earn your certificate.
                  </p>
                </div>
                <ChevronRight className="relative w-6 h-6 text-aurora-green group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-5 bg-surface-100 rounded-xl p-6 border border-surface-200 opacity-60">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-surface-200 flex items-center justify-center">
                <Award className="w-6 h-6 text-surface-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-surface-500 uppercase tracking-tight">Certification Quiz</h3>
                <p className="text-sm text-surface-400 mt-0.5">
                  Complete all {totalSections} sections first.
                </p>
              </div>
              <Lock className="w-4 h-4 text-surface-400" />
            </div>
          )}
        </div>

        <p className="text-center text-[11px] text-surface-500 mt-12 tracking-[0.2em] uppercase">
          DCP AI Foundations Certification · v1
        </p>
      </main>
    </div>
  )
}
