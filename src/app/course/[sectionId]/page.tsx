'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'
import { isDemo, getSectionProgress, completeSection } from '@/lib/demo-store'
import { sections } from '@/content/sections'
import type {
  SectionCard,
  HeroCard,
  TextCard,
  CalloutCard,
  ScenarioCard,
  ToolGridCard,
  PromptCompareCard,
  ExampleCard,
  SummaryCard,
} from '@/content/sections'
import ScenarioCardComponent from '@/components/scenario-card'
import ToolGrid from '@/components/tool-grid'
import PromptCompare from '@/components/prompt-compare'
import SummaryCardComponent from '@/components/summary-card'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  Zap,
} from 'lucide-react'

export default function SectionPage({ params }: { params: { sectionId: string } }) {
  const { sectionId } = params
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isCompleted, setIsCompleted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [animating, setAnimating] = useState(false)

  const section = sections.find((s) => s.id === sectionId)
  const sectionIndex = sections.findIndex((s) => s.id === sectionId)
  const nextSection = sectionIndex < sections.length - 1 ? sections[sectionIndex + 1] : null
  const totalCards = section?.cards.length ?? 0

  const checkProgress = useCallback(() => {
    if (isDemo()) {
      const progress = getSectionProgress()
      const completedIds = new Set(progress.map((p) => p.section_id))
      setIsCompleted(completedIds.has(sectionId))

      if (sectionIndex > 0) {
        const prevSection = sections[sectionIndex - 1]
        if (!completedIds.has(prevSection.id)) {
          router.replace('/course')
          return
        }
      }
    }
  }, [sectionId, sectionIndex, router])

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) checkProgress()
  }, [user, checkProgress])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        goNext()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goPrev()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  function goNext() {
    if (animating || currentCardIndex >= totalCards - 1) return
    setDirection('forward')
    setAnimating(true)
    setTimeout(() => {
      setCurrentCardIndex((i) => i + 1)
      setAnimating(false)
    }, 200)
  }

  function goPrev() {
    if (animating || currentCardIndex <= 0) return
    setDirection('backward')
    setAnimating(true)
    setTimeout(() => {
      setCurrentCardIndex((i) => i - 1)
      setAnimating(false)
    }, 200)
  }

  function handleMarkComplete() {
    if (isDemo()) {
      completeSection(sectionId)
      router.push('/course')
    }
  }

  if (loading || !user || !mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 border-2 border-brand-600/30 border-t-brand-600 rounded-full animate-spin" />
      </div>
    )
  }

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-surface-50 gap-4">
        <p className="text-surface-500">Section not found.</p>
        <Link href="/course" className="text-brand-600 hover:text-brand-700 font-medium text-sm">
          Back to Course
        </Link>
      </div>
    )
  }

  const currentCard = section.cards[currentCardIndex]
  const isLastCard = currentCardIndex === totalCards - 1
  const isFirstCard = currentCardIndex === 0
  const progress = ((currentCardIndex + 1) / totalCards) * 100

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/course"
            className="flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Course</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs text-surface-400 tabular-nums">
              {currentCardIndex + 1} / {totalCards}
            </span>
            <div className="w-24 sm:w-40 h-1.5 rounded-full bg-surface-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-brand-600 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-xs text-surface-400">
            Section {section.number} of {sections.length}
          </span>
        </div>
      </header>

      {/* Card area */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-10">
        <div
          className={`w-full max-w-3xl transition-all duration-200 ease-out ${
            animating
              ? direction === 'forward'
                ? '-translate-x-8 opacity-0'
                : 'translate-x-8 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
          key={currentCard.id}
        >
          {renderCard(currentCard)}
        </div>
      </div>

      {/* Bottom navigation */}
      <footer className="bg-white border-t border-surface-200 sticky bottom-0 z-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={isFirstCard}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              isFirstCard
                ? 'text-surface-300 cursor-not-allowed'
                : 'text-surface-600 hover:bg-surface-100 hover:text-surface-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {/* Dot indicators — show a window of dots around current position */}
            {section.cards.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (i !== currentCardIndex) {
                    setDirection(i > currentCardIndex ? 'forward' : 'backward')
                    setAnimating(true)
                    setTimeout(() => {
                      setCurrentCardIndex(i)
                      setAnimating(false)
                    }, 200)
                  }
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === currentCardIndex
                    ? 'w-6 h-2 bg-brand-600'
                    : i < currentCardIndex
                      ? 'w-2 h-2 bg-brand-300'
                      : 'w-2 h-2 bg-surface-300'
                } ${totalCards > 20 ? 'hidden sm:block' : ''}`}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>

          {isLastCard ? (
            !isCompleted ? (
              <button
                onClick={handleMarkComplete}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
                Complete
              </button>
            ) : nextSection ? (
              <Link
                href={`/course/${nextSection.id}`}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/course"
                className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 transition-all shadow-sm"
              >
                <Check className="w-4 h-4" />
                Done
              </Link>
            )
          ) : (
            <button
              onClick={goNext}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-brand-600 text-white rounded-lg text-sm font-semibold hover:bg-brand-700 active:scale-[0.98] transition-all shadow-sm"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </footer>
    </div>
  )

  function renderCard(card: SectionCard) {
    switch (card.type) {
      case 'hero':
        return <HeroCardView card={card as HeroCard} />
      case 'text':
        return <TextCardView card={card as TextCard} />
      case 'callout':
        return <CalloutCardView card={card as CalloutCard} />
      case 'scenario':
        return <ScenarioCardView card={card as ScenarioCard} />
      case 'tool-grid':
        return <ToolGridCardView card={card as ToolGridCard} />
      case 'prompt-compare':
        return <PromptCompareCardView card={card as PromptCompareCard} />
      case 'example':
        return <ExampleCardView card={card as ExampleCard} />
      case 'summary':
        return <SummaryCardView card={card as SummaryCard} />
      default:
        return null
    }
  }
}

// ─────────────────────────────────────────────
// Card Renderers
// ─────────────────────────────────────────────

function HeroCardView({ card }: { card: HeroCard }) {
  return (
    <div className="text-center space-y-6">
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-lg">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-left">
          <h1 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
            {card.title}
          </h1>
          <p className="mt-2 text-base sm:text-lg text-white/80">
            {card.subtitle}
          </p>
        </div>
      </div>
      <p className="text-sm text-surface-400">
        Press <kbd className="px-1.5 py-0.5 bg-surface-100 rounded text-xs font-mono">→</kbd> or click Next to continue
      </p>
    </div>
  )
}

function TextCardView({ card }: { card: TextCard }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8 sm:p-12 space-y-4">
      {card.heading && (
        <h2 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">
          {card.heading}
        </h2>
      )}
      <p className="text-base sm:text-lg leading-relaxed text-surface-700">
        {card.body}
      </p>
    </div>
  )
}

