'use client'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import { usePlatformData } from '@/lib/use-platform-data'

function formatKES(value: number) {
  return `KES ${value.toLocaleString()}`
}

export default function FinanceDashboard() {
  const { data, loading } = usePlatformData()

  const totalVisiblePricebook = (data?.pricing ?? [])
    .filter((row) => row.is_available)
    .reduce((sum, row) => sum + row.price_kes, 0)

  return (
    <ProtectedWorkspace allowedRoles={['owner', 'finance']}>
      {() => (
        <RoleWorkspace
          role="finance"
          title="Finance workspace for payout and reconciliation controls."
          subtitle="Phase 1 provides protected access and financial visibility scaffolding. Real payout approval will sit on top of order, collection, and settlement records."
        >
          {loading || !data ? (
            <div className="rounded-[28px] border bg-white p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
              <div className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
                Loading finance workspace...
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                  Current Financial Inputs
                </h2>
                <div className="mt-5 grid gap-3">
                  {[
                    `Visible price-book value: ${formatKES(totalVisiblePricebook)}`,
                    `Available price rows: ${(data.pricing ?? []).filter((row) => row.is_available).length}`,
                    `Labs in network: ${data.labs.length}`,
                    `Live slots configured: ${data.slots.length}`,
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      {item}
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                  Finance Tables Still Needed
                </h2>
                <div className="mt-5 grid gap-3">
                  {[
                    'orders',
                    'payments',
                    'payout_batches',
                    'payout_line_items',
                    'finance_approvals',
                  ].map((item) => (
                    <div key={item} className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      {item}
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </RoleWorkspace>
      )}
    </ProtectedWorkspace>
  )
}
