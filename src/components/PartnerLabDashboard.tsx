'use client'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import { usePlatformData } from '@/lib/use-platform-data'

export default function PartnerLabDashboard() {
  const { data, loading } = usePlatformData()

  return (
    <ProtectedWorkspace allowedRoles={['owner', 'ops', 'partner_lab']}>
      {({ scopedLabIds, phone }) => {
        const scopedLabs = (data?.labs ?? []).filter((lab) => scopedLabIds.includes(lab.id))
        const scopedPricing = (data?.pricing ?? []).filter((row) => scopedLabIds.includes(row.lab_id))

        return (
          <RoleWorkspace
            role="partner_lab"
            title="Partner lab self-service workspace."
            subtitle="Partner labs are restricted by assigned lab IDs. This is the Phase 1 foundation for letting approved labs manage their own pricing and availability."
          >
            {loading || !data ? (
              <div className="rounded-[28px] border bg-white p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                <div className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
                  Loading partner workspace...
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                  <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                    Current Scope
                  </h2>
                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      Signed-in phone: {phone ?? 'Not available'}
                    </div>
                    <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      Scoped lab IDs: {scopedLabIds.length > 0 ? scopedLabIds.join(', ') : 'None assigned yet'}
                    </div>
                    <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      Visible pricing rows: {scopedPricing.length}
                    </div>
                  </div>
                </section>

                <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                  <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                    Scoped Labs
                  </h2>
                  <div className="mt-5 space-y-3">
                    {scopedLabs.length > 0 ? (
                      scopedLabs.map((lab) => (
                        <div key={lab.id} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                          <div className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>
                            {lab.name}
                          </div>
                          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>
                            {lab.town}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                        No lab IDs have been assigned to this partner account yet.
                      </div>
                    )}
                  </div>
                </section>
              </div>
            )}
          </RoleWorkspace>
        )
      }}
    </ProtectedWorkspace>
  )
}
