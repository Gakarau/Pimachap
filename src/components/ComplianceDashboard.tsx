'use client'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'

const checks = [
  'Business registration documents',
  'Lab operating license and accreditation',
  'Responsible contact and phone verification',
  'Address and service-town verification',
  'KMLTTB and related professional compliance requirements',
]

export default function ComplianceDashboard() {
  return (
    <ProtectedWorkspace allowedRoles={['owner', 'compliance']}>
      {() => (
        <RoleWorkspace
          role="compliance"
          title="Compliance workspace for KYC, documents, and approvals."
          subtitle="Phase 1 protects access and establishes the review workspace. The next implementation step is wiring this to uploaded document records and approval states."
        >
          <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
            <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
              <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                Approval Checklist
              </h2>
              <div className="mt-5 space-y-3">
                {checks.map((item) => (
                  <div key={item} className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
              <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
                Next Schema Needed
              </h2>
              <div className="mt-5 space-y-3 text-[13px] leading-6" style={{ color: 'var(--text-mid)' }}>
                <div className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                  `partner_applications`
                </div>
                <div className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                  `partner_documents`
                </div>
                <div className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                  `approval_decisions`
                </div>
                <div className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                  `audit_events`
                </div>
              </div>
            </section>
          </div>
        </RoleWorkspace>
      )}
    </ProtectedWorkspace>
  )
}
