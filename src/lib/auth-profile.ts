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

function normalizePhone(value: string | null | undefined) {
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

export function buildRoleProfile(user: User): RoleProfile {
  const appMeta = (user.app_metadata ?? {}) as Metadata
  const userMeta = (user.user_metadata ?? {}) as Metadata

  const phone = normalizePhone(user.phone)
  const metadataRoles = [
    ...parseRoleList(appMeta.roles),
    ...parseRoleList(userMeta.roles),
    ...(typeof appMeta.platform_role === 'string' && isPlatformRole(appMeta.platform_role) ? [appMeta.platform_role] : []),
    ...(typeof userMeta.platform_role === 'string' && isPlatformRole(userMeta.platform_role) ? [userMeta.platform_role] : []),
    ...getBootstrapRoles(phone),
  ]

  const roles = dedupeRoles(metadataRoles)
  const scopedLabIds = Array.from(
    new Set([
      ...parseLabIds(appMeta.lab_ids),
      ...parseLabIds(userMeta.lab_ids),
      ...getBootstrapLabIds(phone),
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
