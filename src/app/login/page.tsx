'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
      router.push('/')
    }
  }

  return (
    <div className="animate-fade-up min-h-screen">
      <div className="text-center py-12 px-5"
           style={{ background: 'linear-gradient(160deg, var(--teal-dark) 0%, var(--teal) 55%, var(--teal-light) 100%)', borderRadius: '0 0 32px 32px' }}>
        <div className="w-20 h-20 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-4xl mx-auto mb-5">
          🔐
        </div>
        <div className="logo-text text-white text-4xl mb-2" style={{ color: '#fff' }}>
          PIMA<span style={{ color: 'var(--amber)' }}>CHAP</span>
        </div>
        <div className="text-[11px] text-white/50 tracking-widest uppercase">Diagnostics marketplace</div>
      </div>

      <div className="px-5 pt-8">
        {step === 'phone' ? (
          <>
            <h2 className="text-[22px] font-extrabold mb-2">Sign in with your phone</h2>
            <p className="text-[13px] text-[var(--text-soft)] mb-6">We&apos;ll send a 6-digit code to verify your number</p>

            <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Phone Number</label>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1.5 bg-[var(--bg)] rounded-[var(--rsm)] px-3 py-3.5 text-sm font-bold text-[var(--text-mid)] shrink-0 border-2 border-[var(--border)]">
                🇰🇪 +254
              </div>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                     placeholder="712 345 678"
                     className="flex-1 p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--teal)]"
                     style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
            </div>

            {error && <div className="text-[12px] text-[var(--red)] font-semibold mb-3">⚠️ {error}</div>}

            <button className="btn btn-teal mb-4" onClick={sendOtp} disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code →'}
            </button>

            <div className="rounded-[var(--rsm)] p-3 flex gap-2.5"
                 style={{ background: 'var(--amber-light)', border: '1px solid #F5D78A' }}>
              <span className="text-base">💡</span>
              <div>
                <p className="text-[12px] leading-relaxed" style={{ color: '#7A5A00' }}>
                  <strong>Testing?</strong> Use phone <strong>+254700000001</strong> and OTP <strong>123456</strong> (set up in Supabase test numbers).
                </p>
              </div>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-[22px] font-extrabold mb-2">Enter verification code</h2>
            <p className="text-[13px] text-[var(--text-soft)] mb-6">
              6-digit code sent to <strong>{phone.startsWith('+') ? phone : `+254${phone.startsWith('0') ? phone.slice(1) : phone}`}</strong>
            </p>

            <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Verification Code</label>
            <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                   placeholder="123456" maxLength={6}
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-2xl text-center font-extrabold text-[var(--text)] outline-none focus:border-[var(--teal)] tracking-[0.5em] mb-4"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

            {error && <div className="text-[12px] text-[var(--red)] font-semibold mb-3">⚠️ {error}</div>}

            <button className="btn btn-teal mb-3" onClick={verifyOtp} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Sign In →'}
            </button>

            <button className="btn" onClick={() => setStep('phone')}
                    style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}>
              ← Change phone number
            </button>
          </>
        )}

        <div className="text-center mt-6">
          <Link href="/" className="text-[12px] text-[var(--text-soft)] no-underline">Skip for now →</Link>
        </div>
      </div>
    </div>
  )
}
