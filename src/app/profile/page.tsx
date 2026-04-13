'use client'
import { useState } from 'react'
import Link from 'next/link'

const MOCK_ORDERS = [
  {
    orderNumber: 'PCH-260413-042',
    status: 'in_transit',
    tests: ['Full Blood Count', 'Lipid Profile'],
    lab: 'Lancet Kenya – Westlands',
    date: '2026-04-14',
    total: 4800,
  },
  {
    orderNumber: 'PCH-260410-017',
    status: 'completed',
    tests: ['HbA1c', 'Fasting Blood Sugar'],
    lab: 'PathCare – Karen',
    date: '2026-04-10',
    total: 3200,
  },
  {
    orderNumber: 'PCH-260401-008',
    status: 'completed',
    tests: ['Thyroid Function (TSH)'],
    lab: 'Aga Khan Diagnostics – Parklands',
    date: '2026-04-01',
    total: 2100,
  },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  in_transit: { label: 'In Progress', color: 'var(--amber)', bg: 'var(--amber-light)' },
  completed:  { label: 'Completed',   color: 'var(--green)', bg: 'var(--green-pale)' },
  booked:     { label: 'Confirmed',   color: 'var(--teal)',  bg: 'var(--teal-pale)' },
}

// Demo: treat as signed in for prototype
const IS_SIGNED_IN = true
const USER = { name: 'John Kamau', phone: '+254 712 345 678', location: 'Kamakis, Nairobi' }

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders')

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  if (!IS_SIGNED_IN) {
    return (
      <div className="animate-fade-up min-h-screen">
        <div className="text-center py-16 px-5"
             style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 100%)', borderRadius: '0 0 32px 32px' }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-4xl mx-auto mb-4">
            👤
          </div>
          <div className="text-xl font-extrabold text-white mb-1">Sign in to continue</div>
          <div className="text-[12px] text-white/50">Manage orders, save addresses, track results</div>
        </div>
        <div className="px-5 pt-6">
          <Link href="/login" className="no-underline">
            <button className="btn btn-teal">Sign In with Phone →</button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up min-h-screen">
      {/* Hero */}
      <div className="pb-6"
           style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 100%)', borderRadius: '0 0 32px 32px' }}>
        <div className="flex items-center justify-between px-5 pt-4 mb-5">
          <div className="logo-text text-white" style={{ color: '#fff' }}>PIMA<span style={{ color: 'var(--amber)' }}>CHAP</span></div>
          <button className="text-[12px] font-bold px-3 py-1.5 rounded-full border-none cursor-pointer"
                  style={{ background: 'rgba(255,255,255,.15)', color: '#fff' }}>
            Sign out
          </button>
        </div>

        <div className="px-5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shrink-0"
               style={{ background: 'rgba(255,255,255,.2)', border: '2px solid rgba(255,255,255,.4)' }}>
            👤
          </div>
          <div>
            <div className="text-[18px] font-extrabold text-white">{USER.name}</div>
            <div className="text-[12px] text-white/60 mt-0.5">{USER.phone}</div>
            <div className="text-[11px] text-white/50 mt-0.5">📍 {USER.location}</div>
          </div>
        </div>

        {/* Stats row */}
        <div className="mx-5 mt-5 grid grid-cols-3 gap-2">
          {[
            { value: MOCK_ORDERS.length, label: 'Total Orders' },
            { value: MOCK_ORDERS.filter(o => o.status === 'completed').length, label: 'Completed' },
            { value: `KES ${(MOCK_ORDERS.reduce((s, o) => s + o.total, 0) / 1000).toFixed(1)}k`, label: 'Spent' },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl p-3 text-center"
                 style={{ background: 'rgba(255,255,255,.15)' }}>
              <div className="text-[18px] font-extrabold text-white">{stat.value}</div>
              <div className="text-[10px] text-white/60 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="mx-5 mt-4 flex gap-2 mb-4">
        {(['orders', 'settings'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
                  className="flex-1 py-2.5 rounded-full text-[13px] font-bold border-none cursor-pointer capitalize transition-all"
                  style={{
                    background: activeTab === tab ? 'var(--teal)' : 'var(--white)',
                    color: activeTab === tab ? '#fff' : 'var(--text-mid)',
                    border: activeTab === tab ? 'none' : '1.5px solid var(--border)',
                    boxShadow: activeTab === tab ? '0 4px 14px rgba(13,115,119,.25)' : 'var(--sh)',
                  }}>
            {tab === 'orders' ? '📋 My Orders' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      <div className="px-5 pb-28">
        {activeTab === 'orders' && (
          <>
            <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-3">
              {MOCK_ORDERS.length} orders
            </div>

            {MOCK_ORDERS.map(order => {
              const meta = STATUS_META[order.status]
              return (
                <Link key={order.orderNumber} href={`/track`}
                      className="no-underline block card mb-3 cursor-pointer hover:border-[var(--teal)] transition-colors"
                      style={{ textDecoration: 'none' }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[13px] font-extrabold text-[var(--text)]">{order.orderNumber}</div>
                      <div className="text-[11px] text-[var(--text-soft)] mt-0.5">{formatDate(order.date)} · {order.lab}</div>
                    </div>
                    <span className="tag" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <div className="text-[12px] text-[var(--text-mid)] mb-2.5">{order.tests.join(', ')}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-[13px] font-extrabold text-[var(--teal)]">KES {order.total.toLocaleString()}</span>
                    <span className="text-[12px] font-bold text-[var(--teal)]">
                      {order.status === 'completed' ? 'View results →' : 'Track →'}
                    </span>
                  </div>
                </Link>
              )
            })}

            <Link href="/search" className="no-underline">
              <button className="btn btn-teal mt-2">+ Book another test</button>
            </Link>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {/* Personal info */}
            <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-3">Personal Info</div>
            <div className="card mb-4">
              {[
                { icon: '👤', label: 'Full Name', value: USER.name },
                { icon: '📱', label: 'Phone Number', value: USER.phone },
                { icon: '📍', label: 'Default Location', value: USER.location },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-none">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{row.icon}</span>
                    <div>
                      <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">{row.label}</div>
                      <div className="text-[13px] font-bold">{row.value}</div>
                    </div>
                  </div>
                  <button className="text-[12px] font-bold text-[var(--teal)] border-none bg-transparent cursor-pointer">Edit</button>
                </div>
              ))}
            </div>

            {/* Notifications */}
            <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-3">Notifications</div>
            <div className="card mb-4">
              {[
                { icon: '💬', label: 'WhatsApp Updates', sub: 'Order status & results', on: true },
                { icon: '📧', label: 'Email Results', sub: 'PDF to your inbox', on: false },
                { icon: '🔔', label: 'Reminder alerts', sub: 'Fasting prep reminders', on: true },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-none">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{row.icon}</span>
                    <div>
                      <div className="text-[13px] font-bold">{row.label}</div>
                      <div className="text-[11px] text-[var(--text-soft)]">{row.sub}</div>
                    </div>
                  </div>
                  <div className="w-10 h-6 rounded-full relative cursor-pointer"
                       style={{ background: row.on ? 'var(--teal)' : 'var(--border)' }}>
                    <div className="w-4 h-4 rounded-full bg-white absolute top-1 transition-all"
                         style={{ left: row.on ? '22px' : '2px', boxShadow: '0 1px 4px rgba(0,0,0,.2)' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Support */}
            <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-3">Support</div>
            <div className="card mb-4">
              {[
                { icon: '💬', label: 'WhatsApp Support', action: 'Chat →' },
                { icon: '📞', label: 'Call us', action: 'Call →' },
                { icon: '❓', label: 'FAQ', action: 'View →' },
                { icon: '⭐', label: 'Rate the app', action: 'Rate →' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-none cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{row.icon}</span>
                    <div className="text-[13px] font-bold">{row.label}</div>
                  </div>
                  <span className="text-[12px] font-bold text-[var(--teal)]">{row.action}</span>
                </div>
              ))}
            </div>

            <div className="text-center text-[11px] text-[var(--text-soft)] pb-4">
              PIMACHAP v1.0 · Nairobi, Kenya 🇰🇪
            </div>
          </>
        )}
      </div>
    </div>
  )
}
