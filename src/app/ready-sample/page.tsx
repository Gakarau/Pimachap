'use client'
import { useState } from 'react'
import Link from 'next/link'

type Step = 'sample' | 'triage' | 'lab' | 'schedule' | 'payment' | 'confirm'

const SAMPLE_TYPES = [
  { id: 'stool',  icon: '🧫', label: 'Stool',              urgentAfterHours: 2,  desc: 'Requires collection container' },
  { id: 'urine',  icon: '💧', label: 'Urine',              urgentAfterHours: 4,  desc: 'Midstream, clean container' },
  { id: 'semen',  icon: '🧪', label: 'Semen',              urgentAfterHours: 1,  desc: '2–5 days abstinence required' },
  { id: 'sputum', icon: '😮‍💨', label: 'Sputum',             urgentAfterHours: 2,  desc: 'Early morning, deep cough' },
  { id: 'swab',   icon: '🔬', label: 'Swab',               urgentAfterHours: 6,  desc: 'Nasal, throat or wound' },
  { id: 'blood',  icon: '🩸', label: 'Blood (pre-drawn)',  urgentAfterHours: 2,  desc: 'EDTA or plain tube, sealed' },
]

const TIME_SINCE = [
  { id: 'just_now',   label: 'Just now  (< 30 min)',   hours: 0.25 },
  { id: '30_to_1',    label: '30 min – 1 hour ago',    hours: 0.75 },
  { id: '1_to_2',     label: '1 – 2 hours ago',        hours: 1.5  },
  { id: '2_to_4',     label: '2 – 4 hours ago',        hours: 3    },
  { id: 'over_4',     label: 'More than 4 hours ago',  hours: 4.5  },
]

const READY_SOON = [
  { id: 'within_1h',  label: 'Within the next hour',     hours: 1 },
  { id: 'in_2h',      label: 'In about 2 hours',         hours: 2 },
  { id: 'today_pm',   label: 'This afternoon',           hours: 5 },
  { id: 'tomorrow',   label: 'Tomorrow morning',         hours: 18 },
]

