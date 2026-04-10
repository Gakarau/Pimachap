import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Sample type icons
const sampleIcons: Record<string, string> = {
  blood: '🩸', urine: '💧', stool: '🧫', swab: '🔬', sputum: '😮‍💨', other: '🧪'
}

// Category icons
const catIcons: Record<string, string> = {
  haematology: '🩸', diabetes: '🍬', lipids: '❤️', liver: '🫀', kidney: '🫘',
  thyroid: '🦋', infectious: '🦠', hormones: '🧬', vitamins: '☀️',
  tumour_markers: '🔵', urinalysis: '💧', microbiology: '🧫',
  biochemistry: '⚗️', serology: '🔬', coagulation: '🩸', allergy: '🤧', other: '🧪'
}

export default async function HomePage() {
  // Fetch popular tests from Supabase
  const { data: tests } = await supabase
    .from('tests')
    .select('id, name, slug, sample_type, category')
    .eq('is_active', true)
    .limit(6)

  // Fetch categories (distinct)
  const { data: categories } = await supabase
    .from('tests')
    .select('category')
    .eq('is_active', true)

  const uniqueCats = [...new Set(categories?.map(c => c.category) || [])]

  return (
    <div className="animate-fade-up">
      {/* Mobile Hero */}
      <div className="md:hidden"
           style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 60%, var(--teal-light) 100%)', padding: '20px 20px 28px', borderRadius: '0 0 32px 32px', marginBottom: '20px' }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-[13px] text-white/60">Good morning 👋</div>
            <div className="text-[20px] font-extrabold text-white">Welcome to Pimachap</div>
          </div>
          <div className="logo-text text-white" style={{ fontSize: '18px' }}>PIMA<span>CHAP</span></div>
        </div>

        <div className="flex items-center gap-2.5 mb-3"
             style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', borderRadius: '12px', padding: '10px 14px' }}>
          <span>📍</span>
          <span className="flex-1 text-[13px] text-white/70 font-medium">Nairobi, Kenya</span>
          <span className="text-[12px] text-[var(--amber)] font-bold cursor-pointer">Change</span>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          <Link href="/search"
                className="p-3 rounded-full bg-[var(--teal)] text-white border-none text-[13px] font-bold text-center no-underline"
                style={{ boxShadow: '0 4px 14px rgba(13,115,119,.3)' }}>
            🔍 Book a Test
          </Link>
          <Link href="/ready-sample"
                className="p-3 rounded-full bg-[var(--orange)] text-white border-none text-[13px] font-bold text-center no-underline"
                style={{ boxShadow: '0 4px 14px rgba(234,88,12,.25)' }}>
            📦 Ready Sample
          </Link>
        </div>
      </div>

      {/* Desktop Hero */}
      <div className="hidden md:block mb-8">
        <div className="rounded-3xl p-10 text-white relative overflow-hidden"
             style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 60%, var(--teal-light) 100%)' }}>
          <div className="relative z-10 max-w-xl">
            <h1 className="text-4xl font-extrabold mb-3 leading-tight">Lab tests at your door.<br />Transparent pricing.</h1>
            <p className="text-white/70 text-lg mb-6">Compare labs across Nairobi. Book a certified phlebotomist or send your ready sample to any lab.</p>
            <div className="flex gap-3">
              <Link href="/search"
                    className="px-8 py-4 rounded-full bg-[var(--amber)] text-[var(--teal-dark)] text-base font-extrabold no-underline hover:scale-[1.02] transition-transform"
                    style={{ boxShadow: '0 6px 24px rgba(245,166,35,.35)' }}>
                🔍 Book a Test
              </Link>
              <Link href="/ready-sample"
                    className="px-8 py-4 rounded-full bg-white/15 text-white text-base font-extrabold no-underline border-[1.5px] border-white/25 hover:bg-white/25 transition-colors">
                📦 Ready Sample
              </Link>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute w-[360px] h-[360px] rounded-full border-[64px] border-white/5 -top-[90px] -right-[110px]" />
          <div className="absolute w-[220px] h-[220px] rounded-full border-[44px] border-white/[0.04] bottom-[20px] -left-[70px]" />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 md:px-0">
        {/* Popular Tests */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-bold">Popular tests</h3>
          <Link href="/search" className="text-[12px] text-[var(--teal)] font-bold no-underline">See all →</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
          {tests?.map(t => (
            <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}
                  className="shrink-0 px-3.5 py-2 rounded-full border-[1.5px] border-[var(--border)] bg-white text-[12px] font-bold text-[var(--text-mid)] no-underline whitespace-nowrap"
                  style={{ boxShadow: 'var(--sh)' }}>
              {sampleIcons[t.sample_type] || '🧪'} {t.name}
            </Link>
          ))}
        </div>

        {/* Browse by Category */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-bold">Browse by category</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-6">
          {uniqueCats.map(cat => (
            <Link key={cat} href={`/search?q=${encodeURIComponent(cat)}`}
                  className="bg-white rounded-[var(--r)] p-3.5 border-[1.5px] border-[var(--border)] text-center no-underline cursor-pointer hover:border-[var(--teal)] transition-colors"
                  style={{ boxShadow: 'var(--sh)' }}>
              <div className="text-[26px] mb-1.5">{catIcons[cat] || '🧪'}</div>
              <div className="text-[12px] font-bold text-[var(--text)] capitalize">{cat.replace(/_/g, ' ')}</div>
            </Link>
          ))}
        </div>

        {/* Ready sample types */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-bold">Ready sample types</h3>
          <Link href="/ready-sample" className="text-[12px] text-[var(--teal)] font-bold no-underline">Book pickup →</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {['🧫 Stool', '💧 Urine', '🧪 Semen', '🩸 Blood (pre-collected)', '😮‍💨 Sputum', '🔬 Swab'].map(s => (
            <Link key={s} href="/ready-sample"
                  className="shrink-0 px-3.5 py-2 rounded-full border-[1.5px] border-[var(--border)] bg-white text-[12px] font-bold text-[var(--text-mid)] no-underline whitespace-nowrap"
                  style={{ boxShadow: 'var(--sh)' }}>
              {s}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
