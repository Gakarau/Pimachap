'use client'
import { useState } from 'react'
import Link from 'next/link'

type Step = 'sample' | 'status' | 'lab' | 'address' | 'payment' | 'confirm'

const SAMPLE_TYPES = [
  { id: 'stool',  icon: '🧫', label: 'Stool',             desc: 'Use sealed collection container',      urgent: true  },
  { id: 'urine',  icon: '💧', label: 'Urine',             desc: 'Midstream, clean container',           urgent: false },
  { id: 'semen',  icon: '🧪', label: 'Semen',             desc: '2–5 days abstinence required',         urgent: true  },
  { id: 'sputum', icon: '😮‍💨', label: 'Sputum',            desc: 'Early morning, deep cough sample',     urgent: true  },
  { id: 'swab',   icon: '🔬', label: 'Swab',              desc: 'Nasal, throat or wound — pre-taken',   urgent: false },
  { id: 'blood',  icon: '🩸', label: 'Blood (pre-drawn)', desc: 'EDTA or plain tube, sealed & labelled', urgent: true  },
]

const READY_WINDOWS = [
  { id: 'now',       label: 'Ready now',              sub: 'I\'ll be home when rider arrives' },
  { id: 'within_1h', label: 'Within the next hour',   sub: 'Rider arrives ~1 hour from now' },
  { id: 'in_2h',     label: 'In about 2 hours',       sub: 'Rider arrives ~2 hours from now' },
  { id: 'today_pm',  label: 'This afternoon',         sub: 'Schedule for 2 PM – 5 PM today' },
  { id: 'tomorrow',  label: 'Tomorrow morning',       sub: 'Schedule for 7 AM – 10 AM tomorrow' },
]

const MOCK_LABS = [
  { id: 'l1', name: 'Lancet Kenya – Westlands',         town: 'Westlands',  rating: 4.8, price: 350, turnaround: 4,  asap: true  },
  { id: 'l2', name: 'Aga Khan Diagnostics – Parklands', town: 'Parklands',  rating: 4.9, price: 400, turnaround: 3,  asap: true  },
  { id: 'l3', name: 'PathCare – Karen',                  town: 'Karen',      rating: 4.7, price: 300, turnaround: 6,  asap: false },
  { id: 'l4', name: 'Nairobi Hospital Lab',              town: 'Upper Hill', rating: 4.6, price: 280, turnaround: 8,  asap: false },
]

function generateOrderNumber() {
  const now = new Date()
  return `PCH-RS-${now.getFullYear().toString().slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, '0')}`
}

const STEP_LABELS: Record<Step, string> = {
  sample: 'Sample', status: 'Status', lab: 'Lab', address: 'Address', payment: 'Pay', confirm: 'Done'
}
const STEP_ORDER: Step[] = ['sample', 'status', 'lab', 'address', 'payment', 'confirm']

