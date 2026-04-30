import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/server-supabase'
import { getSessionEmail } from '@/lib/session'

export async function GET() {
  const email = getSessionEmail()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('section_progress')
    .select('section_id, completed_at')
    .eq('email', email)
    .order('completed_at', { ascending: true })

  if (error) {
    console.error('progress GET error:', error)
    return NextResponse.json({ error: 'Failed to load progress.' }, { status: 500 })
  }

  return NextResponse.json({ progress: data ?? [] })
}

export async function POST(req: NextRequest) {
  const email = getSessionEmail()
  if (!email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { section_id?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const sectionId = String(body.section_id ?? '').trim()
  if (!sectionId) {
    return NextResponse.json({ error: 'section_id required.' }, { status: 400 })
  }

  const supabase = adminClient()
  const { error } = await supabase
    .from('section_progress')
    .upsert([{ email, section_id: sectionId }], {
      onConflict: 'email,section_id',
      ignoreDuplicates: true,
    })

  if (error) {
    console.error('progress POST error:', error)
    return NextResponse.json({ error: 'Failed to save progress.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
