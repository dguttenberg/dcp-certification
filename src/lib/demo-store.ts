import type { User, SectionProgress, QuizAttempt, Completion } from './types'

const PREFIX = 'dcp-cert-'

// ---------------------------------------------------------------------------
// Demo mode check
// ---------------------------------------------------------------------------
export function isDemo(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// ---------------------------------------------------------------------------
// LocalStorage helpers
// ---------------------------------------------------------------------------
function getItem<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(PREFIX + key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(PREFIX + key, JSON.stringify(value))
}

// ---------------------------------------------------------------------------
// Demo user
// ---------------------------------------------------------------------------
const DEMO_USER: User = {
  id: 'demo-user-001',
  email: 'demo.user@doner.com',
  full_name: 'Alex Johnson',
  agency: 'Doner',
  role: 'learner',
  created_at: new Date().toISOString(),
}

export function getDemoUser(): User {
  const stored = getItem<User | null>('user', null)
  if (stored) return stored
  setItem('user', DEMO_USER)
  return DEMO_USER
}

// ---------------------------------------------------------------------------
// Admin mode toggle
// ---------------------------------------------------------------------------
export function isAdminMode(): boolean {
  return getItem<boolean>('admin-mode', false)
}

export function setAdminMode(enabled: boolean): void {
  setItem('admin-mode', enabled)
  // Also flip the user role so the rest of the app reacts
  const user = getDemoUser()
  const updated: User = { ...user, role: enabled ? 'admin' : 'learner' }
  setItem('user', updated)
}

// ---------------------------------------------------------------------------
// Section progress
// ---------------------------------------------------------------------------
export function getSectionProgress(): SectionProgress[] {
  return getItem<SectionProgress[]>('section-progress', [])
}

export function setSectionProgress(progress: SectionProgress[]): void {
  setItem('section-progress', progress)
}

export function completeSection(sectionId: string): SectionProgress[] {
  const current = getSectionProgress()
  if (current.some((s) => s.section_id === sectionId)) return current
  const updated = [...current, { section_id: sectionId, completed_at: new Date().toISOString() }]
  setSectionProgress(updated)
  return updated
}

// ---------------------------------------------------------------------------
// Quiz attempts
// ---------------------------------------------------------------------------
export function getQuizAttempts(): QuizAttempt[] {
  return getItem<QuizAttempt[]>('quiz-attempts', [])
}

export function addQuizAttempt(attempt: Omit<QuizAttempt, 'id' | 'attempted_at'>): QuizAttempt {
  const full: QuizAttempt = {
    ...attempt,
    id: `attempt-${Date.now()}`,
    attempted_at: new Date().toISOString(),
  }
  const attempts = getQuizAttempts()
  attempts.push(full)
  setItem('quiz-attempts', attempts)
  return full
}

// ---------------------------------------------------------------------------
// Completion record
// ---------------------------------------------------------------------------
export function getCompletion(): Completion | null {
  return getItem<Completion | null>('completion', null)
}

export function setCompletion(quizAttemptId: string): Completion {
  const user = getDemoUser()
  const record: Completion = {
    id: `completion-${Date.now()}`,
    user_id: user.id,
    completed_at: new Date().toISOString(),
    quiz_attempt_id: quizAttemptId,
  }
  setItem('completion', record)
  return record
}

// ---------------------------------------------------------------------------
// Mock admin data — 50 fake users with varied progress
// ---------------------------------------------------------------------------
const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'Logan', 'Mia', 'Lucas', 'Charlotte', 'Jackson', 'Amelia',
  'Aiden', 'Harper', 'Sebastian', 'Evelyn', 'Mateo', 'Abigail', 'Henry',
  'Emily', 'Alexander', 'Ella', 'Owen', 'Scarlett', 'Daniel', 'Grace',
  'James', 'Chloe', 'Benjamin', 'Victoria', 'Elijah', 'Riley', 'William',
  'Aria', 'Michael', 'Lily', 'Jack', 'Aubrey', 'Theodore', 'Zoey', 'Samuel',
  'Penelope', 'Ryan', 'Layla', 'Nathan', 'Nora', 'Caleb',
]

const LAST_NAMES = [
  'Smith', 'Garcia', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller',
  'Davis', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore',
  'Martin', 'Lee', 'Clark', 'Hall', 'Allen', 'Young', 'King', 'Wright',
  'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Nelson', 'Carter',
  'Mitchell', 'Perez', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker',
  'Evans', 'Edwards', 'Collins', 'Stewart', 'Sanchez', 'Morris', 'Rogers',
  'Reed', 'Cook', 'Morgan', 'Bell', 'Murphy', 'Bailey',
]

const AGENCIES = ['Doner', 'Colle McVoy', 'DCP'] as const

const TOTAL_SECTION_COUNT = 6

export interface MockAdminUser {
  id: string
  email: string
  full_name: string
  agency: string
  role: 'learner'
  created_at: string
  sections_completed: number
  total_sections: number
  status: 'not-started' | 'in-progress' | 'completed'
  last_activity: string | null
  quiz_passed: boolean
}

/**
 * Generates 50 deterministic-ish mock users for the admin dashboard demo.
 * The distribution:
 *  - ~10 completed (all sections done, quiz passed)
 *  - ~25 in progress (1-5 sections done)
 *  - ~15 not started (0 sections)
 */
export function generateMockAdminData(): MockAdminUser[] {
  const users: MockAdminUser[] = []

  for (let i = 0; i < 50; i++) {
    const firstName = FIRST_NAMES[i]
    const lastName = LAST_NAMES[i]
    const agency = AGENCIES[i % 3]
    const emailDomain =
      agency === 'Doner'
        ? 'doner.com'
        : agency === 'Colle McVoy'
          ? 'collemcvoy.com'
          : 'dcpgroup.com'

    // Distribute statuses: first 10 completed, next 25 in-progress, last 15 not started
    let sectionsCompleted: number
    let quizPassed: boolean
    let status: MockAdminUser['status']

    if (i < 10) {
      sectionsCompleted = TOTAL_SECTION_COUNT
      quizPassed = true
      status = 'completed'
    } else if (i < 35) {
      sectionsCompleted = ((i - 10) % 5) + 1 // 1-5 sections
      quizPassed = false
      status = 'in-progress'
    } else {
      sectionsCompleted = 0
      quizPassed = false
      status = 'not-started'
    }

    // Stagger created_at dates over the past 60 days
    const daysAgo = 60 - i
    const created = new Date()
    created.setDate(created.getDate() - daysAgo)

    // Last activity: completed users within last 7 days, in-progress within last 14, not-started null
    let lastActivity: string | null = null
    if (status === 'completed') {
      const d = new Date()
      d.setDate(d.getDate() - (i % 7))
      lastActivity = d.toISOString()
    } else if (status === 'in-progress') {
      const d = new Date()
      d.setDate(d.getDate() - (i % 14))
      lastActivity = d.toISOString()
    }

    users.push({
      id: `mock-user-${String(i + 1).padStart(3, '0')}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${emailDomain}`,
      full_name: `${firstName} ${lastName}`,
      agency,
      role: 'learner',
      created_at: created.toISOString(),
      sections_completed: sectionsCompleted,
      total_sections: TOTAL_SECTION_COUNT,
      status,
      last_activity: lastActivity,
      quiz_passed: quizPassed,
    })
  }

  return users
}

// ---------------------------------------------------------------------------
// Reset all demo data
// ---------------------------------------------------------------------------
export function resetDemoData(): void {
  if (typeof window === 'undefined') return
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))
  keys.forEach((k) => localStorage.removeItem(k))
}
