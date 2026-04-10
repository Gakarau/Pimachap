'use client'
import { useBooking } from '@/lib/booking-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DeliveryPage() {
  const { selectedLab, delivery, setDelivery } = useBooking()
  const router = useRouter()

  if (!selectedLab) {
    return (
      <div className="animate-fade-up p-10 text-center">
        <div className="text-5xl mb-4">🏥</div>
        <div className="text-lg font-extrabold mb-2">No lab selected</div>
        <Link href="/search" className="no-underline"><button className="btn btn-teal">Start over →</button></Link>
      </div>
    )
  }

  const anySelected = delivery.whatsapp || delivery.email || delivery.doctor
  const proceed = () => {
    if (!anySelected) return
    router.push('/payment')
  }

  return (
    <div className="animate-fade-up min-h-screen">
      <div className="flex items-center justify-between px-5 pt-4 mb-1">
        <Link href="/schedule" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline bg-white border-[1.5px] border-[var(--border)]"
              style={{ boxShadow: 'var(--sh)' }}>←</Link>
        <div className="logo-text">PIMA<span>CHAP</span></div>
        <div className="w-[38px]" />
      </div>

      <div className="mx-5 mt-3 h-1 rounded-full bg-[var(--border)]">
        <div className="h-full rounded-full w-[66%]" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-light))' }} />
      </div>
      <div className="px-5 pt-1.5 text-[11px] font-semibold text-[var(--text-soft)] uppercase tracking-wider">Step 2 of 3 · Results Delivery</div>

      <div className="px-5 pb-28">
        <h2 className="text-[22px] font-extrabold leading-tight mt-5 mb-1">How should we send your results?</h2>
        <p className="text-[13px] text-[var(--text-soft)] mb-6">Select all that apply — everyone you choose gets the PDF.</p>

        <div className="text-[10px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-2.5">📋 Send to me</div>

        {/* WhatsApp */}
        <div className={`rounded-[var(--r)] border-2 p-4 flex items-center gap-3 mb-2.5 cursor-pointer transition-all ${delivery.whatsapp ? 'border-[var(--teal)] bg-[var(--teal-pale)]' : 'border-[var(--border)] bg-white'}`}
             onClick={() => setDelivery({ ...delivery, whatsapp: !delivery.whatsapp })}>
          <div className="w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center text-[11px] shrink-0"
               style={{ borderColor: delivery.whatsapp ? 'var(--teal)' : 'var(--border)', background: delivery.whatsapp ? 'var(--teal)' : 'transparent', color: '#fff' }}>
            {delivery.whatsapp ? '✓' : ''}
          </div>
          <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#E7F9EE' }}>💬</div>
          <div className="flex-1">
            <div className="text-sm font-extrabold">WhatsApp me the PDF</div>
            <div className="text-[11px] text-[var(--text-soft)] mt-0.5">Sent to your booking number · Fastest</div>
          </div>
          <span className="tag tag-green">Recommended</span>
        </div>

        {/* Email */}
        <div className={`rounded-[var(--r)] border-2 p-4 flex items-center gap-3 mb-1 cursor-pointer transition-all ${delivery.email ? 'border-[var(--blue)] bg-[var(--blue-pale)]' : 'border-[var(--border)] bg-white'}`}
             onClick={() => setDelivery({ ...delivery, email: !delivery.email })}>
          <div className="w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center text-[11px] shrink-0"
               style={{ borderColor: delivery.email ? 'var(--blue)' : 'var(--border)', background: delivery.email ? 'var(--blue)' : 'transparent', color: '#fff' }}>
            {delivery.email ? '✓' : ''}
          </div>
          <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--blue-pale)' }}>📧</div>
          <div className="flex-1">
            <div className="text-sm font-extrabold">Email me the PDF</div>
            <div className="text-[11px] text-[var(--text-soft)] mt-0.5">Enter your email below</div>
          </div>
        </div>
        {delivery.email && (
          <div className="mb-2.5 p-3 bg-white border-[1.5px] border-[var(--blue)] border-t-0 rounded-b-[var(--r)]">
            <input type="email" value={delivery.emailAddress}
                   onChange={e => setDelivery({ ...delivery, emailAddress: e.target.value })}
                   placeholder="your@email.com"
                   className="w-full p-3 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--blue)]"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          </div>
        )}

        {/* Doctor */}
        <div className="text-[10px] font-bold text-[var(--text-soft)] uppercase tracking-wider mt-5 mb-2.5">👨‍⚕️ Send to my doctor</div>

        <div className={`rounded-[var(--r)] border-2 p-4 flex items-center gap-3 mb-1 cursor-pointer transition-all ${delivery.doctor ? 'border-[var(--purple)] bg-[var(--purple-pale)]' : 'border-[var(--border)] bg-white'}`}
             onClick={() => setDelivery({ ...delivery, doctor: !delivery.doctor })}>
          <div className="w-[22px] h-[22px] rounded-md border-2 flex items-center justify-center text-[11px] shrink-0"
               style={{ borderColor: delivery.doctor ? 'var(--purple)' : 'var(--border)', background: delivery.doctor ? 'var(--purple)' : 'transparent', color: '#fff' }}>
            {delivery.doctor ? '✓' : ''}
          </div>
          <div className="w-[42px] h-[42px] rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--purple-pale)' }}>👨‍⚕️</div>
          <div className="flex-1">
            <div className="text-sm font-extrabold">Send to my doctor</div>
            <div className="text-[11px] text-[var(--text-soft)] mt-0.5">Via WhatsApp or email</div>
          </div>
        </div>
        {delivery.doctor && (
          <div className="mb-2.5 p-3 bg-white border-[1.5px] border-[var(--purple)] border-t-0 rounded-b-[var(--r)]">
            <input type="text" value={delivery.doctorContact}
                   onChange={e => setDelivery({ ...delivery, doctorContact: e.target.value })}
                   placeholder="e.g. 0712 345 678 or doc@hospital.ke"
                   className="w-full p-3 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--purple)] mb-2"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
            <input type="text" value={delivery.doctorName}
                   onChange={e => setDelivery({ ...delivery, doctorName: e.target.value })}
                   placeholder="Doctor's name (optional)"
                   className="w-full p-3 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-sm outline-none focus:border-[var(--purple)]"
                   style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />
          </div>
        )}

        {/* Privacy */}
        <div className="rounded-[var(--rsm)] p-3 flex gap-2.5 mt-5"
             style={{ background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
          <span className="text-base">🔒</span>
          <p className="text-[11px] leading-relaxed text-[var(--text-mid)]">
            Results are sent as a password-protected PDF. Only contacts you list here receive them. PIMACHAP does not store or share your medical data.
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-5xl px-5 pb-6 pt-3.5 bg-white border-t-[1.5px] border-[var(--border)] z-50">
        {!anySelected && <div className="text-[12px] text-[var(--red)] text-center mb-2 font-semibold">⚠️ Please select at least one delivery channel</div>}
        <button className="btn btn-teal text-[15px]" onClick={proceed}
                style={{ opacity: anySelected ? 1 : 0.4, pointerEvents: anySelected ? 'auto' : 'none' }}>
          Review &amp; Pay →
        </button>
      </div>
    </div>
  )
}
