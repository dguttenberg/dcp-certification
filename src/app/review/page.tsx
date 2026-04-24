'use client'

import { useEffect, useState, useMemo, useRef } from 'react'
import Image from 'next/image'
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
  Lightbulb,
  AlertTriangle,
  Zap,
  MessageSquare,
  Download,
  User,
  X,
  Trash2,
} from 'lucide-react'

type Comment = {
  id: string
  author: string
  text: string
  createdAt: string // ISO
}

type CommentsByCard = Record<string, Comment[]>

const NAME_KEY = 'dcp-review-reviewer-name'
const COMMENTS_KEY = 'dcp-review-comments'

function loadComments(): CommentsByCard {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(COMMENTS_KEY)
    return raw ? (JSON.parse(raw) as CommentsByCard) : {}
  } catch {
    return {}
  }
}

function saveComments(c: CommentsByCard) {
  localStorage.setItem(COMMENTS_KEY, JSON.stringify(c))
}

function cardLabel(card: SectionCard): string {
  switch (card.type) {
    case 'hero':
      return `Hero — ${card.title}`
    case 'text':
      return card.heading ? `Text — ${card.heading}` : 'Text'
    case 'callout':
      return `Callout — ${card.text.slice(0, 60)}${card.text.length > 60 ? '…' : ''}`
    case 'scenario':
      return `Scenario — ${card.situation.slice(0, 80)}${card.situation.length > 80 ? '…' : ''}`
    case 'tool-grid':
      return `Tool grid — ${card.heading}`
    case 'prompt-compare':
      return `Prompt compare — ${card.heading}`
    case 'example':
      return `Example — ${card.label}`
    case 'summary':
      return `Summary — ${card.heading}`
    default:
      return 'Card'
  }
}

