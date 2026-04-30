import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'dcp_session'
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function getSecret(): string {
  const s = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing — cannot sign session.')
  }
  return s
}

function sign(payload: string): string {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function makeSessionToken(email: string): string {
  const payload = Buffer.from(email.toLowerCase()).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined | null): string | null {
  if (!token) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null

  const expected = sign(payload)
  let sigBuf: Buffer
  let expBuf: Buffer
  try {
    sigBuf = Buffer.from(sig, 'base64url')
    expBuf = Buffer.from(expected, 'base64url')
  } catch {
    return null
  }
  if (sigBuf.length !== expBuf.length) return null
  if (!timingSafeEqual(sigBuf, expBuf)) return null

  try {
    return Buffer.from(payload, 'base64url').toString('utf8')
  } catch {
    return null
  }
}

/**
 * Read the email out of the request's session cookie.
 * Returns null when there is no valid session.
 */
export function getSessionEmail(): string | null {
  const token = cookies().get(SESSION_COOKIE)?.value
  return verifySessionToken(token)
}

export function setSessionCookie(email: string): void {
  cookies().set(SESSION_COOKIE, makeSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export function clearSessionCookie(): void {
  cookies().delete(SESSION_COOKIE)
}