const MOCK_LABS = [
  { id: 'l1', name: 'Lancet Kenya – Westlands',         town: 'Westlands',  rating: 4.8, reviews: 312, price: 350, turnaround: 4,  asap: true  },
  { id: 'l2', name: 'Aga Khan Diagnostics – Parklands', town: 'Parklands',  rating: 4.9, reviews: 521, price: 400, turnaround: 3,  asap: true  },
  { id: 'l3', name: 'PathCare – Karen',                  town: 'Karen',      rating: 4.7, reviews: 198, price: 300, turnaround: 6,  asap: false },
  { id: 'l4', name: 'Nairobi Hospital Lab',              town: 'Upper Hill', rating: 4.6, reviews: 143, price: 280, turnaround: 8,  asap: false },
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
  const [selectedSample, setSelectedSample] = useState<typeof SAMPLE_TYPES[number] | null>(null)

  // Triage
  const [alreadyCollected, setAlreadyCollected] = useState<boolean | null>(null)
  const [timeSinceId, setTimeSinceId] = useState<string | null>(null)
  const [readySoonId, setReadySoonId] = useState<string | null>(null)

  // Booking
  const [selectedLab, setSelectedLab] = useState<typeof MOCK_LABS[number] | null>(null)
  const [isAsap, setIsAsap] = useState(false)
  const [date, setDate] = useState(getTomorrow())
  const [timeSlot, setTimeSlot] = useState<string | null>(null)
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  const riderFee = isAsap ? 450 : 250
  const totalFee = (selectedLab?.price || 0) + riderFee

  const STEPS: Record<Step, number> = { sample: 1, triage: 2, lab: 3, schedule: 4, payment: 5, confirm: 6 }
  const STEP_LABELS = ['Sample', 'Urgency', 'Lab', 'Schedule', 'Pay', 'Done']
  const currentStepNum = STEPS[step]

  // Determine urgency after triage
  function determineUrgency(sampleType: typeof SAMPLE_TYPES[number], sinceId: string) {
    const sinceEntry = TIME_SINCE.find(t => t.id === sinceId)
    if (!sinceEntry) return false
    return sinceEntry.hours >= sampleType.urgentAfterHours
  }

  const handleTriageDone = () => {
    if (alreadyCollected === null) return
    if (alreadyCollected && timeSinceId && selectedSample) {
      const urgent = determineUrgency(selectedSample, timeSinceId)
      setIsAsap(urgent)
    } else {
      setIsAsap(false)
    }
    setStep('lab')
  }

  const handlePay = () => {
    setOrderNumber(generateOrderNumber())
    setStep('confirm')
  }

  // ── Confirmation ─────────────────────────────────────────────────────────
  if (step === 'confirm' && orderNumber && selectedLab) {
    return (
      <div className="animate-fade-up min-h-screen">
        <div className="text-center py-10 px-5"
             style={{ background: isAsap
               ? 'linear-gradient(145deg, #DC2626, #F87171)'
               : 'linear-gradient(145deg, var(--orange), #FB923C)' }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl mx-auto mb-4">
            {isAsap ? '🚨' : '✓'}
          </div>
          <div className="text-2xl font-extrabold text-white mb-2">
            {isAsap ? 'ASAP Pickup Booked!' : 'Pickup Booked!'}
          </div>
          {isAsap && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 text-[12px] font-bold"
                 style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
              🚨 Priority dispatch — rider en route within 30 min
            </div>
          )}
          <div className="text-[13px] text-white/70 leading-relaxed mb-3">
            {isAsap
              ? `Rider dispatched now · ${selectedLab.name}`
              : `${formatDate(date)} · ${timeSlot} · ${selectedLab.name}`}
          </div>
          <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-[12px] font-bold text-white tracking-wider">
            {orderNumber}
          </div>
        </div>

        <div className="px-4 pb-10 mt-5">
          {isAsap && (
            <div className="rounded-[var(--r)] p-4 mb-4 flex gap-3 items-start"
                 style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
              <span className="text-xl">⏱️</span>
              <div>
                <div className="text-[13px] font-extrabold mb-1" style={{ color: '#991B1B' }}>Time-sensitive sample</div>
                <div className="text-[12px] leading-relaxed" style={{ color: '#7F1D1D' }}>
                  Keep the sample sealed and at room temperature. Do not refrigerate unless specified. Our rider will arrive within 30 minutes.
                </div>
              </div>
            </div>
          )}

          <div className="card">
            {[
              { icon: '🧫', label: 'Sample Type', value: selectedSample?.label || '' },
              { icon: '🏥', label: 'Lab', value: `${selectedLab.name} · ${selectedLab.town}` },
              { icon: isAsap ? '🚨' : '📅', label: isAsap ? 'Dispatch' : 'Date & Time', value: isAsap ? 'ASAP — rider en route' : `${formatDate(date)} · ${timeSlot}` },
              { icon: '📍', label: 'Pickup from', value: address },
              { icon: '💳', label: 'Total Paid', value: `KES ${totalFee.toLocaleString()} · M-Pesa ✓` },
              { icon: '⏱️', label: 'Results ETA', value: `~${selectedLab.turnaround}h after drop-off` },
            ].map(row => (
              <div key={row.label} className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)] last:border-none">
                <span className="text-lg">{row.icon}</span>
                <div>
                  <div className="text-[10px] text-[var(--text-soft)] font-semibold uppercase">{row.label}</div>
                  <div className="text-[13px] font-bold mt-0.5">{row.value}</div>
                </div>
              </div>
            ))}
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
      <div style={{
        background: isAsap
          ? 'linear-gradient(135deg, #DC2626, #F87171)'
          : 'linear-gradient(135deg, var(--orange), #FB923C)',
        padding: '16px 20px 22px'
      }}>
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
          <div className="h-full rounded-full transition-all duration-300"
               style={{ width: `${((currentStepNum - 1) / 5) * 100}%`, background: 'rgba(255,255,255,.9)' }} />
        </div>
        <div className="flex justify-between">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className="text-[10px] font-bold"
                  style={{ color: i + 1 <= currentStepNum ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)' }}>
              {label}
            </span>
          ))}
        </div>

        {isAsap && step !== 'sample' && step !== 'triage' && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
               style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)' }}>
            <span className="text-sm animate-pulse">🚨</span>
            <span className="text-[12px] font-extrabold text-white">PRIORITY ORDER — time-sensitive sample</span>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 pb-32 pt-5">

        {/* ── Step 1: Sample Type ── */}
        {step === 'sample' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">What type of sample?</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>Select the sample you have or will have ready.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SAMPLE_TYPES.map(s => (
                <div key={s.id} onClick={() => setSelectedSample(s)}
                     className="rounded-[var(--r)] border-2 p-4 cursor-pointer transition-all"
                     style={{
                       background: selectedSample?.id === s.id ? 'var(--teal-pale)' : 'var(--white)',
                       borderColor: selectedSample?.id === s.id ? 'var(--teal)' : 'var(--border)',
                       boxShadow: 'var(--sh)',
                     }}>
                  <div className="text-[28px] mb-2">{s.icon}</div>
                  <div className="text-[13px] font-extrabold mb-1">{s.label}</div>
                  <div className="text-[11px] leading-snug" style={{ color: 'var(--text-soft)' }}>{s.desc}</div>
                  {s.urgentAfterHours <= 2 && (
                    <div className="mt-2">
                      <span className="tag tag-coral" style={{ fontSize: '9px' }}>⚡ Time-sensitive</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Step 2: Triage ── */}
        {step === 'triage' && selectedSample && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Sample status</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>
              This helps us assess urgency and dispatch a rider at the right time.
            </p>

            {/* Already collected? */}
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-soft)' }}>
              Is the {selectedSample.label.toLowerCase()} sample already collected?
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { val: true,  icon: '✅', label: 'Yes, it\'s ready', sub: 'Sample is collected & sealed' },
                { val: false, icon: '⏳', label: 'Not yet',          sub: 'I\'ll collect it soon' },
              ].map(opt => (
                <div key={String(opt.val)} onClick={() => { setAlreadyCollected(opt.val); setTimeSinceId(null); setReadySoonId(null) }}
                     className="rounded-[var(--r)] border-2 p-4 cursor-pointer transition-all"
                     style={{
                       background: alreadyCollected === opt.val ? 'var(--teal-pale)' : 'var(--white)',
                       borderColor: alreadyCollected === opt.val ? 'var(--teal)' : 'var(--border)',
                       boxShadow: 'var(--sh)',
                     }}>
                  <div className="text-2xl mb-2">{opt.icon}</div>
                  <div className="text-[13px] font-extrabold mb-0.5">{opt.label}</div>
                  <div className="text-[11px]" style={{ color: 'var(--text-soft)' }}>{opt.sub}</div>
                </div>
              ))}
            </div>

            {/* Already collected → when was it taken? */}
            {alreadyCollected === true && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-soft)' }}>
                  When was it collected?
                </div>
                <div className="flex flex-col gap-2 mb-4">
                  {TIME_SINCE.map(opt => {
                    const wouldBeUrgent = determineUrgency(selectedSample, opt.id)
                    return (
                      <div key={opt.id} onClick={() => setTimeSinceId(opt.id)}
                           className="rounded-[var(--rsm)] border-2 px-4 py-3 cursor-pointer transition-all flex items-center justify-between"
                           style={{
                             background: timeSinceId === opt.id ? (wouldBeUrgent ? '#FEF2F2' : 'var(--teal-pale)') : 'var(--white)',
                             borderColor: timeSinceId === opt.id ? (wouldBeUrgent ? '#DC2626' : 'var(--teal)') : 'var(--border)',
                           }}>
                        <span className="text-[13px] font-bold">{opt.label}</span>
                        {wouldBeUrgent && (
                          <span className="tag tag-coral" style={{ fontSize: '9px' }}>🚨 ASAP</span>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Show urgency warning if applicable */}
                {timeSinceId && determineUrgency(selectedSample, timeSinceId) && (
                  <div className="rounded-[var(--r)] p-4 mb-4 flex gap-3"
                       style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                    <span className="text-xl">🚨</span>
                    <div>
                      <div className="text-[13px] font-extrabold mb-1" style={{ color: '#991B1B' }}>Priority pickup recommended</div>
                      <div className="text-[12px] leading-relaxed" style={{ color: '#7F1D1D' }}>
                        {selectedSample.label} samples degrade after {selectedSample.urgentAfterHours}h.
                        We will dispatch a rider immediately and mark this as a <strong>Priority Order</strong>.
                        Rider fee: <strong>KES 450</strong>.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Not yet collected → when will it be ready? */}
            {alreadyCollected === false && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-soft)' }}>
                  When will it be ready for pickup?
                </div>
                <div className="grid grid-cols-2 gap-2.5 mb-4">
                  {READY_SOON.map(opt => (
                    <div key={opt.id} onClick={() => setReadySoonId(opt.id)}
                         className="rounded-[var(--rsm)] border-2 px-4 py-3 cursor-pointer transition-all text-center"
                         style={{
                           background: readySoonId === opt.id ? 'var(--teal-pale)' : 'var(--white)',
                           borderColor: readySoonId === opt.id ? 'var(--teal)' : 'var(--border)',
                         }}>
                      <div className="text-[13px] font-bold">{opt.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[var(--rsm)] p-3 flex gap-2.5"
                     style={{ background: 'var(--amber-light)', border: '1px solid var(--amber)' }}>
                  <span>💡</span>
                  <p className="text-[12px] leading-relaxed" style={{ color: '#7A5A00' }}>
                    We'll schedule the rider to arrive just after your sample is ready. For stool or blood, aim to collect as late morning as possible for best sample quality.
                  </p>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Step 3: Lab ── */}
        {step === 'lab' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Choose a lab</h2>
            <p className="text-[13px] mb-1" style={{ color: 'var(--text-soft)' }}>
              Rider drops your sample off directly.
            </p>
            {isAsap && (
              <p className="text-[12px] font-bold mb-4 px-3 py-2 rounded-xl" style={{ background: '#FEF2F2', color: '#991B1B' }}>
                🚨 Showing ASAP-capable labs first
              </p>
            )}
            {!isAsap && <div className="mb-5" />}

            {(isAsap ? [...MOCK_LABS].sort((a, b) => (b.asap ? 1 : 0) - (a.asap ? 1 : 0)) : MOCK_LABS).map((lab, i) => (
              <div key={lab.id} onClick={() => setSelectedLab(lab)}
                   className="rounded-[var(--r)] border-2 overflow-hidden mb-3 cursor-pointer transition-all"
                   style={{
                     borderColor: selectedLab?.id === lab.id ? 'var(--teal)' : 'var(--border)',
                     background: 'var(--white)',
                     boxShadow: 'var(--sh)',
                     opacity: isAsap && !lab.asap ? 0.6 : 1,
                   }}>
                {i === 0 && (
                  <div className="text-[10px] font-bold py-1.5 px-3.5 tracking-wider text-white"
                       style={{ background: isAsap ? 'linear-gradient(90deg, #DC2626, #F87171)' : 'linear-gradient(90deg, var(--teal-dark), var(--teal))' }}>
                    {isAsap ? '🚨 PRIORITY DISPATCH' : '⭐ BEST VALUE'}
                  </div>
                )}
                {isAsap && !lab.asap && i > 0 && (
                  <div className="text-[10px] font-bold py-1 px-3.5 tracking-wider"
                       style={{ background: 'var(--bg)', color: 'var(--text-soft)' }}>
                    Standard (not ASAP)
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border-[1.5px] border-[var(--border)]">🏥</div>
                    <div className="flex-1">
                      <div className="text-[14px] font-extrabold">{lab.name}</div>
                      <div className="text-[11px] mb-1.5" style={{ color: 'var(--text-soft)' }}>{lab.town}</div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="tag tag-green">★ {lab.rating}</span>
                        <span className="tag tag-teal">⚡ {lab.turnaround}h results</span>
                        {lab.asap && <span className="tag tag-coral">🚨 ASAP-ready</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-extrabold" style={{ color: 'var(--teal)' }}>KES {lab.price}</div>
                      <div className="text-[10px]" style={{ color: 'var(--text-soft)' }}>drop-off fee</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-between items-center"
                     style={{ background: 'var(--bg)' }}>
                  <span className="text-[12px] font-bold" style={{ color: 'var(--green)' }}>● Open now</span>
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

        {/* ── Step 4: Schedule (skip for ASAP) ── */}
        {step === 'schedule' && (
          <>
            {isAsap ? (
              <>
                <h2 className="text-[22px] font-extrabold mb-1">Where should we pick up?</h2>
                <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>
                  Rider dispatches immediately after payment.
                </p>
                <div className="rounded-[var(--r)] p-4 mb-5 flex gap-3"
                     style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                  <span className="text-xl">🚨</span>
                  <div>
                    <div className="text-[13px] font-extrabold mb-0.5" style={{ color: '#991B1B' }}>ASAP dispatch</div>
                    <div className="text-[12px]" style={{ color: '#7F1D1D' }}>Rider will arrive within 30 minutes of payment confirmation.</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-[22px] font-extrabold mb-1">Schedule pickup</h2>
                <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>{selectedLab?.name}</p>
                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>Pickup Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} min={getTomorrow()}
                       className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] outline-none mb-4"
                       style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', borderColor: 'var(--border)' }}
                       onFocus={e => e.target.style.borderColor = 'var(--orange)'}
                       onBlur={e => e.target.style.borderColor = 'var(--border)'} />

                <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>Time Window</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
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
              </>
            )}

            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>Pickup Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                   placeholder="e.g. Kamakis, Eastern Bypass, Ruiru"
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] outline-none mb-3"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)' }} />

            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>Landmark (optional)</label>
            <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
                   placeholder="e.g. Near Total petrol station"
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] outline-none"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)' }} />
          </>
        )}

        {/* ── Step 5: Payment Review ── */}
        {step === 'payment' && selectedLab && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Review & Pay</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>
              {isAsap ? 'Priority pickup · ' : 'Ready sample pickup · '}{selectedLab.name}
            </p>

            {isAsap && (
              <div className="rounded-[var(--r)] p-3.5 mb-4 flex gap-2.5 items-center"
                   style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                <span>🚨</span>
                <p className="text-[12px] font-bold" style={{ color: '#991B1B' }}>
                  Priority order — rider dispatched immediately after payment
                </p>
              </div>
            )}

            <div className="card">
              {[
                { icon: '🧫', label: 'Sample', value: selectedSample?.label || '' },
                { icon: '🏥', label: 'Lab', value: `${selectedLab.name} · ${selectedLab.town}` },
                { icon: isAsap ? '🚨' : '📅', label: isAsap ? 'Dispatch' : 'Date & Time',
                  value: isAsap ? 'ASAP after payment' : `${formatDate(date)} · ${timeSlot}` },
                { icon: '📍', label: 'Pickup from', value: address },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-start py-2.5 border-b border-[var(--border)] last:border-none">
                  <span className="text-[13px]" style={{ color: 'var(--text-mid)' }}>{row.icon} {row.label}</span>
                  <span className="text-[13px] font-bold text-right max-w-[55%]">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '14px 16px' }}>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
                <span style={{ color: 'var(--text-mid)' }}>Lab drop-off fee</span>
                <span className="font-bold">KES {selectedLab.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px] border-b border-[var(--border)]">
                <span style={{ color: 'var(--text-mid)' }}>
                  🏍 Rider fee {isAsap && <span className="tag tag-coral ml-1" style={{ fontSize: '9px' }}>Priority</span>}
                </span>
                <span className="font-bold">KES {riderFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1.5 text-[13px]">
                <span style={{ color: 'var(--text-mid)' }}>Platform fee</span>
                <span className="font-bold">KES 0 <span className="tag tag-green">Free</span></span>
              </div>
              <div className="border-t-2 border-[var(--border)] mt-2 pt-3 rounded-xl p-3 mt-3 flex justify-between items-center"
                   style={{ background: isAsap ? '#FEF2F2' : 'var(--orange-pale)' }}>
                <span className="text-sm font-extrabold">Total</span>
                <span className="text-2xl font-extrabold" style={{ color: isAsap ? '#DC2626' : 'var(--orange)' }}>
                  KES {totalFee.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-[var(--r)] overflow-hidden border-[1.5px] border-[#4CAF50] mb-4">
              <div className="bg-[#4CAF50] text-white text-[10px] font-bold tracking-wider px-3.5 py-1.5 uppercase">M-PESA</div>
              <div className="bg-white p-4">
                <div className="text-[15px] font-extrabold mb-1">Pay KES {totalFee.toLocaleString()} via M-Pesa</div>
                <div className="text-[12px] mb-3" style={{ color: 'var(--text-soft)' }}>STK push sent to your phone</div>
                <div className="flex items-center gap-2 rounded-[var(--rsm)] p-3" style={{ background: 'var(--bg)' }}>
                  <span className="text-sm font-bold" style={{ color: 'var(--text-mid)' }}>🇰🇪 +254</span>
                  <span className="text-base font-extrabold">712 345 678</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── CTA Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-6xl mx-auto px-4 sm:px-5 pb-6 pt-3.5 bg-white border-t-[1.5px] border-[var(--border)] z-50">
        {step === 'sample' && (
          <button className="btn btn-orange" onClick={() => setStep('triage')}
                  style={{ opacity: selectedSample ? 1 : 0.4, pointerEvents: selectedSample ? 'auto' : 'none' }}>
            Next: Check urgency →
          </button>
        )}
        {step === 'triage' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('sample')}>←</button>
            <button className="btn flex-1"
                    onClick={handleTriageDone}
                    style={{
                      background: isAsap ? '#DC2626' : 'var(--orange)',
                      color: '#fff',
                      opacity: alreadyCollected !== null && (alreadyCollected ? !!timeSinceId : !!readySoonId) ? 1 : 0.4,
                      pointerEvents: alreadyCollected !== null && (alreadyCollected ? !!timeSinceId : !!readySoonId) ? 'auto' : 'none',
                    }}>
              {alreadyCollected && timeSinceId && determineUrgency(selectedSample!, timeSinceId)
                ? '🚨 Continue as Priority →'
                : 'Next: Choose a lab →'}
            </button>
          </div>
        )}
        {step === 'lab' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('triage')}>←</button>
            <button className="btn flex-1"
                    onClick={() => setStep('schedule')}
                    style={{
                      background: isAsap ? '#DC2626' : 'var(--orange)',
                      color: '#fff',
                      opacity: selectedLab ? 1 : 0.4,
                      pointerEvents: selectedLab ? 'auto' : 'none',
                    }}>
              Next: {isAsap ? 'Pickup address' : 'Schedule pickup'} →
            </button>
          </div>
        )}
        {step === 'schedule' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('lab')}>←</button>
            <button className="btn flex-1"
                    onClick={() => setStep('payment')}
                    style={{
                      background: isAsap ? '#DC2626' : 'var(--orange)',
                      color: '#fff',
                      opacity: (isAsap ? address.trim() : (timeSlot && address.trim())) ? 1 : 0.4,
                      pointerEvents: (isAsap ? address.trim() : (timeSlot && address.trim())) ? 'auto' : 'none',
                    }}>
              Review & Pay →
            </button>
          </div>
        )}
        {step === 'payment' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 20px' }}
                    onClick={() => setStep('schedule')}>←</button>
            <button className="btn flex-1" onClick={handlePay}
                    style={{ background: isAsap ? '#DC2626' : 'var(--orange)', color: '#fff' }}>
              {isAsap ? '🚨 ' : '💳 '}Pay KES {totalFee.toLocaleString()} via M-Pesa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
