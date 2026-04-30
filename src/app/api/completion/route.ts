import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/server-supabase'
import { getSessionEmail } from '@/lib/session'

export async function GET() {
  const email = getSessionEmail()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('completions')
    .select('id, email, completed_at, quiz_attempt_id')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('completion GET error:', error)
    return NextResponse.json({ error: 'Failed to load completion.' }, { status: 500 })
  }

  return NextResponse.json({ completion: data ?? null })
}

export async function POST(req: NextRequest) {
  const email = getSessionEmail()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { quiz_attempt_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const quizAttemptId = body.quiz_attempt_id ? String(body.quiz_attempt_id) : null

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('completions')
    .upsert(
      { email, quiz_attempt_id: quizAttemptId },
      { onConflict: 'email' }
    )
    .select('id, email, completed_at, quiz_attempt_id')
    .single()

  if (error || !data) {
    console.error('completion POST error:', error)
    return NextResponse.json({ error: 'Failed to record completion.' }, { status: 500 })
  }

  return NextResponse.json({ completion: data })
}
