'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useBooking } from '@/lib/booking-context'

interface OrderStep {
  label: string
  desc: string
  icon: string
  done: boolean
  active: boolean
}

const MOCK_ORDERS = [
  {
    orderNumber: 'PCH-260413-042',
    status: 'in_transit',
    tests: ['Full Blood Count', 'Lipid Profile'],
    lab: 'Lancet Kenya – Westlands',
    date: '2026-04-14',
    timeSlot: '8:00 AM – 10:00 AM',
    address: 'Kamakis, Eastern Bypass',
    total: 4800,
    riderName: 'James M.',
    riderPhone: '+254 712 000 123',
    turnaround_hours: 24,
  },
  {
    orderNumber: 'PCH-260410-017',
    status: 'completed',
    tests: ['HbA1c', 'Fasting Blood Sugar'],
    lab: 'PathCare – Karen',
    date: '2026-04-10',
    timeSlot: '7:00 AM – 9:00 AM',
    address: 'Karen, Ngong Road',
    total: 3200,
    riderName: 'Peter K.',
    riderPhone: '+254 722 000 456',
    turnaround_hours: 6,
  },
]

const STATUS_STEPS: Record<string, OrderStep[]> = {
  booked: [
    { label: 'Booking Confirmed', desc: 'Your order was received', icon: '✓', done: true, active: false },
    { label: 'Rider Assigned', desc: 'Phlebotomist being matched', icon: '🏍️', done: false, active: true },
    { label: 'Sample Collected', desc: 'At your location', icon: '🩸', done: false, active: false },
    { label: 'At Lab', desc: 'Sample processing', icon: '🏥', done: false, active: false },
    { label: 'Results Ready', desc: 'Sent to your channels', icon: '📋', done: false, active: false },
  ],
  in_transit: [
    { label: 'Booking Confirmed', desc: 'Your order was received', icon: '✓', done: true, active: false },
    { label: 'Rider Assigned', desc: 'James M. on the way', icon: '🏍️', done: true, active: false },
    { label: 'Sample Collected', desc: 'Rider en route to lab', icon: '🩸', done: true, active: false },
    { label: 'At Lab', desc: 'Processing your sample', icon: '🏥', done: false, active: true },
    { label: 'Results Ready', desc: 'Sent to your channels', icon: '📋', done: false, active: false },
  ],
  completed: [
    { label: 'Booking Confirmed', desc: 'Order received', icon: '✓', done: true, active: false },
    { label: 'Rider Assigned', desc: 'Completed', icon: '🏍️', done: true, active: false },
    { label: 'Sample Collected', desc: 'Completed', icon: '🩸', done: true, active: false },
    { label: 'At Lab', desc: 'Completed', icon: '🏥', done: true, active: false },
    { label: 'Results Ready', desc: 'Sent via WhatsApp & Email', icon: '📋', done: true, active: false },
  ],
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  booked:     { label: 'Confirmed',     color: 'var(--teal)',   bg: 'var(--teal-pale)' },
  in_transit: { label: 'In Progress',   color: 'var(--amber)',  bg: 'var(--amber-light)' },
  completed:  { label: 'Results Ready', color: 'var(--green)',  bg: 'var(--green-pale)' },
}

