'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { isDemo, getSectionProgress, getCompletion, setAdminMode, resetDemoData, isAdminMode } from '@/lib/demo-store'
import { sections } from '@/content/sections'
import ProgressRing from '@/components/progress-ring'
import { Check, Lock, ChevronRight, Award, BookOpen, Settings, Shield, RotateCcw, LogOut } from 'lucide-react'

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

      // Check if already certified
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
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
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
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200">
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-surface-500">Welcome back,</p>
            <h1 className="text-xl font-bold text-surface-900">{firstName}</h1>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
              >
                <Shield className="w-4 h-4" />
                Admin
              </Link>
            )}

            {/* Settings dropdown */}
            {isDemo() && (
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="p-2 rounded-lg text-surface-400 hover:text-surface-600 hover:bg-surface-100 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>
                {showSettings && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-surface-200 py-1.5 z-20 animate-fade-in">
                      <button
                        onClick={handleToggleAdmin}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors text-left"
                      >
                        <Shield className="w-4 h-4 text-surface-400" />
                        {isAdminMode() ? 'Disable admin mode' : 'Enable admin mode'}
                      </button>
                      <button
                        onClick={handleResetProgress}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 hover:bg-surface-50 transition-colors text-left"
                      >
                        <RotateCcw className="w-4 h-4 text-surface-400" />
                        Reset progress
                      </button>
                      <div className="border-t border-surface-100 my-1" />
                      <button
                        onClick={signOut}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
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

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* Progress overview */}
        <div
          className="flex flex-col sm:flex-row items-center gap-6 bg-white rounded-2xl p-8 border border-surface-200 shadow-sm animate-fade-in"
        >
          <ProgressRing
            progress={progress}
            size={110}
            strokeWidth={8}
            label={`${completedCount}/${totalSections}`}
          />
          <div className="text-center sm:text-left">
            <h2 className="text-lg font-semibold text-surface-900">Your Progress</h2>
            <p className="text-sm text-surface-500 mt-1">
              {completedCount === 0
                ? 'Start your AI Foundations journey below.'
                : completedCount === totalSections
                  ? 'All sections complete. Ready for the quiz!'
                  : `${completedCount} of ${totalSections} sections completed.`}
            </p>
          </div>
        </div>

        {/* Section cards */}
        <div className="mt-8 space-y-4">
          {sections.map((section, index) => {
            const isCompleted = completedIds.has(section.id)
            const unlocked = isSectionUnlocked(index)
            const isCurrent = unlocked && !isCompleted

            return (
              <div
                key={section.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.08}s`, animationFillMode: 'both' }}
              >
                {unlocked ? (
                  <Link href={`/course/${section.id}`} className="block group">
                    <div
                      className={`flex items-center gap-5 bg-white rounded-xl p-5 border transition-all duration-200 ${
                        isCurrent
                          ? 'border-brand-300 shadow-sm hover:shadow-md hover:border-brand-400'
                          : 'border-surface-200 hover:shadow-sm hover:border-surface-300'
                      }`}
                    >
                      {/* Section number */}
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold ${
                          isCompleted
                            ? 'bg-green-50 text-green-600'
                            : isCurrent
                              ? 'bg-brand-50 text-brand-600'
                              : 'bg-surface-100 text-surface-400'
                        }`}
                      >
                        {isCompleted ? <Check className="w-5 h-5" /> : section.number}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-surface-900 group-hover:text-brand-700 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-sm text-surface-500 mt-0.5 truncate">{section.description}</p>
                      </div>

                      {/* Action indicator */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <span className="text-xs font-medium text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                            Done
                          </span>
                        ) : isCurrent ? (
                          <span className="flex items-center gap-1 text-sm font-medium text-brand-600">
                            {index === 0 && completedCount === 0 ? 'Start' : 'Continue'}
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-5 bg-surface-50 rounded-xl p-5 border border-surface-200 opacity-60">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center bg-surface-100 text-surface-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-500">{section.title}</h3>
                      <p className="text-sm text-surface-400 mt-0.5 truncate">{section.description}</p>
                    </div>
                    <Lock className="w-4 h-4 text-surface-300 flex-shrink-0" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Quiz card */}
        <div
          className="mt-8 animate-slide-up"
          style={{ animationDelay: `${sections.length * 0.08}s`, animationFillMode: 'both' }}
        >
          {allComplete ? (
            <Link href="/quiz" className="block group">
              <div className="flex items-center gap-5 bg-gradient-to-r from-brand-600 to-brand-700 rounded-xl p-6 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">Take the Certification Quiz</h3>
                  <p className="text-brand-100 text-sm mt-0.5">
                    Test your knowledge and earn your certificate.
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-5 bg-surface-100 rounded-xl p-6 border border-surface-200 opacity-60">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface-200 flex items-center justify-center">
                <Award className="w-6 h-6 text-surface-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-surface-500">Certification Quiz</h3>
                <p className="text-sm text-surface-400 mt-0.5">
                  Complete all {totalSections} sections first.
                </p>
              </div>
              <Lock className="w-4 h-4 text-surface-300" />
            </div>
          )}
        </div>

        {/* Footer branding */}
        <p className="text-center text-xs text-surface-400 mt-12 tracking-wide">
          <BookOpen className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
          DCP AI Foundations Certification
        </p>
      </main>
    </div>
  )
}