function CalloutCardView({ card }: { card: CalloutCard }) {
  const styles = {
    insight: {
      bg: 'bg-brand-50/80',
      border: 'border-brand-400',
      icon: <Lightbulb className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-400',
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />,
    },
    tip: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-400',
      icon: <Zap className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />,
    },
  }
  const s = styles[card.style ?? 'insight']

  return (
    <div className={`${s.bg} border-l-4 ${s.border} rounded-r-2xl p-8 sm:p-10 flex gap-4 items-start`}>
      {s.icon}
      <p className="text-base sm:text-lg leading-relaxed text-surface-700 italic">
        {card.text}
      </p>
    </div>
  )
}

function ScenarioCardView({ card }: { card: ScenarioCard }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-semibold text-surface-500 uppercase tracking-wider">
        <span className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
          <span className="text-brand-600 text-xs">?</span>
        </span>
        What would you do?
      </div>
      <ScenarioCardComponent situation={card.situation} options={card.options} />
    </div>
  )
}

function ToolGridCardView({ card }: { card: ToolGridCard }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">
        {card.heading}
      </h2>
      <ToolGrid tools={card.tools} />
    </div>
  )
}

function PromptCompareCardView({ card }: { card: PromptCompareCard }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-bold text-surface-900 tracking-tight">
        {card.heading}
      </h2>
      <PromptCompare bad={card.bad} good={card.good} />
    </div>
  )
}

function ExampleCardView({ card }: { card: ExampleCard }) {
  return (
    <div className="bg-brand-50/60 border border-brand-100 rounded-2xl p-8 sm:p-10">
      <span className="block text-xs font-semibold text-brand-500 uppercase tracking-wider mb-3">
        {card.label}
      </span>
      <p className="text-base sm:text-lg leading-relaxed text-surface-700">
        {card.text}
      </p>
    </div>
  )
}

function SummaryCardView({ card }: { card: SummaryCard }) {
  return <SummaryCardComponent heading={card.heading} points={card.points} />
}
