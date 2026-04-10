'use client'
import { useEffect, useState, useMemo, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useCart } from '@/lib/cart-context'
import Link from 'next/link'

const catIcons: Record<string, string> = {
  haematology: '🩸', diabetes: '🍬', lipids: '❤️', liver: '🫀', kidney: '🫘',
  thyroid: '🦋', infectious: '🦠', hormones: '🧬', vitamins: '☀️',
  tumour_markers: '🔵', urinalysis: '💧', microbiology: '🧫',
  biochemistry: '⚗️', serology: '🔬', coagulation: '🩸', allergy: '🤧', other: '🧪'
}

const sampleIcons: Record<string, string> = {
  blood: '🩸', urine: '💧', stool: '🧫', swab: '🔬', sputum: '😮‍💨', other: '🧪'
}

interface Test {
  id: string
  name: string
  slug: string
  sample_type: string
  category: string
  preparation_instructions: string | null
  turnaround_hours: number | null
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-4xl animate-pulse">🧪</div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const [tests, setTests] = useState<Test[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const { cart, toggleCart, isInCart } = useCart()
  const searchParams = useSearchParams()

  // Load tests from Supabase
  useEffect(() => {
    async function fetchTests() {
      const { data } = await supabase
        .from('tests')
        .select('*')
        .eq('is_active', true)
        .order('name')
      if (data) setTests(data)
      setLoading(false)
    }
    fetchTests()
  }, [])

  // Pick up query from URL params (from home page chips)
  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)
  }, [searchParams])

  // Filter tests
  const filtered = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return tests.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.slug.includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.sample_type.toLowerCase().includes(q)
    )
  }, [query, tests])

  const showDefault = !query.trim()
  const popular = tests.slice(0, 8)
  const categories = [...new Set(tests.map(t => t.category))]

  return (
    <div className="animate-fade-up min-h-screen">
      {/* Header */}
      <div style={{ background: 'var(--teal-dark)', padding: '16px 20px 14px' }}>
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline"
                style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>
            ←
          </Link>
          <span className="text-[13px] font-bold text-white/80">Book Tests</span>
          <Link href="/cart" className="relative no-underline">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg"
                 style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)' }}>
              🛒
            </div>
            {cart.length > 0 && (
              <div className="absolute -top-1 -right-1 bg-[var(--amber)] text-[var(--teal-dark)] text-[10px] font-extrabold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                {cart.length}
              </div>
            )}
          </Link>
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2.5"
             style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: '12px', padding: '12px 14px' }}>
          <span className="text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tests, packages, conditions..."
            className="flex-1 bg-transparent border-none text-[15px] font-medium text-white outline-none placeholder:text-white/40"
            autoFocus
          />
          {query && (
            <span className="text-sm text-white/60 cursor-pointer" onClick={() => setQuery('')}>✕</span>
          )}
        </div>
        <div className="text-[11px] text-white/50 mt-2 pl-0.5">
          📍 Nairobi · Tap 🛒 to review basket
        </div>
      </div>

      {/* Cart strip */}
      {cart.length > 0 && (
        <Link href="/cart" className="no-underline block"
              style={{ background: 'var(--amber-light)', borderBottom: '2px solid var(--amber)', padding: '10px 20px' }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] font-extrabold text-[var(--teal-dark)]">
                {cart.length} test{cart.length > 1 ? 's' : ''} in basket
              </div>
              <div className="text-[11px] text-[var(--text-mid)]">Tap to review before finding labs</div>
            </div>
            <div className="bg-[var(--teal)] text-white text-[12px] font-bold px-4 py-2 rounded-full">
              Review basket →
            </div>
          </div>
        </Link>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-4 animate-pulse">🧪</div>
            <div className="text-[13px] text-[var(--text-soft)]">Loading tests...</div>
          </div>
        ) : showDefault ? (
          /* Default view: popular + categories */
          <div>
            <div className="px-5 pt-4 pb-2 text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider">
              Popular Tests
            </div>
            {popular.map(t => (
              <TestRow key={t.id} test={t} inCart={isInCart(t.id)} onToggle={() => toggleCart(t)} />
            ))}

            <div className="px-5 pt-4 pb-2 text-[11px] font-bold text-[var(--text-soft)] uppercase tracking-wider">
              Browse by Category
            </div>
            <div className="px-5 pb-24 grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {categories.map(cat => (
                <button key={cat} onClick={() => setQuery(cat)}
                        className="bg-white rounded-[var(--r)] p-3.5 border-[1.5px] border-[var(--border)] text-center cursor-pointer hover:border-[var(--teal)] transition-colors"
                        style={{ boxShadow: 'var(--sh)' }}>
                  <div className="text-[26px] mb-1.5">{catIcons[cat] || '🧪'}</div>
                  <div className="text-[12px] font-bold capitalize">{cat.replace(/_/g, ' ')}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Search results */
          <div>
            <div className="px-5 pt-3.5 pb-2 flex justify-between items-center">
              <div className="text-[13px] font-bold">
                {filtered.length ? `${filtered.length} test${filtered.length > 1 ? 's' : ''} found` : ''}
              </div>
              <div className="text-[11px] text-[var(--text-soft)]">Tap + to add to basket</div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-10 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-base font-extrabold mb-1.5">No tests found</div>
                <div className="text-[13px] text-[var(--text-soft)] leading-relaxed">
                  Try a different name or browse categories.<br />
                  Can&apos;t find your test? <span className="text-[var(--teal)] font-bold cursor-pointer">Contact us on WhatsApp →</span>
                </div>
              </div>
            ) : (
              <div className="pb-24">
                {filtered.map(t => (
                  <TestRow key={t.id} test={t} inCart={isInCart(t.id)} onToggle={() => toggleCart(t)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating CTA */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] md:max-w-5xl px-5 pb-6 pt-3.5 bg-white border-t-[1.5px] border-[var(--border)] z-50">
          <Link href="/cart" className="no-underline">
            <button className="btn btn-teal text-[15px]">
              🛒 View basket · {cart.length} test{cart.length > 1 ? 's' : ''}
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}

function TestRow({ test, inCart, onToggle }: { test: Test; inCart: boolean; onToggle: () => void }) {
  const icon = sampleIcons[test.sample_type] || '🧪'
  const hasFasting = test.preparation_instructions?.toLowerCase().includes('fast')

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[var(--border)] transition-colors"
         style={{ background: inCart ? 'var(--teal-pale)' : 'var(--white)' }}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
           style={{ background: inCart ? 'var(--teal)' : 'var(--teal-pale)' }}>
        {inCart ? '✓' : icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-extrabold truncate">
          {test.name}
          {hasFasting && (
            <span className="ml-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--amber-light)', color: '#9A6500' }}>
              Fasting
            </span>
          )}
        </div>
        <div className="text-[11px] text-[var(--text-soft)] mt-0.5 capitalize">
          {test.sample_type.replace(/_/g, ' ')} · {test.turnaround_hours ? `${test.turnaround_hours}h` : '24h'}
        </div>
      </div>
      <button onClick={onToggle}
              className="shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-extrabold border-[1.5px] cursor-pointer transition-all"
              style={{
                background: inCart ? 'var(--teal)' : 'var(--teal-pale)',
                color: inCart ? '#fff' : 'var(--teal)',
                borderColor: 'var(--teal)',
              }}>
        {inCart ? '✓ Added' : '+ Add'}
      </button>
    </div>
  )
}
