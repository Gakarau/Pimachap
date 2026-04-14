'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBooking } from '@/lib/booking-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TimeSlot {
  id: string
  label: string
  start_time: string
  end_time: string
}

function getTomorrow() {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

export default function SchedulePage() {
  const { selectedLab, schedule, setSchedule } = useBooking()
  const router = useRouter()
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [date, setDate] = useState(getTomorrow())
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [address, setAddress] = useState('')
  const [landmark, setLandmark] = useState('')

  useEffect(() => {
    async function fetchSlots() {
      const { data } = await supabase
        .from('time_slots')
        .select('*')
        .eq('is_active', true)
        .order('start_time')
      if (data) setSlots(data)
    }
    fetchSlots()
  }, [])

  const proceed = () => {
    if (!selectedSlot || !address.trim()) return
    setSchedule({
      date,
      timeSlotId: selectedSlot.id,
      timeSlotLabel: selectedSlot.label,
      addressLine: address,
      landmark,
    })
    router.push('/delivery')
  }

  if (!selectedLab) {
    return (
      <div className="animate-fade-up p-10 text-center">
        <div className="text-5xl mb-4">🏥</div>
        <div className="text-lg font-extrabold mb-2">No lab selected</div>
        <Link href="/results" className="btn btn-teal block text-center no-underline">Choose a lab first →</Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up min-h-screen">
      <div className="flex items-center justify-between px-5 pt-4 mb-1">
        <Link href="/results" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline bg-white border-[1.5px] border-[var(--border)]"
              style={{ boxShadow: 'var(--sh)' }}>←</Link>
        <div className="logo-text">PIMA<span>CHAP</span></div>
        <div className="w-[38px]" />
      </div>

      {/* Progress bar */}
      <div className="mx-5 mt-3 h-1 rounded-full bg-[var(--border)]">
        <div className="h-full rounded-full w-[33%]" style={{ background: 'linear-gradient(90deg, var(--teal), var(--teal-light))' }} />
      </div>
      <div className="px-5 pt-1.5 text-[11px] font-semibold text-[var(--text-soft)] uppercase tracking-wider">Step 1 of 3 · Schedule Collection</div>

      <div className="px-5 pb-28">
        <h2 className="text-[22px] font-extrabold leading-tight mt-5 mb-1">When should we come?</h2>
        <p className="text-[13px] text-[var(--text-soft)] mb-5">{selectedLab.name} · {selectedLab.town}</p>

        {/* Date */}
        <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Collection Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} min={getTomorrow()}
               className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--teal)] mb-4"
               style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

        {/* Time slots */}
        <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Preferred Time Slot</label>
        <div className="grid grid-cols-3 gap-2 mb-5">
          {slots.map(s => (
            <button key={s.id} onClick={() => setSelectedSlot(s)}
                    className="py-3 px-2 rounded-xl text-[12px] font-bold border-2 cursor-pointer transition-all"
                    style={{
                      background: selectedSlot?.id === s.id ? 'var(--teal)' : 'var(--white)',
                      color: selectedSlot?.id === s.id ? '#fff' : 'var(--text-mid)',
                      borderColor: selectedSlot?.id === s.id ? 'var(--teal)' : 'var(--border)',
                    }}>
              {s.label.replace(':00 ', ' ')}
            </button>
          ))}
        </div>

        {/* Address */}
        <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Collection Address</label>
        <input type="text" value={address} onChange={e => setAddress(e.target.value)}
               placeholder="e.g. Kamakis, Eastern Bypass, Ruiru"
               className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--teal)] mb-3"
               style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

        <label className="block text-[11px] font-bold text-[var(--text-mid)] uppercase tracking-wider mb-1.5">Landmark (optional)</label>
        <input type="text" value={landmark} onChange={e => setLandmark(e.target.value)}
               placeholder="e.g. Near Total petrol station"
               className="w-full p-3.5 rounded-[var(--rsm)] border-2 border-[var(--border)] bg-white text-[15px] text-[var(--text)] outline-none focus:border-[var(--teal)] mb-4"
               style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }} />

        {/* Fasting notice */}
        <div className="rounded-[var(--rsm)] p-3 flex gap-2.5 mb-4"
             style={{ background: 'var(--amber-light)', border: '1px solid #F5D78A' }}>
          <span className="text-base">💡</span>
          <p className="text-[12px] leading-relaxed" style={{ color: '#7A5A00' }}>
            If any test requires fasting, book an early morning slot and avoid eating 8–12 hours before collection.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-[72px] md:bottom-0 left-0 right-0 w-full max-w-6xl mx-auto px-5 pb-4 pt-3 bg-white border-t-[1.5px] border-[var(--border)] z-50">
        <button className="btn btn-teal text-[15px]" onClick={proceed}
                style={{ opacity: selectedSlot && address.trim() ? 1 : 0.4, pointerEvents: selectedSlot && address.trim() ? 'auto' : 'none' }}>
          Next: How to receive results →
        </button>
      </div>
    </div>
  )
}
