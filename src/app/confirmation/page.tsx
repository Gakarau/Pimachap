'use client'
import { useCart } from '@/lib/cart-context'
import { useBooking } from '@/lib/booking-context'
import Link from 'next/link'

export default function ConfirmationPage() {
  const { cart } = useCart()
  const { selectedLab, schedule, orderNumber } = useBooking()

  if (!orderNumber || !selectedLab || !schedule) {
    return (
      <div className="animate-fade-up p-10 text-center">
        <div className="text-5xl mb-4">📋</div>
        <div className="text-lg font-extrabold mb-2">No active order</div>
        <Link href="/" className="no-underline"><button className="btn btn-teal">Go Home →</button></Link>
      </div>
    )
  }

  const riderFee = 300
  const grandTotal = selectedLab.total_price + riderFee

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <div className="animate-fade-up min-h-screen">
      {/* Hero */}
      <div className="text-center py-10 px-5"
           style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 100%)' }}>
        <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl mx-auto mb-4">
          ✓
        </div>
        <div className="text-2xl font-extrabold text-white mb-2">Booking Confirmed!</div>
        <div className="text-[13px] text-white/70 leading-relaxed mb-3">
          Phlebotomist arriving {formatDate(schedule.date)}<br />
          {schedule.timeSlotLabel} · {selectedLab.name}
        </div>
        <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-[12px] font-bold text-white tracking-wider">
          {orderNumber}
        </div>
      </div>

      <div className="px-5 pb-10">
        {/* Rider card */}
        <div className="card mt-5">
          <div className="flex gap-3 items-center mb-3">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0"
                 style={{ background: 'var(--teal-pale)', border: '2px solid var(--teal)' }}>
              🏍️
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-extrabold">Rider Assignment</div>
              <div className="text-[12px] text-[var(--text-soft)]">Phlebotomist will be assigned shortly</div>
              <div className="text-[11px] text-[var(--amber)] font-bold mt-0.5">★ KMLTTB Certified</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-[var(--teal)] flex items-center justify-center text-lg cursor-pointer">📞</div>
          </div>
          <div className="flex justify-between rounded-xl p-3" style={{ background: 'var(--teal-pale)' }}>
            <div>
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Arriving</div>
              <div className="text-sm font-extrabold text-[var(--teal)]">{schedule.timeSlotLabel.split(' - ')[0] || schedule.timeSlotLabel}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Delivering to</div>
              <div className="text-sm font-extrabold">{selectedLab.name}</div>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="card">
          <div className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-lg">🧪</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Tests</div>
              <div className="text-[13px] font-bold">{cart.map(t => t.name).join(', ')}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-lg">🏥</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Lab</div>
              <div className="text-[13px] font-bold">{selectedLab.name} · {selectedLab.town}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-lg">📍</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Collection at</div>
              <div className="text-[13px] font-bold">{schedule.addressLine}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start py-2.5">
            <span className="text-lg">💳</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Payment</div>
              <div className="text-[13px] font-bold">KES {grandTotal.toLocaleString()} · M-Pesa ✓ Confirmed</div>
            </div>
          </div>
        </div>

        {/* Turnaround notice */}
        <div className="rounded-[var(--rsm)] p-3 flex gap-2.5 mb-5"
             style={{ background: 'var(--green-pale)', border: '1.5px solid #A7F3D0' }}>
          <span className="text-base">⏱️</span>
          <p className="text-[12px] leading-relaxed" style={{ color: '#065F46' }}>
            Results expected within {selectedLab.turnaround_hours} hours after sample reaches the lab. We&apos;ll send them to your chosen channels.
          </p>
        </div>

        <Link href="/" className="no-underline block">
          <button className="btn btn-teal mb-2.5">🏠 Back to Home</button>
        </Link>
        <Link href="/search" className="no-underline block">
          <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}>Book another test</button>
        </Link>
      </div>
    </div>
  )
}
