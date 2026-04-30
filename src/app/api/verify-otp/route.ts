import { NextRequest, NextResponse } from 'next/server'
import { adminClient, anonClient } from '@/lib/server-supabase'
import { setSessionCookie } from '@/lib/session'

export async function POST(req: NextRequest) {
  let body: { email?: string; token?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = String(body.email ?? '').trim().toLowerCase()
  const token = String(body.token ?? '').trim().replace(/\s+/g, '')

  if (!email || !token) {
    return NextResponse.json({ error: 'Email and code required.' }, { status: 400 })
  }
  if (!/^\d{4,10}$/.test(token)) {
    return NextResponse.json({ error: 'Code must be digits only.' }, { status: 400 })
  }

  // Re-check that this email is actually an admin (defence in depth).
  const supabase = adminClient()
  const { data: employee, error: empError } = await supabase
    .from('employees')
    .select('id, email, full_name, agency, is_admin, created_at')
    .eq('email', email)
    .maybeSingle()

  if (empError) {
    console.error('verify-otp employee lookup error:', empError)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
  if (!employee || !employee.is_admin) {
    return NextResponse.json({ error: 'Verification not required.' }, { status: 403 })
  }

  // Verify the OTP via Supabase (anon client; this is the standard auth flow).
  const { error: verifyError } = await anonClient().auth.verifyOtp({
    email,
    token,
    type: 'email',
  })
  if (verifyError) {
    return NextResponse.json(
      { error: 'That code is invalid or has expired. Request a new one.' },
      { status: 400 }
    )
  }

  setSessionCookie(employee.email as string)
  return NextResponse.json({
    user: {
      id: employee.id,
      email: employee.email,
      full_name: employee.full_name,
      agency: employee.agency,
      role: 'admin',
      created_at: employee.created_at,
    },
  })
}
