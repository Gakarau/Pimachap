import { NextRequest, NextResponse } from 'next/server'

import { PLATFORM_ROLES, type PlatformRole, isPlatformRole } from '@/lib/rbac'
import { createPlatformServiceClient, findAuthUserByPhone, normalizePhone, requireServerRoleProfile } from '@/lib/server-platform-auth'

type StaffAccountPayload = {
  phone?: string
  display_name?: string
  primary_role?: string
  roles?: string[]
}

function sanitizeRoles(primaryRole: PlatformRole, roles: string[] | undefined) {
  const parsedRoles = (roles ?? []).filter((role): role is PlatformRole => isPlatformRole(role))
  return Array.from(new Set([primaryRole, ...parsedRoles]))
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireServerRoleProfile(request, ['owner'])
    if (!auth.ok) {
      return auth.response
    }

    const serviceClient = createPlatformServiceClient()
    const { data, error } = await serviceClient
      .from('staff_accounts')
      .select('id, user_id, phone, display_name, primary_role, roles, is_active, created_at, updated_at')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      staff: data ?? [],
      available_roles: PLATFORM_ROLES,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to load staff accounts.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireServerRoleProfile(request, ['owner'])
    if (!auth.ok) {
      return auth.response
    }

    const body = (await request.json()) as StaffAccountPayload
    const normalizedPhone = normalizePhone(body.phone)
    const primaryRole = body.primary_role

    if (!normalizedPhone || !primaryRole || !isPlatformRole(primaryRole)) {
      return NextResponse.json({ error: 'phone and a valid primary_role are required' }, { status: 400 })
    }

    const serviceClient = createPlatformServiceClient()
    const authUser = await findAuthUserByPhone(normalizedPhone, serviceClient)

    if (!authUser) {
      return NextResponse.json(
        {
          error: 'No authenticated user exists for that phone yet. Ask them to sign in once first.',
        },
        { status: 404 }
      )
    }

    const roles = sanitizeRoles(primaryRole, body.roles)
    const payload = {
      user_id: authUser.id,
      phone: normalizedPhone,
      display_name: body.display_name?.trim() || authUser.user_metadata?.full_name || null,
      primary_role: primaryRole,
      roles,
      is_active: true,
    }

    const { data, error } = await serviceClient
      .from('staff_accounts')
      .upsert(payload, { onConflict: 'user_id' })
      .select('id, user_id, phone, display_name, primary_role, roles, is_active, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ staff: data }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to save staff account.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
