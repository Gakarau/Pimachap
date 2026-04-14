export const PLATFORM_ROLES = [
  'owner',
  'ops',
  'compliance',
  'finance',
  'partner_lab',
] as const

export type PlatformRole = (typeof PLATFORM_ROLES)[number]

export type PlatformPermission =
  | 'view_executive_dashboard'
  | 'manage_partner_labs'
  | 'review_kyc'
  | 'review_payouts'
  | 'manage_partner_catalog'
  | 'view_partner_scope'

export type RoleProfile = {
  userId: string
  phone: string | null
  roles: PlatformRole[]
  primaryRole: PlatformRole | null
  scopedLabIds: string[]
  displayName: string
}

export const ROLE_LABELS: Record<PlatformRole, string> = {
  owner: 'Owner',
  ops: 'Operations',
  compliance: 'Compliance',
  finance: 'Finance',
  partner_lab: 'Partner Lab',
}

export const ROLE_HOME: Record<PlatformRole, string> = {
  owner: '/admin',
  ops: '/ops',
  compliance: '/compliance',
  finance: '/finance',
  partner_lab: '/partner',
}

export const ROLE_PERMISSIONS: Record<PlatformRole, PlatformPermission[]> = {
  owner: [
    'view_executive_dashboard',
    'manage_partner_labs',
    'review_kyc',
    'review_payouts',
    'manage_partner_catalog',
    'view_partner_scope',
  ],
  ops: ['manage_partner_labs', 'manage_partner_catalog', 'view_partner_scope'],
  compliance: ['review_kyc', 'view_partner_scope'],
  finance: ['review_payouts', 'view_partner_scope'],
  partner_lab: ['manage_partner_catalog', 'view_partner_scope'],
}

export function isPlatformRole(value: string): value is PlatformRole {
  return PLATFORM_ROLES.includes(value as PlatformRole)
}

export function hasAnyRole(profile: RoleProfile | null, allowedRoles: PlatformRole[]) {
  if (!profile) {
    return false
  }

  return allowedRoles.some((role) => profile.roles.includes(role))
}

export function getPermissions(profile: RoleProfile | null) {
  if (!profile) {
    return new Set<PlatformPermission>()
  }

  return new Set(profile.roles.flatMap((role) => ROLE_PERMISSIONS[role]))
}

export function getHomeRoute(profile: RoleProfile | null) {
  if (!profile?.primaryRole) {
    return '/'
  }

  return ROLE_HOME[profile.primaryRole]
}
