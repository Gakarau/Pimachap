'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import { getHomeRoute, hasAnyRole, type PlatformRole } from '@/lib/rbac'
import { useRoleProfile } from '@/lib/use-role-profile'

type ProtectedWorkspaceProps = {
  allowedRoles: PlatformRole[]
  children: (args: {
    phone: string | null
    scopedLabIds: string[]
    roles: PlatformRole[]
  }) => ReactNode
}

export default function ProtectedWorkspace({
  allowedRoles,
  children,
}: ProtectedWorkspaceProps) {
  const { loading, session, profile } = useRoleProfile()

  if (loading) {
    return (
      <div className="min-h-screen px-4 py-10 md:px-8">
        <div className="rounded-[28px] border bg-white p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
          <div className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
            Checking access...
          </div>
        </div>
      </div>
    )
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen px-4 py-10 md:px-8">
        <div className="rounded-[28px] border bg-white p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
          <h1 className="text-[24px] font-extrabold" style={{ color: 'var(--text)' }}>
            Sign in required
          </h1>
          <p className="mt-3 text-[14px] leading-6" style={{ color: 'var(--text-mid)' }}>
            This workspace is only available to authenticated staff or approved partner users.
          </p>
          <div className="mt-5">
            <Link href="/login" className="btn btn-teal inline-block no-underline text-center">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!hasAnyRole(profile, allowedRoles)) {
    return (
      <div className="min-h-screen px-4 py-10 md:px-8">
        <div className="rounded-[28px] border bg-white p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
          <h1 className="text-[24px] font-extrabold" style={{ color: 'var(--text)' }}>
            Access denied
          </h1>
          <p className="mt-3 text-[14px] leading-6" style={{ color: 'var(--text-mid)' }}>
            Your current account is signed in, but it does not have permission for this workspace.
          </p>
          <p className="mt-2 text-[13px]" style={{ color: 'var(--text-soft)' }}>
            Active roles: {profile.roles.length > 0 ? profile.roles.join(', ') : 'none assigned'}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={getHomeRoute(profile)} className="btn btn-teal inline-block no-underline text-center">
              Go to my workspace
            </Link>
            <Link href="/" className="btn inline-block no-underline text-center" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}>
              Back home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return children({
    phone: profile.phone,
    scopedLabIds: profile.scopedLabIds,
    roles: profile.roles,
  })
}
