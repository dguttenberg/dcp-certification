import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/server-supabase'
import { getSessionEmail } from '@/lib/session'

const TOTAL_SECTIONS = 6

export async function GET() {
  const email = getSessionEmail()
  if (!email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = adminClient()

  const { data: me, error: meErr } = await supabase
    .from('employees')
    .select('is_admin')
    .eq('email', email)
    .maybeSingle()

  if (meErr) {
    console.error('admin/users me error:', meErr)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
  if (!me?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [{ data: employees }, { data: progress }, { data: completions }, { data: attempts }] =
    await Promise.all([
      supabase
        .from('employees')
        .select('id, email, full_name, agency, is_admin, created_at')
        .order('full_name', { ascending: true }),
      supabase.from('section_progress').select('email, section_id, completed_at'),
      supabase.from('completions').select('email, completed_at'),
      supabase.from('quiz_attempts').select('email, passed, attempted_at'),
    ])

  const sectionsByEmail = new Map<string, Set<string>>()
  const lastActivityByEmail = new Map<string, string>()
  for (const p of progress ?? []) {
    const set = sectionsByEmail.get(p.email) ?? new Set<string>()
    set.add(p.section_id)
    sectionsByEmail.set(p.email, set)
    const prev = lastActivityByEmail.get(p.email) ?? ''
    if (p.completed_at > prev) lastActivityByEmail.set(p.email, p.completed_at)
  }

  const completedByEmail = new Map<string, string>()
  for (const c of completions ?? []) {
    completedByEmail.set(c.email, c.completed_at)
    const prev = lastActivityByEmail.get(c.email) ?? ''
    if (c.completed_at > prev) lastActivityByEmail.set(c.email, c.completed_at)
  }

  const passedByEmail = new Map<string, boolean>()
  for (const a of attempts ?? []) {
    if (!passedByEmail.has(a.email)) passedByEmail.set(a.email, false)
    if (a.passed) passedByEmail.set(a.email, true)
    const prev = lastActivityByEmail.get(a.email) ?? ''
    if (a.attempted_at > prev) lastActivityByEmail.set(a.email, a.attempted_at)
  }

  const users = (employees ?? []).map((e) => {
    const sectionsCompleted = sectionsByEmail.get(e.email)?.size ?? 0
    const quizPassed = passedByEmail.get(e.email) ?? false
    const completedAt = completedByEmail.get(e.email) ?? null

    let status: 'not-started' | 'in-progress' | 'completed' = 'not-started'
    if (completedAt) status = 'completed'
    else if (sectionsCompleted > 0 || passedByEmail.has(e.email)) status = 'in-progress'

    return {
      id: e.id,
      email: e.email,
      full_name: e.full_name,
      agency: e.agency,
      role: e.is_admin ? 'admin' : 'learner',
      created_at: e.created_at,
      sections_completed: sectionsCompleted,
      total_sections: TOTAL_SECTIONS,
      status,
      last_activity: lastActivityByEmail.get(e.email) ?? null,
      quiz_passed: quizPassed,
      completed_at: completedAt,
    }
  })

  return NextResponse.json({ users })
}
