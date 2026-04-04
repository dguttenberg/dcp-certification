import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: completion, error } = await supabase
      .from('completions')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !completion) {
      return NextResponse.json({ error: 'No completion record found' }, { status: 404 })
    }

    return NextResponse.json({
      certificateId: completion.id,
      completedAt: completion.completed_at,
      userName: user.user_metadata?.full_name || user.email,
    })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
