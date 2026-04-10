import Link from 'next/link'

export default function ProfilePage() {
  return (
    <div className="animate-fade-up min-h-screen">
      <div className="text-center py-16 px-5"
           style={{ background: 'linear-gradient(145deg, var(--teal-dark) 0%, var(--teal) 100%)', borderRadius: '0 0 32px 32px' }}>
        <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-4xl mx-auto mb-4">
          👤
        </div>
        <div className="text-xl font-extrabold text-white mb-1">Sign in to continue</div>
        <div className="text-[12px] text-white/50">Manage orders, save addresses, track results</div>
      </div>

      <div className="px-5 pt-6">
        <button className="btn btn-teal mb-3" onClick={() => alert('Auth coming soon — using test phone numbers for now')}>
          Sign In with Phone →
        </button>
        <div className="text-center text-[11px] text-[var(--text-soft)]">
          We'll send a verification code to your phone
        </div>
      </div>
    </div>
  )
}
