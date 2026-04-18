import { NextRequest, NextResponse } from 'next/server'

import { type PlatformRole, isPlatformRole } from '@/lib/rbac'
import { createPlatformServiceClient, normalizePhone, requireServerRoleProfile } from '@/lib/server-platform-auth'

type StaffUpdatePayload = {
  phone?: string
  display_name?: string | null
  primary_role?: string
  roles?: string[]
  is_active?: boolean
}

function sanitizeRoles(primaryRole: PlatformRole | null, roles: string[] | undefined) {
  const parsedRoles = (roles ?? []).filter((role): role is PlatformRole => isPlatformRole(role))
  return Array.from(new Set(primaryRole ? [primaryRole, ...parsedRoles] : parsedRoles))
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const auth = await requireServerRoleProfile(request, ['owner'])
    if (!auth.ok) {
      return auth.response
    }

    const { userId } = await context.params
    const body = (await request.json()) as StaffUpdatePayload
    const serviceClient = createPlatformServiceClient()

    const { data: existing, error: existingError } = await serviceClient
      .from('staff_accounts')
      .select('id, user_id, phone, display_name, primary_role, roles, is_active')
      .eq('user_id', userId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ error: existingError.message }, { status: 500 })
    }

    if (!existing) {
      return NextResponse.json({ error: 'Staff account not found' }, { status: 404 })
    }

    const primaryRole =
      typeof body.primary_role === 'string' && isPlatformRole(body.primary_role)
        ? body.primary_role
        : (existing.primary_role as PlatformRole)

    const update = {
      phone: body.phone ? normalizePhone(body.phone) : existing.phone,
      display_name:
        body.display_name === undefined
          ? existing.display_name
          : body.display_name?.trim() || null,
      primary_role: primaryRole,
      roles: sanitizeRoles(primaryRole, body.roles ?? existing.roles ?? []),
      is_active: typeof body.is_active === 'boolean' ? body.is_active : existing.is_active,
    }

    const { data, error } = await serviceClient
      .from('staff_accounts')
      .update(update)
      .eq('user_id', userId)
      .select('id, user_id, phone, display_name, primary_role, roles, is_active, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ staff: data })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update staff account.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
