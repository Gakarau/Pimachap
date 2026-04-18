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
  const roles = dedupeRoles(metadataRoles)
  const scopedLabIds = Array.from(
    new Set([
      ...parseLabIds(appMeta.lab_ids),
      ...parseLabIds(userMeta.lab_ids),
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
