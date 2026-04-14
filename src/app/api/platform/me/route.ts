import { NextRequest, NextResponse } from 'next/server'

import { resolveServerRoleProfile } from '@/lib/server-platform-auth'

export async function GET(request: NextRequest) {
  try {
    const profile = await resolveServerRoleProfile(request)

    if (!profile) {
      return NextResponse.json({ authenticated: false, profile: null }, { status: 401 })
    }

    return NextResponse.json({ authenticated: true, profile })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server auth error'
    return NextResponse.json({ authenticated: false, profile: null, error: message }, { status: 500 })
  }
}
