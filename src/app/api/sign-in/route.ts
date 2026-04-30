import { NextRequest, NextResponse } from 'next/server'
import { adminClient, anonClient } from '@/lib/server-supabase'
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
      { error: 'Sign-in is temporarily unavailable. Please try again in a few minutes.' },
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
          "We don't see this email on the certification roster. Double-check the address you used, or reach out to the certification administrator if you believe this is a mistake.",
      },
      { status: 404 }
    )
  }

  // Admins must verify with a one-time code sent to their email.
  // Learners get the cookie immediately.
  if (employee.is_admin) {
    const { error: otpError } = await anonClient().auth.signInWithOtp({
      email: employee.email as string,
      options: { shouldCreateUser: true },
    })
    if (otpError) {
      console.error('OTP send error:', otpError)
      return NextResponse.json(
        { error: 'Could not send verification code. Try again in a minute.' },
        { status: 500 }
      )
    }
    return NextResponse.json({
      challenge: 'otp',
      email: employee.email,
    })
  }

  setSessionCookie(employee.email as string)
  return NextResponse.json({
    user: {
      id: employee.id,
      email: employee.email,
      full_name: employee.full_name,
      agency: employee.agency,
      role: 'learner',
      created_at: employee.created_at,
    },
  })
}
