import type { User } from '@supabase/supabase-js'

import { PLATFORM_ROLES, ROLE_LABELS, type PlatformRole, type RoleProfile, isPlatformRole } from '@/lib/rbac'

type Metadata = Record<string, unknown>

function parseRoleList(value: unknown): PlatformRole[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is PlatformRole => typeof item === 'string' && isPlatformRole(item))
}

function parseLabIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
}

function parsePhoneEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function parseLabScopeEnv(name: string) {
  const value = process.env[name]
  if (!value) {
    return []
  }

  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
}

function getBootstrapRoles(phone: string | null): PlatformRole[] {
  if (!phone) {
    return []
  }

  const mappings: Array<[PlatformRole, string[]]> = [
    ['owner', parsePhoneEnv('NEXT_PUBLIC_OWNER_PHONES')],
    ['ops', parsePhoneEnv('NEXT_PUBLIC_OPS_PHONES')],
    ['compliance', parsePhoneEnv('NEXT_PUBLIC_COMPLIANCE_PHONES')],
    ['finance', parsePhoneEnv('NEXT_PUBLIC_FINANCE_PHONES')],
    ['partner_lab', parsePhoneEnv('NEXT_PUBLIC_PARTNER_LAB_PHONES')],
  ]

  return mappings
    .filter(([, phones]) => phones.includes(phone))
    .map(([role]) => role)
}

function dedupeRoles(roles: PlatformRole[]) {
  const seen = new Set<PlatformRole>()

  return roles.filter((role) => {
    if (seen.has(role)) {
      return false
    }

    seen.add(role)
    return true
  })
}

function getPrimaryRole(roles: PlatformRole[]) {
  return PLATFORM_ROLES.find((role) => roles.includes(role)) ?? null
}

export function buildRoleProfile(user: User): RoleProfile {
  const appMeta = (user.app_metadata ?? {}) as Metadata
  const userMeta = (user.user_metadata ?? {}) as Metadata

  const metadataRoles = [
    ...parseRoleList(appMeta.roles),
    ...parseRoleList(userMeta.roles),
    ...(typeof appMeta.platform_role === 'string' && isPlatformRole(appMeta.platform_role) ? [appMeta.platform_role] : []),
    ...(typeof userMeta.platform_role === 'string' && isPlatformRole(userMeta.platform_role) ? [userMeta.platform_role] : []),
  ]

  const phone = user.phone ?? null
  const roles = dedupeRoles([...metadataRoles, ...getBootstrapRoles(phone)])
  const scopedLabIds = Array.from(
    new Set([
      ...parseLabIds(appMeta.lab_ids),
      ...parseLabIds(userMeta.lab_ids),
      ...parseLabScopeEnv('NEXT_PUBLIC_PARTNER_LAB_IDS'),
    ])
  )
  const primaryRole = getPrimaryRole(roles)
  const displayName =
    typeof userMeta.full_name === 'string'
      ? userMeta.full_name
      : primaryRole
        ? ROLE_LABELS[primaryRole]
        : 'Platform User'

  return {
    userId: user.id,
    phone,
    roles,
    primaryRole,
    scopedLabIds,
    displayName,
  }
}