export default function TrackPage() {
  const { orderNumber: contextOrderNumber } = useBooking()
  const [inputVal, setInputVal] = useState(contextOrderNumber || '')
  const [searched, setSearched] = useState(!!contextOrderNumber)
  const [activeOrder, setActiveOrder] = useState(
    contextOrderNumber ? MOCK_ORDERS.find(o => o.orderNumber === contextOrderNumber) || MOCK_ORDERS[0] : null
  )

  const handleSearch = () => {
    if (!inputVal.trim()) return
    const found = MOCK_ORDERS.find(o =>
      o.orderNumber.toLowerCase() === inputVal.trim().toLowerCase()
    )
    setActiveOrder(found || MOCK_ORDERS[0]) // fallback to first mock for demo
    setSearched(true)
  }

  const steps = activeOrder ? STATUS_STEPS[activeOrder.status] : []
  const statusMeta = activeOrder ? STATUS_LABEL[activeOrder.status] : null

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="animate-fade-up min-h-screen">
      {/* Header */}
      <div style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 100%)', padding: '16px 20px 24px' }}>
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline"
                style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>
            ←
          </Link>
          <div className="logo-text text-white" style={{ color: '#fff', fontSize: '18px' }}>
            PIMA<span style={{ color: 'var(--amber)' }}>CHAP</span>
          </div>
          <div className="w-[38px]" />
        </div>

        <div className="text-[20px] font-extrabold text-white mb-1">Track your order</div>
        <div className="text-[12px] text-white/60 mb-4">Enter your order number to see live status</div>

        {/* Search bar */}
        <div className="flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="PCH-260413-042"
            className="flex-1 p-3.5 rounded-[var(--rsm)] border-none text-[14px] font-bold text-[var(--text)] outline-none"
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', background: 'rgba(255,255,255,.95)', letterSpacing: '0.05em' }}
          />
          <button onClick={handleSearch}
                  className="px-5 py-3 rounded-[var(--rsm)] text-[13px] font-extrabold border-none cursor-pointer"
                  style={{ background: 'var(--amber)', color: 'var(--teal-dark)' }}>
            Track →
          </button>
        </div>
      </div>

      <div className="px-5 pb-28">
        {/* Recent orders quick-pick */}
        {!searched && (
          <div className="mt-5">
            <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-3">Recent orders</div>
            {MOCK_ORDERS.map(order => {
              const meta = STATUS_LABEL[order.status]
              return (
                <div key={order.orderNumber}
                     className="card cursor-pointer hover:border-[var(--teal)] transition-colors"
                     style={{ marginBottom: '10px' }}
                     onClick={() => { setInputVal(order.orderNumber); setActiveOrder(order); setSearched(true) }}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[13px] font-extrabold">{order.orderNumber}</div>
                      <div className="text-[11px] text-[var(--text-soft)] mt-0.5">{formatDate(order.date)} · {order.lab}</div>
                    </div>
                    <span className="tag" style={{ background: meta.bg, color: meta.color }}>{meta.label}</span>
                  </div>
                  <div className="text-[12px] text-[var(--text-mid)]">{order.tests.join(', ')}</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Order detail */}
        {searched && activeOrder && statusMeta && (
          <div className="mt-5">
            {/* Status banner */}
            <div className="rounded-[var(--r)] p-4 mb-4 flex items-center gap-3"
                 style={{ background: statusMeta.bg, border: `1.5px solid ${statusMeta.color}` }}>
              <div className="text-2xl">
                {activeOrder.status === 'completed' ? '🎉' : activeOrder.status === 'in_transit' ? '🔬' : '✅'}
              </div>
              <div className="flex-1">
                <div className="text-sm font-extrabold" style={{ color: statusMeta.color }}>{statusMeta.label}</div>
                <div className="text-[11px] text-[var(--text-mid)] mt-0.5">
                  {activeOrder.status === 'completed'
                    ? 'Results sent to your WhatsApp & email'
                    : activeOrder.status === 'in_transit'
                    ? 'Sample at lab — results in ~' + activeOrder.turnaround_hours + 'h'
                    : 'Rider will arrive at your scheduled time'}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="card mb-3">
              <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-4">Order Timeline</div>
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3 mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                         style={{
                           background: step.done ? 'var(--teal)' : step.active ? 'var(--amber-light)' : 'var(--bg)',
                           border: step.active ? '2px solid var(--amber)' : step.done ? 'none' : '2px solid var(--border)',
                           color: step.done ? '#fff' : step.active ? 'var(--amber)' : 'var(--text-soft)',
                         }}>
                      {step.done ? '✓' : step.icon}
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-0.5 h-8 mt-0.5"
                           style={{ background: step.done ? 'var(--teal)' : 'var(--border)' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="text-[13px] font-extrabold" style={{ color: step.active ? 'var(--amber)' : step.done ? 'var(--text)' : 'var(--text-soft)' }}>
                      {step.label}
                      {step.active && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse"
                                            style={{ background: 'var(--amber-light)', color: 'var(--amber)' }}>Live</span>}
                    </div>
                    <div className="text-[11px] mt-0.5" style={{ color: step.done || step.active ? 'var(--text-soft)' : 'var(--border)' }}>
                      {step.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Rider card */}
            {activeOrder.status !== 'completed' && (
              <div className="card mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                       style={{ background: 'var(--teal-pale)', border: '2px solid var(--teal)' }}>
                    🏍️
                  </div>
                  <div className="flex-1">
                    <div className="text-[15px] font-extrabold">{activeOrder.riderName}</div>
                    <div className="text-[11px] text-[var(--text-soft)]">KMLTTB Certified Phlebotomist</div>
                    <div className="text-[11px] text-[var(--amber)] font-bold mt-0.5">★ 4.9 · 312 collections</div>
                  </div>
                  <a href={`tel:${activeOrder.riderPhone}`}
                     className="w-10 h-10 rounded-full flex items-center justify-center text-lg no-underline"
                     style={{ background: 'var(--teal)', color: '#fff' }}>
                    📞
                  </a>
                </div>
              </div>
            )}

            {/* Order details */}
            <div className="card mb-3">
              <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-3">Order Details</div>
              {[
                { icon: '🔖', label: 'Order No.', value: activeOrder.orderNumber },
                { icon: '🧪', label: 'Tests', value: activeOrder.tests.join(', ') },
                { icon: '🏥', label: 'Lab', value: activeOrder.lab },
                { icon: '📅', label: 'Scheduled', value: `${formatDate(activeOrder.date)} · ${activeOrder.timeSlot}` },
                { icon: '📍', label: 'Collection', value: activeOrder.address },
                { icon: '💳', label: 'Total Paid', value: `KES ${activeOrder.total.toLocaleString()}` },
              ].map(row => (
                <div key={row.label} className="flex gap-2.5 py-2 border-b border-[var(--border)] last:border-none">
                  <span className="text-base">{row.icon}</span>
                  <div className="flex-1">
                    <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">{row.label}</div>
                    <div className="text-[13px] font-bold mt-0.5">{row.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results notice */}
            {activeOrder.status === 'completed' && (
              <div className="rounded-[var(--r)] p-4 mb-4"
                   style={{ background: 'var(--green-pale)', border: '1.5px solid #A7F3D0' }}>
                <div className="text-sm font-extrabold mb-1" style={{ color: '#065F46' }}>📋 Results delivered</div>
                <div className="text-[12px] leading-relaxed" style={{ color: '#065F46' }}>
                  Your results PDF was sent via WhatsApp and email. Check your messages. For queries, contact us on WhatsApp.
                </div>
              </div>
            )}

            <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}
                    onClick={() => { setSearched(false); setActiveOrder(null); setInputVal('') }}>
              ← Search another order
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
