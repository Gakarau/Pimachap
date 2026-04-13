'use client'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

const tabs = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/search', icon: '🔍', label: 'Search' },
  { href: '/ready-sample', icon: '📦', label: 'Sample' },
  { href: '/track', icon: '📍', label: 'Track' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t-[1.5px] border-[var(--border)] flex py-2.5 pb-5 z-[100]"
         style={{ boxShadow: '0 -4px 20px rgba(0,0,0,.06)' }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <Link key={tab.href} href={tab.href}
                className="flex-1 flex flex-col items-center gap-1 no-underline">
            <span className="text-[22px]">{tab.icon}</span>
            <span className={`text-[10px] font-semibold ${active ? 'text-[var(--teal)]' : 'text-[var(--text-soft)]'}`}>
              {tab.label}
            </span>
            {active && <div className="w-1 h-1 rounded-full bg-[var(--teal)]" />}
          </Link>
        )
      })}
    </nav>
  )
}
