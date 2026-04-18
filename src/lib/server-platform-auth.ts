import { createClient, type User } from '@supabase/supabase-js'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

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

export function normalizePhone(value: string | null | undefined) {
  if (!value) {
    return null
  }

  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.startsWith('+')) {
    return trimmed
  }

  const digits = trimmed.replace(/\D/g, '')
  if (!digits) {
    return null
  }

  if (digits.startsWith('254')) {
    return `+${digits}`
  }

  if (digits.startsWith('0')) {
    return `+254${digits.slice(1)}`
  }

  return `+${digits}`
}

function parsePhoneList(value: string | undefined) {
  return new Set(
    (value ?? '')
      .split(',')
      .map((item) => normalizePhone(item))
      .filter((item): item is string => Boolean(item))
  )
}

function getBootstrapRoles(phone: string | null): PlatformRole[] {
  if (!phone) {
    return []
  }

  const mappings: Array<[PlatformRole, string | undefined]> = [
    ['owner', process.env.NEXT_PUBLIC_OWNER_PHONES],
    ['ops', process.env.NEXT_PUBLIC_OPS_PHONES],
    ['compliance', process.env.NEXT_PUBLIC_COMPLIANCE_PHONES],
    ['finance', process.env.NEXT_PUBLIC_FINANCE_PHONES],
    ['partner_lab', process.env.NEXT_PUBLIC_PARTNER_LAB_PHONES],
  ]

  return mappings
    .filter(([, value]) => parsePhoneList(value).has(phone))
    .map(([role]) => role)
}

function getBootstrapLabIds(phone: string | null) {
  if (!phone || !parsePhoneList(process.env.NEXT_PUBLIC_PARTNER_LAB_PHONES).has(phone)) {
    return []
  }

  return (process.env.NEXT_PUBLIC_PARTNER_LAB_IDS ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
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

export function getPartnerDocumentBucket() {
  return process.env.PARTNER_DOCUMENTS_BUCKET || 'partner-documents'
}

export type SchemaColumn = {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
}

export async function getTableSchema(
  tableName: string,
  serviceClient = createServiceRoleClient()
): Promise<SchemaColumn[]> {
  const { data, error } = await serviceClient
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .eq('table_name', tableName)
    .order('ordinal_position', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []) as SchemaColumn[]
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
  const phone = normalizePhone(user.phone)

  const roles = dedupeRoles([
    ...(staff?.roles ?? []),
    ...(staff?.primary_role ? [staff.primary_role] : []),
    ...memberships.map((membership) => membership.role),
    ...getBootstrapRoles(phone),
  ])

  const primaryRole = staff?.primary_role ?? roles[0] ?? null

  return {
    userId: user.id,
    phone: staff?.phone ?? phone,
    roles,
    primaryRole,
    scopedLabIds: Array.from(new Set([...memberships.map((membership) => membership.lab_id), ...getBootstrapLabIds(phone)])),
    displayName: staff?.display_name ?? 'Platform User',
  }
}

export function createPlatformServiceClient() {
  return createServiceRoleClient()
}

export async function findAuthUserByPhone(
  phone: string,
  serviceClient = createServiceRoleClient()
): Promise<User | null> {
  const normalizedPhone = normalizePhone(phone)
  if (!normalizedPhone) {
    return null
  }

  let page = 1
  const perPage = 200

  while (true) {
    const {
      data: { users },
      error,
    } = await serviceClient.auth.admin.listUsers({
      page,
      perPage,
    })

    if (error) {
      throw new Error(error.message)
    }

    const match = users.find((user) => normalizePhone(user.phone) === normalizedPhone)
    if (match) {
      return match
    }

    if (users.length < perPage) {
      return null
    }

    page += 1
  }
}

export function hasRequiredRole(profile: RoleProfile | null, allowedRoles: PlatformRole[]) {
  if (!profile) {
    return false
  }

  return allowedRoles.some((role) => profile.roles.includes(role))
}

export async function requireServerRoleProfile(request: NextRequest, allowedRoles: PlatformRole[]) {
  const profile = await resolveServerRoleProfile(request)

  if (!profile) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Unauthenticated' }, { status: 401 }),
    }
  }

  if (!hasRequiredRole(profile, allowedRoles)) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    }
  }

  return {
    ok: true as const,
    profile,
    serviceClient: createServiceRoleClient(),
  }
}
