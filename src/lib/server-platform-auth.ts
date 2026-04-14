import { createClient } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'

import type { PlatformRole, RoleProfile } from '@/lib/rbac'
import { PLATFORM_ROLES } from '@/lib/rbac'

type StaffAccountRow = {
  user_id: string
  phone: string | null
  display_name: string | null
  primary_role: PlatformRole
  roles: PlatformRole[] | null
  is_active: boolean
}

type PartnerMembershipRow = {
  user_id: string
  lab_id: string
  role: PlatformRole
  is_active: boolean
}

function getEnv(name: 'NEXT_PUBLIC_SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY') {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

function parseBearerToken(request: NextRequest) {
  const header = request.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) {
    return null
  }

  return header.slice('Bearer '.length)
}

function createAnonServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing public Supabase environment variables')
  }

  return createClient(url, anon, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function createServiceRoleClient() {
  return createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

function dedupeRoles(roles: PlatformRole[]) {
  return Array.from(new Set(roles.filter((role) => PLATFORM_ROLES.includes(role))))
}

export async function resolveServerRoleProfile(request: NextRequest): Promise<RoleProfile | null> {
  const token = parseBearerToken(request)
  if (!token) {
    return null
  }

  const anonClient = createAnonServerClient()
  const {
    data: { user },
    error: userError,
  } = await anonClient.auth.getUser(token)

  if (userError || !user) {
    return null
  }

  const serviceClient = createServiceRoleClient()

  const [{ data: staffRows }, { data: partnerRows }] = await Promise.all([
    serviceClient
      .from('staff_accounts')
      .select('user_id, phone, display_name, primary_role, roles, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1),
    serviceClient
      .from('partner_memberships')
      .select('user_id, lab_id, role, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true),
  ])

  const staff = (staffRows?.[0] ?? null) as StaffAccountRow | null
  const memberships = (partnerRows ?? []) as PartnerMembershipRow[]

  const roles = dedupeRoles([
    ...(staff?.roles ?? []),
    ...(staff?.primary_role ? [staff.primary_role] : []),
    ...memberships.map((membership) => membership.role),
  ])

  const primaryRole = staff?.primary_role ?? roles[0] ?? null

  return {
    userId: user.id,
    phone: staff?.phone ?? user.phone ?? null,
    roles,
    primaryRole,
    scopedLabIds: memberships.map((membership) => membership.lab_id),
    displayName: staff?.display_name ?? 'Platform User',
  }
}
