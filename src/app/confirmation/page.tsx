'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { useBooking } from '@/lib/booking-context'
import Link from 'next/link'

interface VerifiedOrder {
  id: string
  order_number: string
  status: string
  total_amount_kes: number
  booking_metadata: {
    selectedLab?: { name: string; town: string; turnaround_hours: number; rating: number }
    schedule?: { date: string; timeSlotLabel: string; addressLine: string }
    cart?: Array<{ name: string }>
  }
}

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const reference = searchParams.get('reference') ?? searchParams.get('trxref')

  const { cart, clearCart } = useCart()
  const { selectedLab, schedule, orderNumber, resetBooking } = useBooking()

  const [order, setOrder] = useState<VerifiedOrder | null>(null)
  const [verifying, setVerifying] = useState(!!reference)
  const [verifyError, setVerifyError] = useState('')

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  useEffect(() => {
    if (!reference) return

    async function verify() {
      try {
        const res = await fetch(`/api/payments/verify?reference=${encodeURIComponent(reference!)}`)
        const data = await res.json()
        if (!res.ok) {
          setVerifyError(data.error ?? 'Could not verify payment')
          setVerifying(false)
          return
        }
        setOrder(data.order)
        // Clear in-memory state now that order is persisted in DB
        clearCart()
        resetBooking()
      } catch {
        setVerifyError('Could not reach the server. Your payment may still have gone through — check your M-Pesa SMS.')
      } finally {
        setVerifying(false)
      }
    }

    verify()
  }, [reference]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Verification loading state ───────────────────────────────────────────
  if (verifying) {
    return (
      <div className="animate-fade-up p-10 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="text-5xl mb-4 animate-pulse">💳</div>
        <div className="text-lg font-extrabold mb-2">Confirming your payment...</div>
        <div className="text-sm text-[var(--text-soft)]">Please wait, do not close this page</div>
      </div>
    )
  }

  // ── Verification error ───────────────────────────────────────────────────
  if (verifyError) {
    return (
      <div className="animate-fade-up p-10 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="text-5xl mb-4">⚠️</div>
        <div className="text-lg font-extrabold mb-2">Payment verification issue</div>
        <p className="text-sm text-[var(--text-soft)] mb-6 max-w-xs">{verifyError}</p>
        <Link href="/" className="btn btn-teal block text-center no-underline">Go Home</Link>
      </div>
    )
  }

  // ── Derive display data from verified DB order or booking context ─────────
  const displayOrderNumber = order?.order_number ?? orderNumber
  const displayTotal = order?.total_amount_kes ?? (selectedLab ? selectedLab.total_price + 300 : 0)
  const displayLab = order?.booking_metadata?.selectedLab ?? selectedLab
  const displaySchedule = order?.booking_metadata?.schedule ?? schedule
  const displayCart = order?.booking_metadata?.cart ?? cart

  if (!displayOrderNumber || !displayLab || !displaySchedule) {
    return (
      <div className="animate-fade-up p-10 text-center">
        <div className="text-5xl mb-4">📋</div>
        <div className="text-lg font-extrabold mb-2">No active order</div>
        <Link href="/" className="btn btn-teal block text-center no-underline">Go Home →</Link>
      </div>
    )
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
          Phlebotomist arriving {formatDate(displaySchedule.date)}<br />
          {displaySchedule.timeSlotLabel} · {displayLab.name}
        </div>
        <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-[12px] font-bold text-white tracking-wider">
          {displayOrderNumber}
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
          </div>
          <div className="flex justify-between rounded-xl p-3" style={{ background: 'var(--teal-pale)' }}>
            <div>
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Arriving</div>
              <div className="text-sm font-extrabold text-[var(--teal)]">{displaySchedule.timeSlotLabel.split(' - ')[0] || displaySchedule.timeSlotLabel}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Delivering to</div>
              <div className="text-sm font-extrabold">{displayLab.name}</div>
            </div>
          </div>
        </div>

        {/* Order details */}
        <div className="card">
          <div className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-lg">🧪</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Tests</div>
              <div className="text-[13px] font-bold">{displayCart.map((t) => t.name).join(', ')}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-lg">🏥</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Lab</div>
              <div className="text-[13px] font-bold">{displayLab.name} · {displayLab.town}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-lg">📍</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Collection at</div>
              <div className="text-[13px] font-bold">{displaySchedule.addressLine}</div>
            </div>
          </div>
          <div className="flex gap-2.5 items-start py-2.5">
            <span className="text-lg">💳</span>
            <div className="flex-1">
              <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">Payment</div>
              <div className="text-[13px] font-bold">KES {displayTotal.toLocaleString()} · Paystack ✓ Confirmed</div>
            </div>
          </div>
        </div>

        {/* Turnaround notice */}
        {'turnaround_hours' in displayLab && displayLab.turnaround_hours ? (
          <div className="rounded-[var(--rsm)] p-3 flex gap-2.5 mb-5"
               style={{ background: 'var(--green-pale)', border: '1.5px solid #A7F3D0' }}>
            <span className="text-base">⏱️</span>
            <p className="text-[12px] leading-relaxed" style={{ color: '#065F46' }}>
              Results expected within {displayLab.turnaround_hours} hours after sample reaches the lab. We&apos;ll send them to your chosen channels.
            </p>
          </div>
        ) : null}

        <Link href="/" className="btn btn-teal block text-center no-underline mb-2.5">🏠 Back to Home</Link>
        <Link href="/search" className="btn block text-center no-underline"
              style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}>
          Book another test
        </Link>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="animate-fade-up p-10 text-center min-h-screen flex flex-col items-center justify-center">
        <div className="text-5xl mb-4 animate-pulse">💳</div>
        <div className="text-lg font-extrabold">Loading confirmation...</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
