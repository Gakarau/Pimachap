'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import { useBooking } from '@/lib/booking-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface LabResult {
  lab_id: string
  lab_name: string
  town: string
  rating: number
  review_count: number
  turnaround_hours: number
  total_price: number
  test_count: number
  discount: number
  final_price: number
}

export default function ResultsPage() {
  const { cart } = useCart()
  const { setSelectedLab } = useBooking()
  const router = useRouter()
  const [labs, setLabs] = useState<LabResult[]>([])
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState<'price' | 'rating' | 'turnaround'>('price')

  useEffect(() => {
    if (cart.length === 0) return
    async function fetchLabs() {
      const testIds = cart.map(t => t.id)
      const { data } = await supabase
        .from('lab_test_pricing')
        .select(`
          lab_id,
          price_kes,
          turnaround_hours,
          labs!inner (
            id, name, town, rating, review_count, turnaround_hours, is_active
          )
        `)
        .in('test_id', testIds)
        .eq('is_available', true)

      if (!data) { setLoading(false); return }

      // Group by lab and sum prices
      const labMap: Record<string, { prices: number[]; lab: { id: string; name: string; town: string; rating: number; review_count: number; turnaround_hours: number } }> = {}
      data.forEach((row: Record<string, unknown>) => {
        const lab = row.labs as { id: string; name: string; town: string; rating: number; review_count: number; turnaround_hours: number }
        const labId = row.lab_id as string
        if (!labMap[labId]) {
          labMap[labId] = { prices: [], lab }
        }
        labMap[labId].prices.push(row.price_kes as number)
      })

      // Build results - only include labs that have ALL tests
      const results: LabResult[] = Object.entries(labMap)
        .filter(([, v]) => v.prices.length === cart.length)
        .map(([labId, v]) => {
          const total = v.prices.reduce((s, p) => s + p, 0)
          const discount = cart.length >= 2 ? Math.round(total * 0.05) : 0
          return {
            lab_id: labId,
            lab_name: v.lab.name,
            town: v.lab.town,
            rating: v.lab.rating,
            review_count: v.lab.review_count,
            turnaround_hours: v.lab.turnaround_hours,
            total_price: total,
            test_count: v.prices.length,
            discount,
            final_price: total - discount,
          }
        })

      setLabs(results)
      setLoading(false)
    }
    fetchLabs()
  }, [cart])

  const sorted = [...labs].sort((a, b) => {
    if (sort === 'price') return a.final_price - b.final_price
    if (sort === 'rating') return b.rating - a.rating
    return a.turnaround_hours - b.turnaround_hours
  })

  const selectLab = (lab: LabResult) => {
    setSelectedLab({
      id: lab.lab_id,
      name: lab.lab_name,
      town: lab.town,
      rating: lab.rating,
      total_price: lab.final_price,
      turnaround_hours: lab.turnaround_hours,
    })
    router.push('/schedule')
  }

  if (cart.length === 0) {
    return (
      <div className="animate-fade-up p-10 text-center">
        <div className="text-5xl mb-4">🛒</div>
        <div className="text-lg font-extrabold mb-2">No tests selected</div>
        <div className="text-[13px] text-[var(--text-soft)] mb-6">Add tests to your basket first</div>
        <Link href="/search" className="btn btn-teal block text-center no-underline">Search for tests →</Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-up min-h-screen">
      {/* Header */}
      <div style={{ background: 'var(--teal-dark)', padding: '16px 20px 18px' }}>
        <div className="flex items-center justify-between mb-2.5">
          <Link href="/cart" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline"
                style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>←</Link>
          <span className="text-[13px] font-bold text-white/80">Choose a Lab</span>
          <Link href="/cart" className="text-[13px] text-[var(--amber)] font-bold no-underline">Edit tests</Link>
        </div>
        {/* Test pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2.5" style={{ scrollbarWidth: 'none' }}>
          {cart.map(t => (
            <span key={t.id} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold text-white whitespace-nowrap"
                  style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)' }}>
              {t.name}
            </span>
          ))}
        </div>
        {/* Sort pills */}
        <div className="flex gap-2 mt-1">
          {(['price', 'rating', 'turnaround'] as const).map(s => (
            <button key={s} onClick={() => setSort(s)}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold border-none cursor-pointer"
                    style={{
                      background: sort === s ? 'var(--amber)' : 'rgba(255,255,255,.15)',
                      color: sort === s ? 'var(--teal-dark)' : '#fff',
                      border: sort === s ? 'none' : '1.5px solid rgba(255,255,255,.25)',
                    }}>
              {s === 'price' ? '💰 Price' : s === 'rating' ? '⭐ Rating' : '⚡ Speed'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-6">
        {loading ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-4 animate-pulse">🔬</div>
            <div className="text-[13px] text-[var(--text-soft)]">Finding labs with your tests...</div>
          </div>
        ) : sorted.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-4">😔</div>
            <div className="text-lg font-extrabold mb-2">No labs found</div>
            <div className="text-[13px] text-[var(--text-soft)] leading-relaxed">
              No lab in our network carries all {cart.length} tests yet.<br />
              Try removing a test or <span className="text-[var(--teal)] font-bold cursor-pointer">contact us on WhatsApp</span>.
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center px-5 py-3">
              <span className="text-[13px] font-bold">{sorted.length} lab{sorted.length > 1 ? 's' : ''} available</span>
              <span className="text-[12px] text-[var(--teal)] font-bold px-3 py-1.5 rounded-full" style={{ background: 'var(--teal-pale)' }}>
                {cart.length} test{cart.length > 1 ? 's' : ''}
              </span>
            </div>
            {sorted.map((lab, i) => (
              <div key={lab.lab_id} className="mx-5 mb-3.5 rounded-[var(--r)] border-[1.5px] overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                   style={{ borderColor: i === 0 ? 'var(--teal)' : 'var(--border)', background: 'var(--white)', boxShadow: 'var(--sh)' }}
                   onClick={() => selectLab(lab)}>
                {i === 0 && (
                  <div className="text-[10px] font-bold py-1.5 px-3.5 tracking-wider text-white"
                       style={{ background: 'linear-gradient(90deg, var(--teal-dark), var(--teal))' }}>
                    ⭐ BEST VALUE
                  </div>
                )}
                <div className="p-4">
                  <div className="flex gap-3 items-start mb-3.5">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 border-[1.5px] border-[var(--border)]">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-extrabold mb-0.5">{lab.lab_name}</div>
                      <div className="text-[11px] text-[var(--text-soft)] mb-1.5">{lab.town}</div>
                      <div className="flex gap-1.5 flex-wrap">
                        <span className="tag tag-green">★ {lab.rating}</span>
                        <span className="tag tag-teal">{lab.turnaround_hours}h results</span>
                        {lab.discount > 0 && <span className="tag tag-amber">5% bundle off</span>}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xl font-extrabold text-[var(--teal)]">KES {lab.final_price.toLocaleString()}</div>
                      <div className="text-[10px] text-[var(--text-soft)] mt-0.5">{lab.test_count} tests{lab.discount > 0 ? ' · 5% off' : ''}</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-2.5 border-t border-[var(--border)] flex justify-between items-center" style={{ background: 'var(--bg)' }}>
                  <span className="text-[12px] font-bold text-[var(--green)]">● Available today</span>
                  <span className="px-4 py-2 rounded-full bg-[var(--teal)] text-white text-[12px] font-bold">
                    Select →
                  </span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
