'use client'
import { useState } from 'react'
import Link from 'next/link'

type Step = 'sample' | 'lab' | 'schedule' | 'confirm'

const SAMPLE_TYPES = [
  { id: 'stool',  icon: '🧫', label: 'Stool',           desc: 'Collected at home, sealed container' },
  { id: 'urine',  icon: '💧', label: 'Urine',           desc: 'Midstream urine, provided container' },
  { id: 'semen',  icon: '🧪', label: 'Semen',           desc: 'Collected at home, 2–5 days abstinence' },
  { id: 'sputum', icon: '😮‍💨', label: 'Sputum',          desc: 'Early morning, deep cough sample' },
  { id: 'swab',   icon: '🔬', label: 'Swab',            desc: 'Nasal, throat, or wound — pre-collected' },
  { id: 'blood',  icon: '🩸', label: 'Blood (venous)',  desc: 'Pre-collected in EDTA / plain tube' },
]

const MOCK_LABS = [
  { id: 'l1', name: 'Lancet Kenya – Westlands',         town: 'Westlands',  rating: 4.8, reviews: 312, price: 350, turnaround: 4  },
  { id: 'l2', name: 'PathCare – Karen',                  town: 'Karen',      rating: 4.7, reviews: 198, price: 300, turnaround: 6  },
  { id: 'l3', name: 'Aga Khan Diagnostics – Parklands', town: 'Parklands',  rating: 4.9, reviews: 521, price: 400, turnaround: 3  },
  { id: 'l4', name: 'Nairobi Hospital Lab',              town: 'Upper Hill', rating: 4.6, reviews: 143, price: 280, turnaround: 8  },
]

const TIME_SLOTS = [
  '7:00 – 9:00 AM', '9:00 – 11:00 AM', '11:00 AM – 1:00 PM',
  '1:00 – 3:00 PM', '3:00 – 5:00 PM',  '5:00 – 7:00 PM',
]

function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

function formatDate(d: string) {
  const date = new Date(d)
  return date.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
}

