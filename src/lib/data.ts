'use client'

import {
  isDemo,
  getSectionProgress as demoGetSectionProgress,
  completeSection as demoCompleteSection,
  getCompletion as demoGetCompletion,
  setCompletion as demoSetCompletion,
  addQuizAttempt as demoAddQuizAttempt,
} from './demo-store'
import type { SectionProgress, QuizAttempt, Completion } from './types'

// ---------------------------------------------------------------------------
// Section progress
// ---------------------------------------------------------------------------
export async function fetchSectionProgress(): Promise<SectionProgress[]> {
  if (isDemo()) return demoGetSectionProgress()

  const res = await fetch('/api/progress', { cache: 'no-store' })
  if (!res.ok) {
    console.error('fetchSectionProgress failed:', res.status)
    return []
  }
  const body = await res.json()
  return (body.progress ?? []) as SectionProgress[]
}

export async function recordSectionComplete(sectionId: string): Promise<void> {
  if (isDemo()) {
    demoCompleteSection(sectionId)
    return
  }
  const res = await fetch('/api/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section_id: sectionId }),
  })
  if (!res.ok) console.error('recordSectionComplete failed:', res.status)
}

// ---------------------------------------------------------------------------
// Completion
// ---------------------------------------------------------------------------
export async function fetchCompletion(): Promise<Completion | null> {
  if (isDemo()) return demoGetCompletion()

  const res = await fetch('/api/completion', { cache: 'no-store' })
  if (!res.ok) return null
  const body = await res.json()
  if (!body.completion) return null
  return {
    id: body.completion.id,
    user_id: '', // unused under email-based sessions
    completed_at: body.completion.completed_at,
    quiz_attempt_id: body.completion.quiz_attempt_id ?? '',
  }
}

export async function recordCompletion(quizAttemptId: string): Promise<Completion> {
  if (isDemo()) return demoSetCompletion(quizAttemptId)

  const res = await fetch('/api/completion', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quiz_attempt_id: quizAttemptId }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to record completion')
  }
  const body = await res.json()
  return {
    id: body.completion.id,
    user_id: '',
    completed_at: body.completion.completed_at,
    quiz_attempt_id: body.completion.quiz_attempt_id ?? '',
  }
}

// ---------------------------------------------------------------------------
// Quiz attempts
// ---------------------------------------------------------------------------
export async function recordQuizAttempt(
  input: Omit<QuizAttempt, 'id' | 'attempted_at'>
): Promise<QuizAttempt> {
  if (isDemo()) return demoAddQuizAttempt(input)

  const res = await fetch('/api/quiz-attempt', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? 'Failed to record quiz attempt')
  }
  const body = await res.json()
  return {
    id: body.attempt.id,
    score: body.attempt.score,
    total: body.attempt.total,
    passed: body.attempt.passed,
    answers: body.attempt.answers as Record<string, string>,
    attempted_at: body.attempt.attempted_at,
  }
}
