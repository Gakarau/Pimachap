'use client'
import { useCart } from '@/lib/cart-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const sampleIcons: Record<string, string> = {
  blood: '🩸', urine: '💧', stool: '🧫', swab: '🔬', sputum: '😮‍💨', other: '🧪'
}

export default function CartPage() {
  const { cart, removeFromCart } = useCart()
  const router = useRouter()

  const sampleGroups: Record<string, string[]> = {}
  cart.forEach(t => {
    const s = t.sample_type
    if (!sampleGroups[s]) sampleGroups[s] = []
    sampleGroups[s].push(t.name)
  })

  const estimatedPerTest = 1000
  const rawTotal = cart.length * estimatedPerTest
  const discount = cart.length >= 2 ? Math.round(rawTotal * 0.05) : 0
  const riderFee = 300
  const grandTotal = rawTotal - discount + riderFee

  return (
    <div className="animate-fade-up min-h-screen">
      <div style={{ background: 'var(--teal-dark)', padding: '16px 20px 18px' }}>
        <div className="flex items-center justify-between mb-1">
          <Link href="/search" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline"
                style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>←</Link>
          <span className="text-[13px] font-bold text-white/80">Your Test Basket</span>
          <Link href="/search" className="text-[13px] text-[var(--amber)] font-bold no-underline">+ Add more</Link>
        </div>
        <div className="text-[11px] text-white/50 pl-0.5">{cart.length} test{cart.length !== 1 ? 's' : ''} selected</div>
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {cart.length === 0 ? (
          <div className="p-16 text-center">
            <div className="text-5xl mb-4">🛒</div>
            <div className="text-lg font-extrabold mb-2">Your basket is empty</div>
            <div className="text-[13px] text-[var(--text-soft)] mb-6">Search for tests to add them here</div>
            <Link href="/search" className="no-underline"><button className="btn btn-teal">Search for tests →</button></Link>
          </div>
        ) : (
          <>
            <div className="px-5 pt-4">
              {cart.map(t => (
                <div key={t.id} className="bg-white rounded-[var(--r)] border-[1.5px] border-[var(--border)] p-4 mb-2.5 flex items-center gap-3"
                     style={{ boxShadow: 'var(--sh)' }}>
                  <div className="w-[42px] h-[42px] rounded-[11px] flex items-center justify-center text-xl shrink-0" style={{ background: 'var(--teal-pale)' }}>
                    {sampleIcons[t.sample_type] || '🧪'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-extrabold truncate">
                      {t.name}
                      {t.preparation_instructions?.toLowerCase().includes('fast') && (
                        <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'var(--amber-light)', color: '#9A6500' }}>Fasting</span>
                      )}
                    </div>
                    <div className="text-[11px] text-[var(--text-soft)] mt-0.5 capitalize">{t.sample_type.replace(/_/g, ' ')}</div>
                  </div>
                  <button onClick={() => removeFromCart(t.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer text-sm font-extrabold shrink-0 border-none"
                          style={{ background: 'var(--red-pale)', color: 'var(--red)' }}>✕</button>
                </div>
              ))}
            </div>

            <div className="mx-5 mb-3">
              <div className="text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-2.5">Collection summary — one visit</div>
              {Object.entries(sampleGroups).map(([sample, testNames]) => {
                const needsPhleb = sample === 'blood'
                return (
                  <div key={sample} className="bg-white rounded-[var(--rsm)] border-[1.5px] border-[var(--border)] p-2.5 px-3 mb-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-[15px]">{needsPhleb ? '🩸' : '🧫'}</span>
                      <span className="text-[12px] font-extrabold capitalize">{sample}</span>
                      <span className={`tag ${needsPhleb ? 'tag-red' : 'tag-green'}`} style={{ fontSize: '9px' }}>
                        {needsPhleb ? 'Phlebotomist needed' : 'Self-collect'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[var(--text-soft)]">{testNames.join(', ')}</div>
                  </div>
                )
              })}
            </div>

            {cart.length >= 2 && (
              <div className="mx-5 mb-3">
                <div className="rounded-[var(--r)] p-3 px-3.5 flex gap-2.5 items-center" style={{ background: 'var(--green-pale)', border: '1.5px solid #A7F3D0' }}>
                  <div className="text-xl">🎉</div>
                  <div>
                    <div className="text-[13px] font-extrabold" style={{ color: '#065F46' }}>Bundle discount applied!</div>
                    <div className="text-[11px] mt-0.5" style={{ color: '#065F46' }}>All tests at same lab — 5% off (KES {discount.toLocaleString()} saved)</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mx-5 mb-4">
              <div className="bg-white rounded-[var(--r)] border-[1.5px] border-[var(--border)] p-3.5 px-4" style={{ boxShadow: 'var(--sh)' }}>
                <div className="text-[12px] font-bold text-[var(--text-soft)] uppercase tracking-wider mb-2.5">Estimated fees</div>
                {cart.map(t => (
                  <div key={t.id} className="flex justify-between items-center py-1.5 text-[13px] border-b border-[var(--border)]">
                    <span className="text-[var(--text-mid)]">{sampleIcons[t.sample_type] || '🧪'} {t.name}</span>
                    <span className="font-bold">~KES {estimatedPerTest.toLocaleString()}</span>
                  </div>
                ))}
                {discount > 0 && (
                  <div className="flex justify-between py-1.5 text-[13px] font-bold" style={{ color: 'var(--green)' }}>
                    <span>🎉 Bundle discount (5%)</span><span>-KES {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 text-[13px] border-t border-[var(--border)] mt-1">
                  <span className="text-[var(--text-mid)]">🏍 Phlebotomist rider (1 visit)</span>
                  <span className="font-bold">KES {riderFee.toLocaleString()}</span>
                </div>
                <div className="border-t-2 border-[var(--border)] mt-2.5 pt-2.5 flex justify-between items-center">
                  <div className="text-sm font-extrabold">Total (est.)</div>
                  <div className="text-xl font-extrabold text-[var(--teal)]">KES {grandTotal.toLocaleString()}</div>
                </div>
                <div className="text-[10px] text-[var(--text-soft)] mt-1.5 leading-relaxed">* Final fees confirmed when you choose a lab. Rider fee: KES 300 per visit.</div>
              </div>
            </div>
          </>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 w-full max-w-6xl mx-auto px-5 pb-6 pt-3.5 bg-white border-t-[1.5px] border-[var(--border)] z-50">
          <button className="btn btn-teal text-[15px]" onClick={() => router.push('/results')}>
            Find labs for {cart.length} test{cart.length > 1 ? 's' : ''} →
          </button>
        </div>
      )}
    </div>
  )
}
