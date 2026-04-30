import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/server-supabase'
import { getSessionEmail, clearSessionCookie } from '@/lib/session'

export async function GET() {
  const email = getSessionEmail()
  if (!email) {
    return NextResponse.json({ user: null })
  }

  const supabase = adminClient()
  const { data, error } = await supabase
    .from('employees')
    .select('id, email, full_name, agency, is_admin, created_at')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('me lookup error:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }

  if (!data) {
    // Email no longer on roster — clear stale session.
    clearSessionCookie()
    return NextResponse.json({ user: null })
  }

  return NextResponse.json({
    user: {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      agency: data.agency,
      role: data.is_admin ? 'admin' : 'learner',
      created_at: data.created_at,
    },
  })
}
