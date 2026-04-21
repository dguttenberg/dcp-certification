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
  InlineCallout,
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
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="w-8 h-8 border-2 border-aurora-violet/30 border-t-aurora-violet rounded-full animate-spin" />
      </div>
    )
  }

  if (!section) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-offwhite gap-4">
        <p className="text-surface-600">Section not found.</p>
        <Link href="/course" className="dcp-btn-secondary" style={{ color: '#000531', borderColor: '#000531' }}>
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
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Top bar */}
      <header className="bg-midnight sticky top-0 z-20 border-b border-aurora-green/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <Link
            href="/course"
            className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.15em] uppercase text-white/60 hover:text-aurora-green transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="flex-1 flex items-center gap-3 justify-center max-w-md">
            <span className="text-[11px] text-white/50 tabular-nums tracking-wider">
              {currentCardIndex + 1} / {totalCards}
            </span>
            <div className="flex-1 h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-aurora-green transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-[11px] text-white/50 tracking-wider whitespace-nowrap">
            <span className="hidden sm:inline">Section </span>
            {section.number}/{sections.length}
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
      <footer className="bg-white sticky bottom-0 z-20 border-t border-surface-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <button
            onClick={goPrev}
            disabled={isFirstCard}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[11px] font-bold tracking-[0.1em] uppercase transition-all ${
              isFirstCard
                ? 'text-surface-300 cursor-not-allowed'
                : 'text-surface-600 hover:bg-surface-100'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-1.5">
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
                    ? 'w-6 h-1.5 bg-aurora-violet'
                    : i < currentCardIndex
                      ? 'w-1.5 h-1.5 bg-aurora-violet/40'
                      : 'w-1.5 h-1.5 bg-surface-300'
                } ${totalCards > 20 ? 'hidden sm:block' : ''}`}
                aria-label={`Go to card ${i + 1}`}
              />
            ))}
          </div>

          {isLastCard ? (
            !isCompleted ? (
              <button
                onClick={handleMarkComplete}
                className="dcp-btn-primary"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                Complete
              </button>
            ) : nextSection ? (
              <Link
                href={`/course/${nextSection.id}`}
                className="dcp-btn-primary"
              >
                Next Section
                <ChevronRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                href="/course"
                className="dcp-btn-primary"
              >
                <Check className="w-4 h-4" strokeWidth={3} />
                Done
              </Link>
            )
          ) : (
            <button
              onClick={goNext}
              className="dcp-btn-primary"
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
        return <HeroCardView card={card as HeroCard} number={section!.number} />
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
// Inline Callout (rendered below TextCard / ToolGridCard)
// ─────────────────────────────────────────────

function InlineCalloutBlock({ callout }: { callout: InlineCallout }) {
  const styles = {
    insight: {
      bg: 'bg-aurora-violet/10',
      border: 'border-aurora-violet',
      icon: <Lightbulb className="w-4 h-4 text-aurora-violet flex-shrink-0 mt-0.5" />,
      text: 'text-midnight',
    },
    warning: {
      bg: 'bg-ember/10',
      border: 'border-ember',
      icon: <AlertTriangle className="w-4 h-4 text-ember flex-shrink-0 mt-0.5" />,
      text: 'text-midnight',
    },
    tip: {
      bg: 'bg-aurora-green/10',
      border: 'border-aurora-green',
      icon: <Zap className="w-4 h-4 text-accent-700 flex-shrink-0 mt-0.5" />,
      text: 'text-midnight',
    },
  }
  const s = styles[callout.style ?? 'insight']

  return (
    <div className={`${s.bg} border-l-[3px] ${s.border} rounded-r-lg p-4 flex gap-3 items-start`}>
      {s.icon}
      <p className={`text-sm leading-relaxed ${s.text} italic`}>
        {callout.text}
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────
// Card Renderers
// ─────────────────────────────────────────────

function HeroCardView({ card, number }: { card: HeroCard; number: number }) {
  return (
    <div className="space-y-6">
      <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden shadow-xl border border-midnight/10">
        <Image
          src={card.image}
          alt={card.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
          <div className="flex items-center justify-between">
            <span className="text-aurora-green text-[11px] font-bold tracking-[0.24em] uppercase">
              Section {String(number).padStart(2, '0')}
            </span>
          </div>
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white uppercase tracking-tight leading-[0.95]">
              {card.title}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-white/70 max-w-2xl">
              {card.subtitle}
            </p>
          </div>
        </div>
      </div>
      <p className="text-xs text-surface-500 text-center tracking-wider">
        Press <kbd className="px-1.5 py-0.5 bg-surface-100 border border-surface-300 rounded text-[10px] font-mono">→</kbd> or click Next to continue
      </p>
    </div>
  )
}

function TextCardView({ card }: { card: TextCard }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-8 sm:p-12 space-y-6">
      {card.heading && (
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-midnight tracking-tight uppercase">
            {card.heading}
          </h2>
          <div className="mt-3 w-10 h-[3px] bg-aurora-green rounded-full" />
        </div>
      )}
      <p className="text-base sm:text-lg leading-relaxed text-surface-700 whitespace-pre-line">
        {card.body}
      </p>
      {card.callout && <InlineCalloutBlock callout={card.callout} />}
    </div>
  )
}

function CalloutCardView({ card }: { card: CalloutCard }) {
  const styles = {
    insight: {
      bg: 'bg-aurora-violet/10',
      border: 'border-aurora-violet',
      icon: <Lightbulb className="w-5 h-5 text-aurora-violet flex-shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-ember/10',
      border: 'border-ember',
      icon: <AlertTriangle className="w-5 h-5 text-ember flex-shrink-0 mt-0.5" />,
    },
    tip: {
      bg: 'bg-aurora-green/15',
      border: 'border-aurora-green',
      icon: <Zap className="w-5 h-5 text-accent-700 flex-shrink-0 mt-0.5" />,
    },
  }
  const s = styles[card.style ?? 'insight']

  return (
    <div className={`${s.bg} border-l-4 ${s.border} rounded-r-2xl p-8 sm:p-10 flex gap-4 items-start`}>
      {s.icon}
      <p className="text-base sm:text-lg leading-relaxed text-midnight italic">
        {card.text}
      </p>
    </div>
  )
}

function ScenarioCardView({ card }: { card: ScenarioCard }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 dcp-eyebrow">
        <span className="w-6 h-6 rounded-full bg-aurora-violet text-white flex items-center justify-center text-xs font-bold">?</span>
        What would you do?
      </div>
      <ScenarioCardComponent situation={card.situation} options={card.options} />
    </div>
  )
}

function ToolGridCardView({ card }: { card: ToolGridCard }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-midnight tracking-tight uppercase">
          {card.heading}
        </h2>
        <div className="mt-3 w-10 h-[3px] bg-aurora-green rounded-full" />
      </div>
      <ToolGrid tools={card.tools} />
      {card.callout && <InlineCalloutBlock callout={card.callout} />}
    </div>
  )
}

function PromptCompareCardView({ card }: { card: PromptCompareCard }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-midnight tracking-tight uppercase">
          {card.heading}
        </h2>
        <div className="mt-3 w-10 h-[3px] bg-aurora-green rounded-full" />
      </div>
      <PromptCompare bad={card.bad} good={card.good} />
    </div>
  )
}

function ExampleCardView({ card }: { card: ExampleCard }) {
  return (
    <div className="bg-aurora-violet/10 border border-aurora-violet/20 rounded-2xl p-8 sm:p-10">
      <span className="dcp-eyebrow block mb-3">
        {card.label}
      </span>
      <p className="text-base sm:text-lg leading-relaxed text-midnight">
        {card.text}
      </p>
    </div>
  )
}

function SummaryCardView({ card }: { card: SummaryCard }) {
  return <SummaryCardComponent heading={card.heading} points={card.points} />
}
