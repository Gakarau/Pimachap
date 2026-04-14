'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import ThemeToggle from '@/components/ThemeToggle'
import BottomNav from '@/components/BottomNav'

type AppShellProps = {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const isWorkspaceRoute =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/ops') ||
    pathname.startsWith('/compliance') ||
    pathname.startsWith('/finance') ||
    pathname.startsWith('/partner')

  if (isWorkspaceRoute) {
    return children
  }

  return (
    <>
      <header className="hidden md:flex items-center justify-between px-8 py-4 bg-white border-b border-[var(--border)] sticky top-0 z-50">
        <div className="logo-text text-2xl">PIMA<span>CHAP</span></div>
        <nav className="flex items-center gap-8">
          <Link href="/" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors no-underline">Home</Link>
          <Link href="/search" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors no-underline">Book Tests</Link>
          <Link href="/ready-sample" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors no-underline">Ready Sample</Link>
          <Link href="/track" className="text-sm font-bold text-[var(--text-mid)] hover:text-[var(--teal)] transition-colors no-underline">Track Order</Link>
          <ThemeToggle variant="header" />
          <Link href="/login" className="px-5 py-2.5 bg-[var(--teal)] text-white text-sm font-bold rounded-full hover:bg-[var(--teal-dark)] transition-colors no-underline">
            Sign In
          </Link>
        </nav>
      </header>

      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-4 md:py-6 pb-24 md:pb-8">
        {children}
      </main>

      <BottomNav />
    </>
  )
}
