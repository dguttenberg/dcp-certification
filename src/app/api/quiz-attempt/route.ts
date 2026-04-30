import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/server-supabase'
import { getSessionEmail } from '@/lib/session'

export async function POST(req: NextRequest) {
  const email = getSessionEmail()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    score?: number
    total?: number
    passed?: boolean
    answers?: Record<string, string>
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const score = Number(body.score)
  const total = Number(body.total)
  const passed = Boolean(body.passed)
  const answers = body.answers && typeof body.answers === 'object' ? body.answers : {}

  if (!Number.isFinite(score) || !Number.isFinite(total) || total <= 0) {
    return NextResponse.json({ error: 'Invalid score.' }, { status: 400 })
  }

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert({ email, score, total, passed, answers })
    .select('id, score, total, passed, answers, attempted_at')
    .single()

  if (error || !data) {
    console.error('quiz-attempt POST error:', error)
    return NextResponse.json({ error: 'Failed to save attempt.' }, { status: 500 })
  }

  return NextResponse.json({ attempt: data })
}
