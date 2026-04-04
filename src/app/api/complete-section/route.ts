import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { sectionId } = await request.json()

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID required' }, { status: 400 })
    }

    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: existing } = await supabase
      .from('section_progress')
      .select('id')
      .eq('user_id', user.id)
      .eq('section_id', sectionId)
      .single()

    if (existing) {
      return NextResponse.json({ message: 'Already completed' })
    }

    const { error } = await supabase
      .from('section_progress')
      .insert({
        user_id: user.id,
        section_id: sectionId,
        completed_at: new Date().toISOString(),
      })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