export default function ReadySamplePage() {
  const [step, setStep] = useState<Step>('sample')
  const [selectedSample, setSelectedSample] = useState<typeof SAMPLE_TYPES[number] | null>(null)

  // Status triage
  const [alreadyCollected, setAlreadyCollected] = useState<boolean | null>(null)
  const [readyWindowId, setReadyWindowId]   = useState<string | null>(null)

  // Booking details
  const [selectedLab, setSelectedLab] = useState<typeof MOCK_LABS[number] | null>(null)
  const [address, setAddress]         = useState('')
  const [landmark, setLandmark]       = useState('')
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  // ASAP = already collected (regardless of sample type — user signals urgency by saying it's ready)
  const isAsap = alreadyCollected === true

  const normalRiderFee = 250
  const asapRiderFee   = 450
  const riderFee       = isAsap ? asapRiderFee : normalRiderFee
  const totalFee       = (selectedLab?.price || 0) + riderFee

  const currentStepIndex = STEP_ORDER.indexOf(step)

  const pickupTimingLabel = () => {
    if (isAsap) return 'ASAP — rider dispatched immediately'
    const w = READY_WINDOWS.find(r => r.id === readyWindowId)
    return w ? w.sub : '—'
  }

  // ── Confirmation ──────────────────────────────────────────────────────
  if (step === 'confirm' && orderNumber && selectedLab) {
    return (
      <div className="animate-fade-up min-h-screen">
        <div className="text-center py-10 px-5"
             style={{ background: isAsap
               ? 'linear-gradient(145deg, #B91C1C, #EF4444)'
               : 'linear-gradient(145deg, var(--orange), #FB923C)' }}>
          <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-4xl mx-auto mb-4">
            {isAsap ? '🚨' : '✓'}
          </div>
          <div className="text-2xl font-extrabold text-white mb-2">
            {isAsap ? 'Priority Pickup Booked!' : 'Pickup Scheduled!'}
          </div>
          {isAsap && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-[12px] font-bold"
                 style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}>
              🏍️ Rider on the way · ETA 30 min
            </div>
          )}
          <div className="text-[13px] text-white/70 leading-relaxed mb-3">
            {pickupTimingLabel()} · {selectedLab.name}
          </div>
          <div className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1.5 text-[12px] font-bold text-white tracking-wider">
            {orderNumber}
          </div>
        </div>

        <div className="px-4 pb-10 mt-5">
          {isAsap && (
            <div className="rounded-[var(--r)] p-4 mb-4 flex gap-3"
                 style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
              <span className="text-xl">⏱️</span>
              <div>
                <div className="text-[13px] font-extrabold mb-1" style={{ color: '#991B1B' }}>Keep sample ready</div>
                <div className="text-[12px] leading-relaxed" style={{ color: '#7F1D1D' }}>
                  Keep the sample sealed at room temperature. Do not refrigerate unless specified. Rider arrives within 30 minutes.
                </div>
              </div>
            </div>
          )}

          <div className="card">
            {[
              { icon: '🧫', label: 'Sample',       value: selectedSample?.label || '' },
              { icon: '🏥', label: 'Lab',           value: `${selectedLab.name} · ${selectedLab.town}` },
              { icon: isAsap ? '🚨' : '📅', label: 'Pickup', value: pickupTimingLabel() },
              { icon: '📍', label: 'Pickup from',  value: address },
              { icon: '💳', label: 'Total Paid',   value: `KES ${totalFee.toLocaleString()} · M-Pesa ✓` },
              { icon: '⏱️', label: 'Results ETA',  value: `~${selectedLab.turnaround}h after drop-off` },
            ].map(row => (
              <div key={row.label} className="flex gap-2.5 items-start py-2.5 border-b border-[var(--border)] last:border-none">
                <span className="text-lg">{row.icon}</span>
                <div>
                  <div className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-soft)' }}>{row.label}</div>
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
          ? 'linear-gradient(135deg, #B91C1C, #EF4444)'
          : 'linear-gradient(135deg, var(--orange), #FB923C)',
        padding: '16px 20px 22px',
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
        <div className="h-1.5 rounded-full mb-2" style={{ background: 'rgba(255,255,255,.25)' }}>
          <div className="h-full rounded-full transition-all duration-300"
               style={{ width: `${(currentStepIndex / (STEP_ORDER.length - 1)) * 100}%`, background: 'rgba(255,255,255,.9)' }} />
        </div>
        <div className="flex justify-between">
          {STEP_ORDER.filter(s => s !== 'confirm').map((s, i) => (
            <span key={s} className="text-[10px] font-bold capitalize"
                  style={{ color: i <= currentStepIndex ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.35)' }}>
              {STEP_LABELS[s]}
            </span>
          ))}
        </div>

        {isAsap && step !== 'sample' && step !== 'status' && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
               style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)' }}>
            <span className="animate-pulse">🚨</span>
            <span className="text-[12px] font-extrabold text-white">PRIORITY — sample already collected, rider on standby</span>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-5 pt-5 pb-40">

        {/* ── Step 1: Sample Type ── */}
        {step === 'sample' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">What type of sample?</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>Select the sample you have or are preparing.</p>

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
                  {s.urgent && (
                    <div className="mt-2">
                      <span className="tag tag-coral" style={{ fontSize: '9px' }}>⚡ Time-sensitive</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── Step 2: Sample Status ── */}
        {step === 'status' && selectedSample && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Is the sample collected?</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>
              This determines whether we dispatch a rider now or schedule a pickup.
            </p>

            {/* Yes / No cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              <div onClick={() => { setAlreadyCollected(true); setReadyWindowId(null) }}
                   className="rounded-[var(--r)] border-2 p-5 cursor-pointer transition-all"
                   style={{
                     background: alreadyCollected === true ? '#FEF2F2' : 'var(--white)',
                     borderColor: alreadyCollected === true ? '#DC2626' : 'var(--border)',
                     boxShadow: 'var(--sh)',
                   }}>
                <div className="text-3xl mb-3">✅</div>
                <div className="text-[15px] font-extrabold mb-1">Yes, it&apos;s ready</div>
                <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  Sample is collected and sealed. Rider dispatched immediately.
                </div>
                {alreadyCollected === true && (
                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl"
                       style={{ background: '#FEF2F2', border: '1px solid #FCA5A5' }}>
                    <span>🚨</span>
                    <div>
                      <div className="text-[12px] font-extrabold" style={{ color: '#991B1B' }}>Priority dispatch</div>
                      <div className="text-[11px]" style={{ color: '#991B1B' }}>Urgency fee: +KES {asapRiderFee - normalRiderFee} on rider fee</div>
                    </div>
                  </div>
                )}
              </div>

              <div onClick={() => { setAlreadyCollected(false); setReadyWindowId(null) }}
                   className="rounded-[var(--r)] border-2 p-5 cursor-pointer transition-all"
                   style={{
                     background: alreadyCollected === false ? 'var(--teal-pale)' : 'var(--white)',
                     borderColor: alreadyCollected === false ? 'var(--teal)' : 'var(--border)',
                     boxShadow: 'var(--sh)',
                   }}>
                <div className="text-3xl mb-3">⏳</div>
                <div className="text-[15px] font-extrabold mb-1">Not yet collected</div>
                <div className="text-[12px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>
                  I&apos;ll collect it soon. Tell us when it&apos;ll be ready.
                </div>
              </div>
            </div>

            {/* When will it be ready? (only if not yet collected) */}
            {alreadyCollected === false && (
              <>
                <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-soft)' }}>
                  When will the sample be ready for pickup?
                </div>
                <div className="flex flex-col gap-2">
                  {READY_WINDOWS.map(w => (
                    <div key={w.id} onClick={() => setReadyWindowId(w.id)}
                         className="rounded-[var(--rsm)] border-2 px-4 py-3.5 cursor-pointer transition-all flex items-center justify-between"
                         style={{
                           background: readyWindowId === w.id ? 'var(--teal-pale)' : 'var(--white)',
                           borderColor: readyWindowId === w.id ? 'var(--teal)' : 'var(--border)',
                         }}>
                      <div>
                        <div className="text-[13px] font-bold">{w.label}</div>
                        <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-soft)' }}>{w.sub}</div>
                      </div>
                      {readyWindowId === w.id && (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                              style={{ background: 'var(--teal)' }}>✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Step 3: Lab ── */}
        {step === 'lab' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Choose a lab</h2>
            <p className="text-[13px] mb-1" style={{ color: 'var(--text-soft)' }}>Rider drops your sample directly at the lab.</p>
            {isAsap && (
              <div className="text-[12px] font-bold mb-4 px-3 py-2 rounded-xl" style={{ background: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5' }}>
                🚨 Showing ASAP-capable labs first
              </div>
            )}
            {!isAsap && <div className="mb-5" />}

            {[...MOCK_LABS].sort((a, b) => isAsap ? (Number(b.asap) - Number(a.asap)) : 0).map((lab, i) => (
              <div key={lab.id} onClick={() => setSelectedLab(lab)}
                   className="rounded-[var(--r)] border-2 overflow-hidden mb-3 cursor-pointer transition-all"
                   style={{
                     borderColor: selectedLab?.id === lab.id ? 'var(--teal)' : 'var(--border)',
                     background: 'var(--white)',
                     boxShadow: 'var(--sh)',
                     opacity: isAsap && !lab.asap ? 0.55 : 1,
                   }}>
                {i === 0 && (
                  <div className="text-[10px] font-bold py-1.5 px-3.5 tracking-wider text-white"
                       style={{ background: isAsap ? 'linear-gradient(90deg, #B91C1C, #EF4444)' : 'linear-gradient(90deg, var(--teal-dark), var(--teal))' }}>
                    {isAsap ? '🚨 PRIORITY DISPATCH' : '⭐ BEST VALUE'}
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
                <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-between items-center" style={{ background: 'var(--bg)' }}>
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

        {/* ── Step 4: Address only — timing is already set from triage ── */}
        {step === 'address' && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">
              {isAsap ? 'Where should we pick up?' : 'Pickup address'}
            </h2>

            {isAsap ? (
              <div className="rounded-[var(--r)] p-4 mb-5 flex gap-3"
                   style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                <span className="text-xl">🚨</span>
                <div>
                  <div className="text-[13px] font-extrabold mb-0.5" style={{ color: '#991B1B' }}>Priority dispatch</div>
                  <div className="text-[12px]" style={{ color: '#7F1D1D' }}>
                    Rider will be dispatched to this address immediately after payment. ETA: 30 minutes.
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-[var(--rsm)] p-3.5 mb-5 flex gap-2.5"
                   style={{ background: 'var(--teal-pale)', border: '1.5px solid var(--teal)' }}>
                <span>📅</span>
                <div>
                  <div className="text-[12px] font-bold" style={{ color: 'var(--teal-dark)' }}>
                    Pickup: {READY_WINDOWS.find(w => w.id === readyWindowId)?.sub}
                  </div>
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-mid)' }}>
                    Rider will arrive at this address at the scheduled time
                  </div>
                </div>
              </div>
            )}

            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
              Pickup Address
            </label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                   placeholder="e.g. Kamakis, Eastern Bypass, Ruiru"
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 bg-white text-[15px] outline-none mb-4"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', borderColor: 'var(--border)' }} />

            <label className="block text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-mid)' }}>
              Landmark (optional)
            </label>
            <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
                   placeholder="e.g. Near Total petrol station"
                   className="w-full p-3.5 rounded-[var(--rsm)] border-2 bg-white text-[15px] outline-none"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', color: 'var(--text)', borderColor: 'var(--border)' }} />
          </>
        )}

        {/* ── Step 5: Payment ── */}
        {step === 'payment' && selectedLab && (
          <>
            <h2 className="text-[22px] font-extrabold mb-1">Review &amp; Pay</h2>
            <p className="text-[13px] mb-5" style={{ color: 'var(--text-soft)' }}>
              {isAsap ? 'Priority pickup · ' : 'Scheduled pickup · '}{selectedLab.name}
            </p>

            {isAsap && (
              <div className="rounded-[var(--r)] p-3.5 mb-4 flex gap-2.5"
                   style={{ background: '#FEF2F2', border: '1.5px solid #FCA5A5' }}>
                <span>🚨</span>
                <p className="text-[12px] font-bold" style={{ color: '#991B1B' }}>
                  Priority order — rider dispatched immediately after payment confirmation
                </p>
              </div>
            )}

            <div className="card">
              {[
                { icon: '🧫', label: 'Sample',      value: selectedSample?.label || '' },
                { icon: '🏥', label: 'Lab',          value: `${selectedLab.name} · ${selectedLab.town}` },
                { icon: isAsap ? '🚨' : '📅', label: 'Dispatch', value: pickupTimingLabel() },
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
              <div className="rounded-xl p-3 mt-3 flex justify-between items-center"
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

      {/* ── CTA Bar — sits above BottomNav ── */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 w-full max-w-6xl mx-auto px-4 sm:px-5 pb-4 pt-3 bg-white border-t-[1.5px] border-[var(--border)] z-50">

        {step === 'sample' && (
          <button className="btn btn-orange" onClick={() => setStep('status')}
                  style={{ opacity: selectedSample ? 1 : 0.4, pointerEvents: selectedSample ? 'auto' : 'none' }}>
            Next →
          </button>
        )}

        {step === 'status' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 18px' }}
                    onClick={() => setStep('sample')}>←</button>
            <button className="btn flex-1"
                    onClick={() => setStep('lab')}
                    style={{
                      background: isAsap ? '#DC2626' : 'var(--orange)',
                      color: '#fff',
                      opacity: alreadyCollected !== null && (alreadyCollected || !!readyWindowId) ? 1 : 0.4,
                      pointerEvents: alreadyCollected !== null && (alreadyCollected || !!readyWindowId) ? 'auto' : 'none',
                    }}>
              {isAsap ? '🚨 Proceed as Priority →' : 'Choose a lab →'}
            </button>
          </div>
        )}

        {step === 'lab' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 18px' }}
                    onClick={() => setStep('status')}>←</button>
            <button className="btn flex-1"
                    onClick={() => setStep('address')}
                    style={{
                      background: isAsap ? '#DC2626' : 'var(--orange)',
                      color: '#fff',
                      opacity: selectedLab ? 1 : 0.4,
                      pointerEvents: selectedLab ? 'auto' : 'none',
                    }}>
              Next: Pickup address →
            </button>
          </div>
        )}

        {step === 'address' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 18px' }}
                    onClick={() => setStep('lab')}>←</button>
            <button className="btn flex-1"
                    onClick={() => setStep('payment')}
                    style={{
                      background: isAsap ? '#DC2626' : 'var(--orange)',
                      color: '#fff',
                      opacity: address.trim() ? 1 : 0.4,
                      pointerEvents: address.trim() ? 'auto' : 'none',
                    }}>
              Review &amp; Pay →
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="flex gap-2">
            <button className="btn shrink-0" style={{ background: 'var(--bg)', color: 'var(--text-mid)', fontWeight: 600, width: 'auto', padding: '16px 18px' }}
                    onClick={() => setStep('address')}>←</button>
            <button className="btn flex-1"
                    onClick={() => { setOrderNumber(generateOrderNumber()); setStep('confirm') }}
                    style={{ background: isAsap ? '#DC2626' : 'var(--orange)', color: '#fff' }}>
              {isAsap ? '🚨 ' : '💳 '}Pay KES {totalFee.toLocaleString()} via M-Pesa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
