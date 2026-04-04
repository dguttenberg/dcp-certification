import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { quizQuestions, PASS_THRESHOLD } from '@/content/quiz'

export async function POST(request: NextRequest) {
  try {
    const { answers } = await request.json()

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Answers required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let score = 0
    for (const q of quizQuestions) {
      if (answers[q.id] === q.correct) {
        score++
      }
    }

    const total = quizQuestions.length
    const passed = score / total >= PASS_THRESHOLD

    const { data: attempt, error } = await supabase
      .from('quiz_attempts')
      .insert({
        user_id: user.id,
        score,
        total,
        passed,
        answers,
        attempted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (passed) {
      await supabase
        .from('completions')
        .insert({
          user_id: user.id,
          completed_at: new Date().toISOString(),
          quiz_attempt_id: attempt.id,
        })
    }

    return NextResponse.json({ score, total, passed, attemptId: attempt.id })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
