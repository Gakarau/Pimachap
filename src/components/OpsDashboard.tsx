'use client'

import { useMemo } from 'react'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import { usePartnerApplications } from '@/lib/use-partner-applications'
import { usePlatformData } from '@/lib/use-platform-data'

export default function OpsDashboard() {
  const { data, loading, error, summary } = usePlatformData()
  const { applications } = usePartnerApplications()
  const activationQueue = useMemo(
    () => applications.filter((application) => application.status === 'approved' || application.status === 'submitted' || application.status === 'under_review'),
    [applications]
  )

  return (
    <ProtectedWorkspace allowedRoles={['owner', 'ops']}>
      {() => (
        <RoleWorkspace
          role="ops"
          title="Operations management for partner onboarding and catalog readiness."
          subtitle="Operations can review labs, test coverage, slot readiness, and catalog gaps before activation."
        >
          {loading || !summary || !data ? (
            <div className="rounded-[28px] border bg-white p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
              <div className="text-[15px] font-bold" style={{ color: 'var(--text)' }}>
                Loading operations workspace...
              </div>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
              <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                  Activation Queue
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--text-soft)' }}>
                  Applications that operations needs to activate and move into the live network.
                </p>
                <div className="mt-5 space-y-3">
                  {activationQueue.length > 0 ? activationQueue.map((application) => (
                    <div key={application.id} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>
                            {application.legal_name}
                          </div>
                          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>
                            {application.town ?? 'Town not set'}
                          </div>
                        </div>
                        <span className="text-[12px] font-bold uppercase" style={{ color: application.status === 'approved' ? 'var(--green)' : '#9A6500' }}>
                          {application.status}
                        </span>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      No pending partner applications yet.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                  Ops Notes
                </h2>
                <p className="mt-1 text-[13px]" style={{ color: 'var(--text-soft)' }}>
                  Phase 1 establishes role access and visibility. The next step is attaching approvals to actual onboarding records.
                </p>
                <div className="mt-5 grid gap-3">
                  {[
                    `${summary.activeLabs} labs are currently marked active.`,
                    `${activationQueue.length} applications are in the onboarding queue.`,
                    `${summary.activeSlots} collection slots are active for booking.`,
                    `${summary.activeTests} tests are active in the catalog.`,
                    error || 'No data load errors detected in the operations workspace.',
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
