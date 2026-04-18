'use client'
import { useState } from 'react'
import { useCart } from '@/lib/cart-context'
import { useBooking } from '@/lib/booking-context'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

export default function PaymentPage() {
  const { cart } = useCart()
  const { selectedLab, schedule, delivery } = useBooking()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!selectedLab || !schedule) {
    return (
      <div className="animate-fade-up p-10 text-center">
        <div className="text-5xl mb-4">💳</div>
        <div className="text-lg font-extrabold mb-2">Missing booking details</div>
        <Link href="/search" className="btn btn-teal block text-center no-underline">Start over →</Link>
      </div>
    )
  }

  const riderFee = 300
  const grandTotal = selectedLab.total_price + riderFee

  const deliveryChannels = []
  if (delivery.whatsapp) deliveryChannels.push('WhatsApp')
  if (delivery.email) deliveryChannels.push('Email')
  if (delivery.doctor) deliveryChannels.push('Doctor')
  const deliverySummary = deliveryChannels.join(' + ') + ' · PDF'

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  const handlePay = async () => {
    setError('')
    setLoading(true)

    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      if (!token) {
        setError('Please sign in to complete your booking.')
        setLoading(false)
        return
      }

      const res = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cart, selectedLab, schedule, delivery }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Payment could not be started. Please try again.')
        setLoading(false)
        return
      }

      // Redirect to Paystack hosted checkout
      window.location.href = data.authorization_url
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-up min-h-screen">
      <div className="flex items-center justify-between px-5 pt-4 mb-1">
        <Link href="/delivery" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline bg-white border-[1.5px] border-[var(--border)]"
              style={{ boxShadow: 'var(--sh)' }}>←</Link>
        <div className="logo-text">PIMA<span>CHAP</span></div>
        <div className="w-[38px]" />
      </div>

      <div className="mx-5 mt-3 h-1 rounded-full bg-[var(--border)]">
        <div className="h-full rounded-full w-[90%]" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-light))' }} />
      </div>
      <div className="px-5 pt-1.5 text-[11px] font-semibold text-[var(--text-soft)] uppercase tracking-wider">Step 3 of 3 · Review &amp; Pay</div>

      <div className="px-5 pb-28">
        <h2 className="text-[22px] font-extrabold mt-5 mb-1">Order Summary</h2>
        <p className="text-[13px] text-[var(--text-soft)] mb-5">Phlebotomist booking · {selectedLab.name}</p>

        {/* Order details card */}
        <div className="card">
          <div className="flex justify-between items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-[13px] text-[var(--text-mid)]">🏥 Lab</span>
            <span className="text-[13px] font-bold text-right max-w-[60%]">{selectedLab.name} <span className="tag tag-green">★ {selectedLab.rating}</span></span>
          </div>
          <div className="flex justify-between items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-[13px] text-[var(--text-mid)]">🧪 Tests</span>
            <span className="text-[13px] font-bold text-right max-w-[60%]">{cart.map(t => t.name).join(', ')}</span>
          </div>
          <div className="flex justify-between items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-[13px] text-[var(--text-mid)]">📍 Collection</span>
            <span className="text-[13px] font-bold text-right max-w-[60%]">{schedule.addressLine}</span>
          </div>
          <div className="flex justify-between items-start py-2.5 border-b border-[var(--border)]">
            <span className="text-[13px] text-[var(--text-mid)]">📅 Date &amp; Time</span>
            <span className="text-[13px] font-bold text-right max-w-[60%]">{formatDate(schedule.date)} · {schedule.timeSlotLabel}</span>
          </div>
          <div className="flex justify-between items-start py-2.5">
            <span className="text-[13px] text-[var(--text-mid)]">📋 Results to</span>
            <span className="text-[13px] font-bold text-right max-w-[60%]">{deliverySummary}</span>
          </div>
        </div>

        {/* Pricing card */}
        <div className="card" style={{ padding: '14px 16px' }}>
          {cart.map(t => (
            <div key={t.id} className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
              <span className="text-[var(--text-mid)]">{t.name}</span>
              <span className="font-bold">incl.</span>
            </div>
          ))}
          <div className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
            <span className="text-[var(--text-mid)]">Lab test fees</span>
            <span className="font-bold">KES {selectedLab.total_price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
            <span className="text-[var(--text-mid)]">🏍 Phlebotomist rider</span>
            <span className="font-bold">KES {riderFee.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1.5 text-[13px]">
            <span className="text-[var(--text-mid)]">Platform fee</span>
            <span className="font-bold">KES 0 <span className="tag tag-green">Free</span></span>
          </div>

          <div className="border-t-2 border-[var(--border)] mt-2 pt-3 flex justify-between items-center rounded-xl p-3 mt-3"
               style={{ background: 'var(--teal-pale)' }}>
            <span className="text-sm font-extrabold">Total</span>
            <span className="text-2xl font-extrabold text-[var(--teal)]">KES {grandTotal.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="rounded-[var(--r)] overflow-hidden border-[1.5px] border-[var(--teal)] mb-4">
          <div className="text-white text-[10px] font-bold tracking-wider px-3.5 py-1.5 uppercase"
               style={{ background: 'var(--teal)' }}>Secure Payment</div>
          <div className="bg-white p-4">
            <div className="text-[15px] font-extrabold mb-1">Pay KES {grandTotal.toLocaleString()}</div>
            <div className="text-[12px] text-[var(--text-soft)] mb-3">
              M-Pesa · Card · Bank transfer — choose on the next screen
            </div>
            <div className="flex gap-2 flex-wrap">
              {['M-Pesa', 'Visa', 'Mastercard', 'Bank'].map(method => (
                <span key={method} className="tag tag-green text-[11px]">{method}</span>
              ))}
            </div>
          </div>
        </div>

        {error ? (
          <div className="rounded-[var(--rsm)] p-3 mb-3" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
            <p className="text-[12px] font-semibold text-red-700">{error}</p>
          </div>
        ) : null}

        <div className="rounded-[var(--rsm)] p-3 flex gap-2.5"
             style={{ background: 'var(--amber-light)', border: '1px solid #F5D78A' }}>
          <span className="text-base">🔒</span>
          <p className="text-[12px] leading-relaxed" style={{ color: '#7A5A00' }}>
            By booking you agree to our Terms of Service. Payment is processed securely via Paystack.
          </p>
        </div>
      </div>

      <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 w-full max-w-6xl mx-auto px-5 pb-4 pt-3 bg-white border-t-[1.5px] border-[var(--border)] z-50">
        <button className="btn btn-teal text-base" onClick={handlePay} disabled={loading}>
          {loading ? 'Redirecting to payment...' : `💳 Pay KES ${grandTotal.toLocaleString()}`}
        </button>
      </div>
    </div>
  )
}
