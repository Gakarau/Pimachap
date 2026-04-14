'use client'
import { useTheme } from '@/lib/theme-context'

interface Props {
  /** 'header' = compact icon pill for desktop nav, 'row' = full settings row for profile */
  variant?: 'header' | 'row'
}

export default function ThemeToggle({ variant = 'header' }: Props) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  if (variant === 'row') {
    return (
      <div className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-none">
        <div className="flex items-center gap-2.5">
          <span className="text-base">{isDark ? '🌙' : '☀️'}</span>
          <div>
            <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
              {isDark ? 'Dark mode' : 'Light mode'}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-soft)' }}>
              {isDark ? 'Switch to light' : 'Switch to dark'}
            </div>
          </div>
        </div>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="w-10 h-6 rounded-full relative cursor-pointer border-none"
          style={{ background: isDark ? 'var(--teal)' : 'var(--border)' }}
        >
          <div
            className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
            style={{ left: isDark ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }}
          />
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="w-9 h-9 rounded-full flex items-center justify-center text-base border-none cursor-pointer transition-colors"
      style={{
        background: 'var(--bg)',
        border: '1.5px solid var(--border)',
        color: 'var(--text-mid)',
      }}
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
