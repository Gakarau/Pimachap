import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// Sample type icons
const sampleIcons: Record<string, string> = {
  blood: '🩸', urine: '💧', stool: '🧫', swab: '🔬', sputum: '😮‍💨', other: '🧪'
}

// Category icons
const catIcons: Record<string, string> = {
  haematology:    '🩸',  // blood drop
  diabetes:       '🍬',  // sugar/glucose
  lipids:         '🫀',  // anatomical heart = cardiovascular risk
  liver:          '💛',  // yellow = bilirubin/jaundice (liver marker)
  kidney:         '🫧',  // bubbles = filtration (not a bean)
  thyroid:        '🦋',  // thyroid gland is butterfly-shaped
  infectious:     '🦠',  // microbe
  hormones:       '🧬',  // DNA/endocrine
  vitamins:       '☀️',  // vitamin D / sunshine
  tumour_markers: '🎯',  // target = tumour marker
  urinalysis:     '💧',  // droplet = urine
  microbiology:   '🧫',  // petri dish
  biochemistry:   '⚗️',  // alembic/beaker
  serology:       '🔬',  // microscope = antibody detection
  coagulation:    '🩹',  // bandage = clotting/wound healing
  allergy:        '🤧',  // sneezing
  other:          '🧪',  // test tube fallback
}

const WHY_US = [
  { icon: '🔍', title: 'Compare 50+ labs', desc: 'See real prices before you pay — no surprises', color: 'var(--teal)', bg: 'var(--teal-pale)' },
  { icon: '🏍️', title: 'KMLTTB-certified riders', desc: 'Every phlebotomist is board-certified & verified', color: 'var(--purple)', bg: 'var(--purple-pale)' },
  { icon: '⚡', title: 'Same-day collection', desc: 'Book today, get collected today in Nairobi', color: 'var(--amber)', bg: 'var(--amber-light)' },
  { icon: '💳', title: 'M-Pesa, zero hidden fees', desc: 'Pay securely after you review the total', color: 'var(--green)', bg: 'var(--green-pale)' },
  { icon: '📋', title: 'Results your way', desc: 'WhatsApp, email or direct to your doctor', color: 'var(--blue)', bg: 'var(--blue-pale)' },
  { icon: '🔒', title: 'Private & secure', desc: 'Password-protected PDF, never shared', color: 'var(--coral)', bg: 'var(--coral-pale)' },
]