export default function ReviewPage() {
  const [mounted, setMounted] = useState(false)
  const [name, setName] = useState<string>('')
  const [nameDraft, setNameDraft] = useState<string>('')
  const [comments, setComments] = useState<CommentsByCard>({})

  useEffect(() => {
    setMounted(true)
    const storedName = localStorage.getItem(NAME_KEY) ?? ''
    setName(storedName)
    setNameDraft(storedName)
    setComments(loadComments())
  }, [])

  useEffect(() => {
    if (mounted) saveComments(comments)
  }, [comments, mounted])

  const totalComments = useMemo(
    () => Object.values(comments).reduce((a, arr) => a + arr.length, 0),
    [comments],
  )

  function addComment(cardId: string, text: string) {
    const trimmed = text.trim()
    if (!trimmed) return
    const comment: Comment = {
      id: crypto.randomUUID(),
      author: name || 'Anonymous',
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => ({
      ...prev,
      [cardId]: [...(prev[cardId] ?? []), comment],
    }))
  }

  function deleteComment(cardId: string, commentId: string) {
    setComments((prev) => {
      const next = { ...prev }
      next[cardId] = (next[cardId] ?? []).filter((c) => c.id !== commentId)
      if (next[cardId].length === 0) delete next[cardId]
      return next
    })
  }

  function exportMarkdown() {
    const lines: string[] = []
    lines.push(`# DCP Certification — Review Comments`)
    lines.push('')
    lines.push(`Exported: ${new Date().toLocaleString()}`)
    lines.push(`Total comments: ${totalComments}`)
    lines.push('')

    for (const section of sections) {
      const sectionComments = section.cards
        .map((card) => ({ card, list: comments[card.id] ?? [] }))
        .filter(({ list }) => list.length > 0)

      if (sectionComments.length === 0) continue

      lines.push(`## Section ${section.number} — ${section.title}`)
      lines.push('')

      for (const { card, list } of sectionComments) {
        lines.push(`### ${cardLabel(card)}`)
        lines.push('')
        for (const c of list) {
          const when = new Date(c.createdAt).toLocaleString()
          lines.push(`- **${c.author}** — _${when}_`)
          const body = c.text
            .split('\n')
            .map((line) => `  > ${line}`)
            .join('\n')
          lines.push(body)
          lines.push('')
        }
      }
    }

    if (totalComments === 0) {
      lines.push('_No comments yet._')
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
    a.href = url
    a.download = `dcp-cert-review-${stamp}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  function handleSaveName() {
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    localStorage.setItem(NAME_KEY, trimmed)
    setName(trimmed)
  }

  function handleSwitchReviewer() {
    setName('')
    setNameDraft('')
    localStorage.removeItem(NAME_KEY)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-offwhite">
        <div className="w-8 h-8 border-2 border-aurora-violet/30 border-t-aurora-violet rounded-full animate-spin" />
      </div>
    )
  }

  if (!name) {
    return <NamePrompt draft={nameDraft} setDraft={setNameDraft} onSave={handleSaveName} />
  }

  return (
    <div className="min-h-screen bg-offwhite">
      {/* Sticky header */}
      <header className="bg-midnight sticky top-0 z-30 border-b border-aurora-green/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-aurora-green text-[11px] font-bold tracking-[0.24em] uppercase whitespace-nowrap">
              Review Mode
            </span>
            <span className="hidden sm:inline text-[11px] text-white/40 tracking-wider truncate">
              DCP AI Foundations Certification
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={handleSwitchReviewer}
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.12em] uppercase text-white/60 hover:text-white transition-colors px-2.5 py-1.5 rounded-full border border-white/10 hover:border-white/30"
              title="Switch reviewer"
            >
              <User className="w-3.5 h-3.5" />
              {name}
            </button>
            <span className="sm:hidden text-[11px] font-semibold tracking-[0.12em] uppercase text-white/60">
              {name}
            </span>
            <button
              onClick={exportMarkdown}
              disabled={totalComments === 0}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.12em] uppercase transition-all ${
                totalComments === 0
                  ? 'bg-white/5 text-white/30 cursor-not-allowed'
                  : 'bg-aurora-green text-midnight hover:brightness-110'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              Export
              {totalComments > 0 && (
                <span className="ml-0.5 bg-midnight/20 rounded-full px-1.5 text-[10px]">
                  {totalComments}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Intro */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-4">
        <span className="dcp-eyebrow">Creative review</span>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-midnight tracking-tight">
          Full course in one scroll.
        </h1>
        <p className="mt-3 text-surface-600 leading-relaxed">
          All six sections laid out end-to-end. Leave a comment on any card — comments are saved
          in this browser under <strong className="text-midnight">{name}</strong>. Hit Export when
          you&apos;re done to download a markdown file with everything.
        </p>
      </section>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-20">
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="space-y-8 scroll-mt-24">
            <header className="border-t border-midnight/10 pt-8">
              <div className="flex items-baseline gap-4">
                <span className="text-aurora-violet text-[11px] font-bold tracking-[0.24em] uppercase">
                  Section {String(section.number).padStart(2, '0')} / {sections.length}
                </span>
                <span className="text-[11px] text-surface-500 tracking-wider">
                  {section.cards.length} cards
                </span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-midnight tracking-tight uppercase">
                {section.title}
              </h2>
              <p className="mt-2 text-surface-600 leading-relaxed max-w-2xl">
                {section.description}
              </p>
            </header>

            <div className="space-y-10">
              {section.cards.map((card, idx) => (
                <CardWithComments
                  key={card.id}
                  card={card}
                  cardNumber={idx + 1}
                  sectionNumber={section.number}
                  comments={comments[card.id] ?? []}
                  reviewer={name}
                  onAdd={(text) => addComment(card.id, text)}
                  onDelete={(commentId) => deleteComment(card.id, commentId)}
                />
              ))}
            </div>
          </section>
        ))}

        <footer className="border-t border-midnight/10 pt-10 pb-20 text-center">
          <p className="text-surface-500 text-sm">
            End of course. {totalComments} comment{totalComments === 1 ? '' : 's'} queued.
          </p>
          {totalComments > 0 && (
            <button
              onClick={exportMarkdown}
              className="mt-4 inline-flex items-center gap-2 bg-midnight text-white px-5 py-2.5 rounded-full text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-midnight/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export all comments
            </button>
          )}
        </footer>
      </main>
    </div>
  )
}

// ─────────────────────────────────────────────
// Name prompt (first visit + switch reviewer)
// ─────────────────────────────────────────────

function NamePrompt({
  draft,
  setDraft,
  onSave,
}: {
  draft: string
  setDraft: (s: string) => void
  onSave: () => void
}) {
  return (
    <div className="min-h-screen dcp-gradient-dark flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-aurora-violet/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-aurora-green/10 blur-3xl" />
      </div>
      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
        <span className="dcp-eyebrow dcp-eyebrow--green">DCP Certification · Review</span>
        <h1 className="mt-3 text-3xl font-bold text-white tracking-tight">Who&apos;s reviewing?</h1>
        <p className="mt-2 text-white/60 text-sm leading-relaxed">
          Your name will appear on every comment you leave. Stored only in this browser.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="mt-6 space-y-3"
        >
          <input
            autoFocus
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Your name"
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-aurora-green focus:ring-1 focus:ring-aurora-green/40"
          />
          <button
            type="submit"
            disabled={!draft.trim()}
            className="w-full bg-aurora-green text-midnight rounded-xl px-4 py-3 text-[11px] font-bold tracking-[0.15em] uppercase hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Start Reviewing
          </button>
        </form>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Card wrapper with comment thread
// ─────────────────────────────────────────────

function CardWithComments({
  card,
  cardNumber,
  sectionNumber,
  comments,
  reviewer,
  onAdd,
  onDelete,
}: {
  card: SectionCard
  cardNumber: number
  sectionNumber: number
  comments: Comment[]
  reviewer: string
  onAdd: (text: string) => void
  onDelete: (id: string) => void
}) {
  const [open, setOpen] = useState(comments.length > 0)
  const [draft, setDraft] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && textareaRef.current && comments.length === 0) {
      textareaRef.current.focus()
    }
  }, [open, comments.length])

  function submit() {
    const trimmed = draft.trim()
    if (!trimmed) return
    onAdd(trimmed)
    setDraft('')
  }

  return (
    <article className="group">
      {/* Card label */}
      <div className="flex items-center gap-3 mb-3 text-[10px] tracking-[0.2em] uppercase text-surface-500 font-semibold">
        <span className="tabular-nums">
          {String(sectionNumber).padStart(2, '0')}.{String(cardNumber).padStart(2, '0')}
        </span>
        <span className="h-px flex-1 bg-surface-200" />
        <span>{card.type.replace('-', ' ')}</span>
      </div>

      {/* Card content */}
      <div>{renderCard(card, sectionNumber)}</div>

      {/* Comment strip */}
      <div className="mt-3">
        {!open ? (
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.12em] uppercase text-surface-500 hover:text-aurora-violet transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            {comments.length > 0
              ? `${comments.length} comment${comments.length === 1 ? '' : 's'}`
              : 'Add comment'}
          </button>
        ) : (
          <div className="bg-white border border-surface-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-aurora-violet flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5" />
                Comments
                {comments.length > 0 && (
                  <span className="text-surface-400">· {comments.length}</span>
                )}
              </span>
              <button
                onClick={() => setOpen(false)}
                className="text-surface-400 hover:text-surface-700 transition-colors"
                title="Collapse"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {comments.length > 0 && (
              <ul className="space-y-2.5">
                {comments.map((c) => (
                  <li
                    key={c.id}
                    className="bg-surface-50 border border-surface-100 rounded-lg px-3 py-2.5 group/comment"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[10px] tracking-[0.15em] uppercase text-surface-500 font-semibold">
                        <span className="text-midnight">{c.author}</span>
                        <span>·</span>
                        <time>{formatShortDate(c.createdAt)}</time>
                      </div>
                      {c.author === reviewer && (
                        <button
                          onClick={() => onDelete(c.id)}
                          className="opacity-0 group-hover/comment:opacity-100 text-surface-400 hover:text-ember transition-all"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm text-midnight leading-relaxed whitespace-pre-wrap">
                      {c.text}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault()
                    submit()
                  }
                }}
                placeholder={`Leave a note as ${reviewer}…`}
                rows={2}
                className="w-full text-sm bg-white border border-surface-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-aurora-violet focus:ring-1 focus:ring-aurora-violet/30 resize-y"
              />
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-surface-400 tracking-wider">
                  ⌘/Ctrl + Enter to post
                </span>
                <button
                  onClick={submit}
                  disabled={!draft.trim()}
                  className="bg-aurora-violet text-white px-3.5 py-1.5 rounded-full text-[10px] font-bold tracking-[0.15em] uppercase disabled:opacity-30 disabled:cursor-not-allowed hover:brightness-110 transition-all"
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}

function formatShortDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// ─────────────────────────────────────────────
// Card renderers (aligned with course view)
// ─────────────────────────────────────────────

function renderCard(card: SectionCard, sectionNumber: number) {
  switch (card.type) {
    case 'hero':
      return <HeroCardView card={card as HeroCard} number={sectionNumber} />
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
      <p className={`text-sm leading-relaxed ${s.text} italic`}>{callout.text}</p>
    </div>
  )
}

function HeroCardView({ card, number }: { card: HeroCard; number: number }) {
  return (
    <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-midnight/10">
      <Image src={card.image} alt={card.title} fill className="object-cover" priority={number <= 2} />
      <div className="absolute inset-0 bg-gradient-to-t from-midnight via-midnight/40 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10">
        <span className="text-aurora-green text-[11px] font-bold tracking-[0.24em] uppercase">
          Section {String(number).padStart(2, '0')}
        </span>
        <div>
          <h3 className="text-3xl sm:text-5xl font-bold text-white uppercase tracking-tight leading-[0.95]">
            {card.title}
          </h3>
          <p className="mt-3 text-base sm:text-lg text-white/70 max-w-2xl">{card.subtitle}</p>
        </div>
      </div>
    </div>
  )
}

function TextCardView({ card }: { card: TextCard }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 shadow-sm p-6 sm:p-8 space-y-5">
      {card.heading && (
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-midnight tracking-tight uppercase">
            {card.heading}
          </h3>
          <div className="mt-2 w-10 h-[3px] bg-aurora-green rounded-full" />
        </div>
      )}
      <p className="text-base leading-relaxed text-surface-700 whitespace-pre-line">{card.body}</p>
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
    <div className={`${s.bg} border-l-4 ${s.border} rounded-r-2xl p-6 sm:p-8 flex gap-4 items-start`}>
      {s.icon}
      <p className="text-base leading-relaxed text-midnight italic">{card.text}</p>
    </div>
  )
}

function ScenarioCardView({ card }: { card: ScenarioCard }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 dcp-eyebrow">
        <span className="w-6 h-6 rounded-full bg-aurora-violet text-white flex items-center justify-center text-xs font-bold">
          ?
        </span>
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
        <h3 className="text-lg sm:text-xl font-bold text-midnight tracking-tight uppercase">
          {card.heading}
        </h3>
        <div className="mt-2 w-10 h-[3px] bg-aurora-green rounded-full" />
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
        <h3 className="text-lg sm:text-xl font-bold text-midnight tracking-tight uppercase">
          {card.heading}
        </h3>
        <div className="mt-2 w-10 h-[3px] bg-aurora-green rounded-full" />
      </div>
      <PromptCompare bad={card.bad} good={card.good} />
    </div>
  )
}

function ExampleCardView({ card }: { card: ExampleCard }) {
  return (
    <div className="bg-aurora-violet/10 border border-aurora-violet/20 rounded-2xl p-6 sm:p-8">
      <span className="dcp-eyebrow block mb-3">{card.label}</span>
      <p className="text-base leading-relaxed text-midnight">{card.text}</p>
    </div>
  )
}

function SummaryCardView({ card }: { card: SummaryCard }) {
  return <SummaryCardComponent heading={card.heading} points={card.points} />
}
