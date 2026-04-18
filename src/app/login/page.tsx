'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { buildRoleProfile } from '@/lib/auth-profile'
import { getHomeRoute } from '@/lib/rbac'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const sendOtp = async () => {
    setError('')
    const formatted = phone.startsWith('+') ? phone : phone.startsWith('0') ? `+254${phone.slice(1)}` : `+254${phone}`
    if (formatted.length < 12) {
      setError('Enter a valid phone number')
      return
    }
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithOtp({ phone: formatted })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setStep('otp')
    }
  }

  const verifyOtp = async () => {
    setError('')
    const formatted = phone.startsWith('+') ? phone : phone.startsWith('0') ? `+254${phone.slice(1)}` : `+254${phone}`
    setLoading(true)
    const { error: err } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: 'sms',
    })
    setLoading(false)
    if (err) {
      setError(err.message)
    } else {
      const { data: sessionData } = await supabase.auth.getSession()
      if (sessionData.session?.access_token) {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: sessionData.session.access_token }),
        })
      }
      const { data: userData } = await supabase.auth.getUser()
      const profile = userData.user ? buildRoleProfile(userData.user) : null
      const requested = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('next') : null
      const nextRoute = requested && requested.startsWith('/') ? requested : null
      router.push(nextRoute ?? getHomeRoute(profile))
    }
  }

  return (
    <div className="animate-fade-up min-h-screen">
      <div
        className="text-center px-5 py-12"
        style={{ background: 'linear-gradient(160deg, var(--teal-dark) 0%, var(--teal) 55%, var(--teal-light) 100%)', borderRadius: '0 0 32px 32px' }}
      >
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-4xl">
          Lock
        </div>
        <div className="logo-text mb-2 text-4xl text-white" style={{ color: '#fff' }}>
          PIMA<span style={{ color: 'var(--amber)' }}>CHAP</span>
        </div>
        <div className="text-[11px] uppercase tracking-widest text-white/50">Diagnostics marketplace</div>
      </div>

      <div className="px-5 pt-8">
        {step === 'phone' ? (
          <>
            <h2 className="mb-2 text-[22px] font-extrabold">Sign in with your phone</h2>
            <p className="mb-6 text-[13px] text-[var(--text-soft)]">We&apos;ll send a 6-digit code to verify your number</p>

            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-mid)]">Phone Number</label>
            <div className="mb-4 flex items-center gap-2">
              <div className="shrink-0 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-[var(--bg)] px-3 py-3.5 text-sm font-bold text-[var(--text-mid)]">
                KE +254
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="712 345 678"
                className="flex-1 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white p-3.5 text-[15px] text-[var(--text)] outline-none focus:border-[var(--teal)]"
                style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
              />
            </div>

            {error ? <div className="mb-3 text-[12px] font-semibold text-[var(--red)]">Warning: {error}</div> : null}

            <button className="btn btn-teal mb-4" onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </button>

          </>
        ) : (
          <>
            <h2 className="mb-2 text-[22px] font-extrabold">Enter verification code</h2>
            <p className="mb-6 text-[13px] text-[var(--text-soft)]">
              6-digit code sent to <strong>{phone.startsWith('+') ? phone : `+254${phone.startsWith('0') ? phone.slice(1) : phone}`}</strong>
            </p>

            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-[var(--text-mid)]">Verification Code</label>
            <input
              type="text"
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              maxLength={6}
              className="mb-4 w-full rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white p-3.5 text-center text-2xl font-extrabold tracking-[0.5em] text-[var(--text)] outline-none focus:border-[var(--teal)]"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            />

            {error ? <div className="mb-3 text-[12px] font-semibold text-[var(--red)]">Warning: {error}</div> : null}

            <button className="btn btn-teal mb-3" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify and Sign In'}
            </button>

            <button
              className="btn"
              onClick={() => setStep('phone')}
              style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}
            >
              Change phone number
            </button>
          </>
        )}

        <div className="mt-6 text-center">
          <Link href="/" className="text-[12px] no-underline text-[var(--text-soft)]">
            Skip for now
          </Link>
        </div>

        <div className="mt-6 flex gap-2.5 rounded-[var(--rsm)] p-3" style={{ background: 'var(--teal-pale)', border: '1px solid rgba(10,143,148,.2)' }}>
          <span className="text-base">Route</span>
          <div>
            <p className="text-[12px] leading-relaxed" style={{ color: 'var(--teal-dark)' }}>
              Staff and partner users are routed to their workspace based on Supabase metadata roles such as <strong>owner</strong>, <strong>ops</strong>, <strong>compliance</strong>, <strong>finance</strong>, or <strong>partner_lab</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