export default async function HomePage() {
  const { data: tests } = await supabase
    .from('tests')
    .select('id, name, slug, sample_type, category')
    .eq('is_active', true)
    .limit(8)

  const { data: categories } = await supabase
    .from('tests')
    .select('category')
    .eq('is_active', true)

  const uniqueCats = [...new Set(categories?.map(c => c.category) || [])]

  return (
    <div className="animate-fade-up">

      {/* ── Mobile Hero ── */}
      <div className="relative md:hidden mx-0 mb-5 overflow-hidden"
           style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 55%, var(--teal-light) 100%)', borderRadius: '0 0 36px 36px' }}>
        {/* Decorative dots */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-48 h-48 rounded-full border-[40px] border-white/[0.05] -top-16 -right-16" />
          <div className="absolute w-28 h-28 rounded-full border-[28px] border-white/[0.05] bottom-4 -left-10" />
        </div>

        <div className="relative px-5 pt-[22px] pb-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div className="text-[12px] text-white/60 font-medium">Good morning 👋</div>
              <div className="text-[21px] font-extrabold text-white leading-tight">Welcome to<br />Pimachap</div>
            </div>
            <div className="logo-text text-white" style={{ fontSize: '18px', color: '#fff' }}>
              PIMA<span style={{ color: 'var(--amber)' }}>CHAP</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 mb-4"
               style={{ background: 'rgba(255,255,255,.12)', border: '1.5px solid rgba(255,255,255,.2)', borderRadius: '12px', padding: '10px 14px' }}>
            <span>📍</span>
            <span className="flex-1 text-[13px] text-white/70 font-medium">Nairobi, Kenya</span>
            <span className="text-[12px] font-bold" style={{ color: 'var(--amber)' }}>Change</span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/search"
                  className="p-3.5 rounded-2xl text-white text-[13px] font-extrabold text-center no-underline"
                  style={{ background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.25)', backdropFilter: 'blur(8px)' }}>
              🔍 Book a Test
            </Link>
            <Link href="/ready-sample"
                  className="p-3.5 rounded-2xl text-white text-[13px] font-extrabold text-center no-underline"
                  style={{ background: 'var(--orange)', boxShadow: '0 4px 14px rgba(234,88,12,.4)' }}>
              📦 Ready Sample
            </Link>
          </div>
        </div>

        {/* Call-to-book — integrated at the bottom of the hero */}
        <div className="relative flex items-center justify-between gap-3 px-5 py-3"
             style={{ background: 'rgba(0,0,0,.18)', borderTop: '1px solid rgba(255,255,255,.12)' }}>
          <div className="flex items-center gap-2.5">
            <span className="text-base">📞</span>
            <div>
              <div className="text-[12px] font-extrabold text-white leading-tight">Prefer to call? We'll book for you</div>
              <div className="text-[10px] text-white/55">Free helpline · Mon–Sat, 7 AM – 8 PM</div>
            </div>
          </div>
          <a href="tel:+254800PIMACHAP"
             className="shrink-0 px-4 py-1.5 rounded-full text-[11px] font-extrabold no-underline"
             style={{ background: 'var(--amber)', color: 'var(--teal-dark)' }}>
            Call now
          </a>
        </div>
      </div>

      {/* ── Desktop Hero ── */}
      <div className="hidden md:block mb-8">
        <div className="rounded-3xl p-10 text-white relative overflow-hidden"
             style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 55%, var(--teal-light) 100%)' }}>
          <div className="absolute w-[400px] h-[400px] rounded-full border-[72px] border-white/[0.05] -top-[110px] -right-[130px]" />
          <div className="absolute w-[240px] h-[240px] rounded-full border-[48px] border-white/[0.04] bottom-[10px] -left-[80px]" />
          <div className="absolute w-[160px] h-[160px] rounded-full border-[32px] border-white/[0.04] top-[40px] right-[200px]" />

          <div className="relative z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-[11px] font-bold tracking-wide"
                 style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)' }}>
              🇰🇪 Serving Nairobi · 50+ certified labs
            </div>
            <h1 className="text-4xl font-extrabold mb-3 leading-tight">
              Lab tests at your door.<br />
              <span style={{ color: 'var(--amber)' }}>Transparent pricing.</span>
            </h1>
            <p className="text-white/70 text-base mb-6 leading-relaxed">
              Compare labs, book a KMLTTB-certified phlebotomist, or send your ready sample — all via M-Pesa.
            </p>
            <div className="flex gap-3">
              <Link href="/search"
                    className="px-8 py-4 rounded-full text-base font-extrabold no-underline hover:scale-[1.02] transition-transform"
                    style={{ background: 'var(--amber)', color: 'var(--teal-dark)', boxShadow: '0 6px 24px rgba(247,168,0,.4)' }}>
                🔍 Book a Test
              </Link>
              <Link href="/ready-sample"
                    className="px-8 py-4 rounded-full text-base font-extrabold no-underline border-[1.5px] border-white/25 hover:bg-white/20 transition-colors"
                    style={{ background: 'rgba(255,255,255,.12)' }}>
                📦 Ready Sample
              </Link>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative z-10 flex gap-6 mt-8">
            {[
              { value: '50+', label: 'Partner Labs' },
              { value: '4.8★', label: 'Avg. Rating' },
              { value: '<2h', label: 'Avg. Collection' },
              { value: '100%', label: 'Certified Riders' },
            ].map(stat => (
              <div key={stat.label}>
                <div className="text-xl font-extrabold text-white">{stat.value}</div>
                <div className="text-[11px] text-white/55">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-4 sm:px-0">

        {/* Popular Tests */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-extrabold">Popular tests</h3>
          <Link href="/search" className="text-[12px] font-bold no-underline" style={{ color: 'var(--teal)' }}>See all →</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 mb-6" style={{ scrollbarWidth: 'none' }}>
          {tests?.map(t => (
            <Link key={t.id} href={`/search?q=${encodeURIComponent(t.name)}`}
                  className="shrink-0 px-3.5 py-2 rounded-full border-[1.5px] border-[var(--border)] bg-white text-[12px] font-bold text-[var(--text-mid)] no-underline whitespace-nowrap hover:border-[var(--teal)] transition-colors"
                  style={{ boxShadow: 'var(--sh)' }}>
              {sampleIcons[t.sample_type] || '🧪'} {t.name}
            </Link>
          ))}
        </div>

        {/* Browse by Category */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-extrabold">Browse by category</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 mb-8">
          {uniqueCats.map(cat => (
            <Link key={cat} href={`/search?q=${encodeURIComponent(cat)}`}
                  className="bg-white rounded-[var(--r)] p-3.5 border-[1.5px] border-[var(--border)] text-center no-underline cursor-pointer hover:border-[var(--teal)] hover:shadow-md transition-all"
                  style={{ boxShadow: 'var(--sh)' }}>
              <div className="text-[26px] mb-1.5">{catIcons[cat] || '🧪'}</div>
              <div className="text-[12px] font-bold capitalize" style={{ color: 'var(--text)' }}>{cat.replace(/_/g, ' ')}</div>
            </Link>
          ))}
        </div>

        {/* ── Why Choose Us ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[17px] font-extrabold">Why choose Pimachap?</h3>
          </div>
          <p className="text-[12px] text-[var(--text-soft)] mb-4">Nairobi's only diagnostics marketplace built for you.</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WHY_US.map(item => (
              <div key={item.title}
                   className="rounded-[var(--r)] p-4 border-[1.5px] border-[var(--border)] bg-white"
                   style={{ boxShadow: 'var(--sh)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3"
                     style={{ background: item.bg }}>
                  {item.icon}
                </div>
                <div className="text-[13px] font-extrabold mb-1" style={{ color: 'var(--text)' }}>{item.title}</div>
                <div className="text-[11px] leading-relaxed" style={{ color: 'var(--text-soft)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ready sample types ── */}
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-[15px] font-extrabold">Ready sample types</h3>
          <Link href="/ready-sample" className="text-[12px] font-bold no-underline" style={{ color: 'var(--orange)' }}>Book pickup →</Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4" style={{ scrollbarWidth: 'none' }}>
          {['🧫 Stool', '💧 Urine', '🧪 Semen', '🩸 Blood (pre-collected)', '😮‍💨 Sputum', '🔬 Swab'].map(s => (
            <Link key={s} href="/ready-sample"
                  className="shrink-0 px-3.5 py-2 rounded-full border-[1.5px] bg-white text-[12px] font-bold text-[var(--text-mid)] no-underline whitespace-nowrap hover:border-[var(--orange)] transition-colors"
                  style={{ border: '1.5px solid var(--border)', boxShadow: 'var(--sh)' }}>
              {s}
            </Link>
          ))}
        </div>

        {/* ── Bottom CTA strip ── */}
        <div className="rounded-[var(--r)] p-5 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4"
             style={{ background: 'linear-gradient(135deg, var(--teal-dark), var(--teal))', boxShadow: '0 8px 32px rgba(10,143,148,.25)' }}>
          <div>
            <div className="text-[16px] font-extrabold text-white mb-0.5">Not sure which test you need?</div>
            <div className="text-[12px] text-white/60">Our team will guide you — free consultation.</div>
          </div>
          <div className="flex gap-2.5 shrink-0">
            <a href="https://wa.me/254700000000"
               className="px-5 py-2.5 rounded-full text-[13px] font-extrabold no-underline"
               style={{ background: '#25D366', color: '#fff' }}>
              💬 WhatsApp
            </a>
            <a href="tel:+254800000000"
               className="px-5 py-2.5 rounded-full text-[13px] font-extrabold no-underline"
               style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: '1.5px solid rgba(255,255,255,.3)' }}>
              📞 Call
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
