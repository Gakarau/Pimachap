'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import ThemeToggle from '@/components/ThemeToggle'
import { ROLE_HOME, ROLE_LABELS, type PlatformRole } from '@/lib/rbac'

type RoleWorkspaceProps = {
  role: PlatformRole
  title: string
  subtitle: string
  children: ReactNode
}

export default function RoleWorkspace({
  role,
  title,
  subtitle,
  children,
}: RoleWorkspaceProps) {
  const navItems = (Object.entries(ROLE_HOME) as Array<[PlatformRole, string]>).map(([navRole, href]) => ({
    role: navRole,
    href,
    label: ROLE_LABELS[navRole],
  }))

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--white) 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <div className="overflow-hidden rounded-[32px] border" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh-lg)' }}>
          <div
            className="px-5 py-6 md:px-8 md:py-8"
            style={{ background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 55%, var(--teal-light) 100%)' }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80" style={{ borderColor: 'rgba(255,255,255,0.28)' }}>
                  {ROLE_LABELS[role]} Workspace
                </div>
                <h1 className="mt-4 text-[32px] font-extrabold leading-tight text-white md:text-[44px]">
                  {title}
                </h1>
                <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/75 md:text-[15px]">
                  {subtitle}
                </p>
              </div>

              <div className="flex items-center gap-3 self-start">
                <ThemeToggle variant="header" />
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 text-[13px] font-bold no-underline"
                  style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.26)' }}
                >
                  Back to Storefront
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = item.role === role
                return (
                  <Link
                    key={item.role}
                    href={item.href}
                    className="rounded-full px-4 py-2 text-[13px] font-bold no-underline"
                    style={{
                      background: active ? 'rgba(255,255,255,0.96)' : 'rgba(255,255,255,0.14)',
                      color: active ? 'var(--teal-dark)' : '#fff',
                      border: active ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  )
}
