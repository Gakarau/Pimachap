import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

function parseBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice('Bearer '.length)
}

/**
 * Validates the bearer token and returns the Supabase user.
 * Used by consumer-facing API routes (no staff_accounts lookup required).
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<User | null> {
  const token = parseBearerToken(request)
  if (!token) return null

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) return null

  const client = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const {
    data: { user },
    error,
  } = await client.auth.getUser(token)

  if (error || !user) return null
  return user
}

/** Derives a Paystack-compatible email for phone-only Supabase users. */
export function resolvePaystackEmail(user: User): string {
  if (user.email) return user.email
  const phone = user.phone?.replace('+', '') ?? user.id.slice(0, 10)
  return `${phone}@pimachap.app`
}
