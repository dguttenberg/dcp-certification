import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/server-supabase'
import { setSessionCookie } from '@/lib/session'

export async function POST(req: NextRequest) {
  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    )
  }

  let supabase
  try {
    supabase = adminClient()
  } catch (err) {
    console.error('Supabase config error:', err)
    return NextResponse.json(
      { error: 'Server is misconfigured. Contact your producer.' },
      { status: 500 }
    )
  }

  const { data: employee, error } = await supabase
    .from('employees')
    .select('id, email, full_name, agency, is_admin, created_at')
    .eq('email', email)
    .maybeSingle()

  if (error) {
    console.error('Roster lookup error:', error)
    return NextResponse.json(
      { error: 'Could not verify your email. Try again.' },
      { status: 500 }
    )
  }

  if (!employee) {
    return NextResponse.json(
      {
        error:
          "We don't see this email on the certification roster. If you think this is wrong, contact your producer or department lead.",
      },
      { status: 404 }
    )
  }

  setSessionCookie(employee.email as string)

  return NextResponse.json({
    user: {
      id: employee.id,
      email: employee.email,
      full_name: employee.full_name,
      agency: employee.agency,
      role: employee.is_admin ? 'admin' : 'learner',
      created_at: employee.created_at,
    },
  })
}
