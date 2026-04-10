import Link from 'next/link'

export default function ReadySamplePage() {
  return (
    <div className="animate-fade-up min-h-screen">
      <div style={{ background: 'linear-gradient(135deg, var(--orange), #FB923C)', padding: '20px 20px 28px', borderRadius: '0 0 32px 32px', marginBottom: '20px' }}>
        <div className="flex items-center justify-between mb-4">
          <Link href="/" className="w-[38px] h-[38px] rounded-full flex items-center justify-center text-lg no-underline"
                style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', color: '#fff' }}>
            ←
          </Link>
          <span className="text-[13px] font-bold text-white/80">Ready Sample</span>
          <div className="w-[38px]" />
        </div>
        <div className="text-[22px] font-extrabold text-white mb-1">Have a sample ready?</div>
        <div className="text-[13px] text-white/75 leading-relaxed">We'll send a rider to pick it up and deliver it to your chosen lab.</div>
      </div>

      <div className="px-5">
        <div className="p-10 text-center">
          <div className="text-5xl mb-4">📦</div>
          <div className="text-lg font-extrabold mb-2">Coming soon</div>
          <div className="text-[13px] text-[var(--text-soft)]">Ready sample booking is being built. Check back shortly!</div>
        </div>
      </div>
    </div>
  )
}