function generateOrderNumber() {
  const now = new Date()
  return `PCH-RS-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
}

export default function ReadySamplePage() {
  const [step, setStep] = useState<Step>('sample')
  const [selectedSample, setSelectedSample] = useState<string | null>(null)
  const [selectedLab, setSelectedLab] = useState<typeof MOCK_LABS[number] | null>(null)
  const [date, setDate] = useState(getTomorrow())
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const riderFee = 250
  const totalFee = (selectedLab?.price || 0) + riderFee

  const STEPS: Record<Step, number> = { sample: 1, lab: 2, schedule: 3, confirm: 4 }
  const currentStep = STEPS[step]

  const handlePay = () => {
    setOrderNumber(generateOrderNumber())
    setStep('confirm')
  }

  // ── Confirmation screen ───────────────────────────────────────────────
  if (step === 'confirm' && orderNumber && selectedLab && timeSlot) {
    return (
      <div className="animate-fade-up min-h-screen">
        <div className="text-center py-10 px-5"
             style={{ background: 'linear-gradient(145deg, var(--orange) 0%, #FB923C 100%)' }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl mx-auto mb-4">
            ✓
          </div>
          <div className="text-2xl font-extrabold text-white mb-2">Pickup Booked!</div>
          <div className="text-[13px] text-white/70 leading-relaxed mb-3">
            Rider arriving {formatDate(date)}<br />
            {timeSlot} · {selectedLab.name}
          </div>
          <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-[12px] font-bold text-white tracking-wider">
            {orderNumber}
          </div>
        </div>

        <div className="px-5 pb-10 mt-5">
          <div className="card">
            {[
              { icon: '🧫', label: 'Sample Type', value: SAMPLE_TYPES.find(s => s.id === selectedSample)?.label || '' },
              { icon: '🏥', label: 'Lab',          value: `${selectedLab.name} · ${selectedLab.town}` },
              { icon: '📍', label: 'Pickup from',  value: address },
              { icon: '📅', label: 'Date & Time',  value: `${formatDate(date)} · ${timeSlot}` },
              { icon: '💳', label: 'Total Paid',   value: `KES ${totalFee.toLocaleString()} · M-Pesa ✓` },
            ].map(row => (
              <div key={row.label} className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)] last:border-none">
                <span className="text-lg">{row.icon}</span>
                <div>
                  <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">{row.label}</div>
                  <div className="text-[13px] font-bold">{row.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-[var(--rsm)] p-3 flex gap-2.5 mb-5"
               style={{ background: 'var(--amber-light)', border: '1px solid #F5D78A' }}>
            <span>⏱️</span>
            <p className="text-[12px] leading-relaxed" style={{ color: '#7A5A00' }}>
              Keep your sample sealed and at room temperature. Our rider will arrive within your chosen window.
              Results expected within {selectedLab.turnaround}h after delivery.
            </p>
          </div>

          <Link href="/" className="no-underline block mb-2.5">
            <button className="btn btn-teal">🏠 Back to Home</button>
          </Link>
          <Link href="/track" className="no-underline block">
            <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600 }}>
              📦 Track this order
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fade-up min-h-screen">
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--orange), #FB923C)', padding: '16px 20px 22px' }}>
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline"
                style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>
            ←
          </Link>
          <span className="text-[13px] font-bold text-white/80">Ready Sample Pickup</span>
          <div className="w-[38px]" />
        </div>

        {/* Progress */}
        <div className="h-1 rounded-full mb-2" style={{ background: 'rgba(255,255,255,.25)' }}>
          <div className="h-full rounded-full transition-all"
               style={{ width: `${(currentStep / 4) * 100}%`, background: 'rgba(255,255,255,.9)' }} />
        </div>
        <div className="flex justify-between">
          {['Sample', 'Lab', 'Schedule', 'Pay'].map((label, i) => (
            <span key={label} className="text-[10px] font-bold"
                  style={{ color: i + 1 <= currentStep ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.4)' }}>
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="px-5 pb-32 pt-5">

        {/* ── Step 1: Sample Type ── */}
        {step === 'sample' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">What sample do you have?</h2>
            <p className="text-[13px] text-[var(--text-soft)] mb-5">Our rider will pick it up sealed from your location.</p>

            <div className="grid grid-cols-2 gap-2.5">
              {SAMPLE_TYPES.map(s => (
                <div key={s.id} onClick={() => setSelectedSample(s.id)}
                     className="rounded-[var(--r)] border-2 p-4 cursor-pointer transition-all"
                     style={{
                       background: selectedSample === s.id ? 'var(--teal-pale)' : 'var(--white)',
                       borderColor: selectedSample === s.id ? 'var(--teal)' : 'var(--border)',
                       boxShadow: 'var(--sh)',
                     }}>
                  <div className="text-[28px] mb-2">{s.icon}</div>
                  <div className="text-[13px] font-extrabold mb-1">{s.label}</div>
                  <div className="text-[11px] text-[var(--text-soft)] leading-snug">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="rounded-[var(--rsm)] p-3 flex gap-2.5 mt-5"
                 style={{ background: 'var(--amber-light)', border: '1px solid #F5D78A' }}>
              <span>💡</span>
              <p className="text-[12px] leading-relaxed" style={{ color: '#7A5A00' }}>
                Use a clean, sealed container. Our rider will provide a specimen bag on arrival if needed.
              </p>
            </div>
          </>
        )}

        {/* ── Step 2: Lab ── */}
        {step === 'lab' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Choose a lab</h2>
            <p className="text-[13px] text-[var(--text-soft)] mb-5">Rider drops your sample off directly.</p>

            {MOCK_LABS.map((lab, i) => (
              <div key={lab.id} onClick={() => setSelectedLab(lab)}
                   className="rounded-[var(--r)] border-2 overflow-hidden mb-3 cursor-pointer transition-all"
                   style={{
                     borderColor: selectedLab?.id === lab.id ? 'var(--teal)' : 'var(--border)',
                     background: 'var(--white)',
                     boxShadow: 'var(--sh)',
                   }}>
                {i === 0 && (
                  <div className="text-[10px] font-bold py-1.5 px-3.5 tracking-wider text-white"
                       style={{ background: 'linear-gradient(90deg, var(--teal-dark), var(--teal))' }}>
                    ⭐ BEST VALUE
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start gap-3 mb-2.5">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border-[1.5px] border-[var(--border)]">🏥</div>
                    <div className="flex-1">
                      <div className="text-[14px] font-extrabold">{lab.name}</div>
                      <div className="text-[11px] text-[var(--text-soft)] mb-1">{lab.town}</div>
                      <div className="flex gap-1.5">
                        <span className="tag tag-green">★ {lab.rating}</span>
                        <span className="tag tag-teal">⚡ {lab.turnaround}h results</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold text-[var(--teal)]">KES {lab.price}</div>
                      <div className="text-[10px] text-[var(--text-soft)]">drop-off fee</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-between items-center"
                     style={{ background: 'var(--bg)' }}>
                  <span className="text-[12px] font-bold text-[var(--green)]">● Accepting samples today</span>
                  <span className="px-4 py-1.5 rounded-full text-[12px] font-bold"
                        style={{
                          background: selectedLab?.id === lab.id ? 'var(--teal)' : 'var(--teal-pale)',
                          color: selectedLab?.id === lab.id ? '#fff' : 'var(--teal)',
                        }}>
                    {selectedLab?.id === lab.id ? '✓ Selected' : 'Select →'}
                  </span>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ── Step 3: Schedule ── */}
        {step === 'schedule' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">When should we pick up?</h2>
            <p className="text-[13px] text-[var(--text-soft)] mb-5">{selectedLab?.name}</p>

            <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Pickup Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} min={getTomorrow()}
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--orange)] mb-4"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

            <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Time Window</label>
            <div className="grid grid-cols-2 gap-2 mb-5">
              {TIME_SLOTS.map(slot => (
                <button key={slot} onClick={() => setTimeSlot(slot)}
                        className="py-3 px-2 rounded-xl text-[12px] font-bold border-2 cursor-pointer transition-all"
                        style={{
                          background: timeSlot === slot ? 'var(--orange)' : 'var(--white)',
                          color: timeSlot === slot ? '#fff' : 'var(--text-mid)',
                          borderColor: timeSlot === slot ? 'var(--orange)' : 'var(--border)',
                        }}>
                  {slot}
                </button>
              ))}
            </div>

            <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Pickup Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                   placeholder="e.g. Kamakis, Eastern Bypass, Ruiru"
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--orange)] mb-3"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

            <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Landmark (optional)</label>
            <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
                   placeholder="e.g. Near Total petrol station"
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--orange)]"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          </>
        )}

        {/* ── Step 4 (payment review) handled in CTA ── */}
        {step === 'confirm' && !orderNumber && selectedLab && timeSlot && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Review & Pay</h2>
            <p className="text-[13px] text-[var(--text-soft)] mb-5">Ready sample pickup · {selectedLab.name}</p>

            <div className="card">
              {[
                { icon: '🧫', label: 'Sample', value: SAMPLE_TYPES.find(s => s.id === selectedSample)?.label || '' },
                { icon: '🏥', label: 'Lab', value: `${selectedLab.name} · ${selectedLab.town}` },
                { icon: '📍', label: 'Pickup from', value: address },
                { icon: '📅', label: 'Date & Time', value: `${formatDate(date)} · ${timeSlot}` },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start py-2.5 border-b border-[var(--border)] last:border-none">
                  <span className="text-[13px] text-[var(--text-mid)]">{row.icon} {row.label}</span>
                  <span className="text-[13px] font-bold text-right max-w-[55%]">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
                <span className="text-[var(--text-mid)]">Lab drop-off fee</span>
                <span className="font-bold">KES {selectedLab.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
                <span className="text-[var(--text-mid)]">🏍 Rider pickup fee</span>
                <span className="font-bold">KES {riderFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px]">
                <span className="text-[var(--text-mid)]">Platform fee</span>
                <span className="font-bold">KES 0 <span className="tag tag-green">Free</span></span>
              </div>
              <div className="border-t-2 border-[var(--border)] mt-2 pt-3 flex justify-between items-center rounded-xl p-3 mt-3"
                   style={{ background: 'var(--orange-pale)' }}>
                <span className="text-sm font-extrabold">Total</span>
                <span className="text-2xl font-extrabold text-[var(--orange)]">KES {totalFee.toLocaleString()}</span>
              </div>
            </div>

            <div className="rounded-[var(--r)] overflow-hidden border-[1.5px] border-[#4CAF50] mb-4">
              <div className="bg-[#4CAF50] text-white text-[10px] font-bold tracking-wider px-3.5 py-1.5 uppercase">M-PESA</div>
              <div className="bg-white p-4">
                <div className="text-[15px] font-extrabold mb-1">Pay KES {totalFee.toLocaleString()} via M-Pesa</div>
                <div className="text-[12px] text-[var(--text-soft)] mb-3">STK push sent to your phone</div>
                <div className="flex items-center gap-2 bg-[var(--bg)] rounded-[var(--rsm)] p-3">
                  <span className="text-sm font-bold text-[var(--text-mid)]">🇰🇪 +254</span>
                  <span className="text-base font-extrabold">712 345 678</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CTA bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-5xl px-5 pb-6 pt-3.5 bg-white border-t-[1.5px] border-[var(--border)] z-50">
        {step === 'sample' && (
          <button className="btn btn-orange" onClick={() => setStep('lab')}
                  style={{ opacity: selectedSample ? 1 : 0.4, pointerEvents: selectedSample ? 'auto' : 'none' }}>
            Next: Choose a lab →
          </button>
        )}
        {step === 'lab' && (
          <div className="flex gap-2">
            <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, flex: '0 0 auto', width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('sample')}>←</button>
            <button className="btn btn-orange flex-1" onClick={() => setStep('schedule')}
                    style={{ opacity: selectedLab ? 1 : 0.4, pointerEvents: selectedLab ? 'auto' : 'none' }}>
              Next: Schedule pickup →
            </button>
          </div>
        )}
        {step === 'schedule' && (
          <div className="flex gap-2">
            <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, flex: '0 0 auto', width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('lab')}>←</button>
            <button className="btn btn-orange flex-1" onClick={() => setStep('confirm')}
                    style={{ opacity: timeSlot && address.trim() ? 1 : 0.4, pointerEvents: timeSlot && address.trim() ? 'auto' : 'none' }}>
              Review & Pay →
            </button>
          </div>
        )}
        {step === 'confirm' && !orderNumber && (
          <div className="flex gap-2">
            <button className="btn" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, flex: '0 0 auto', width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('schedule')}>←</button>
            <button className="btn btn-orange flex-1" onClick={handlePay}>
              💳 Pay KES {totalFee.toLocaleString()} via M-Pesa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
