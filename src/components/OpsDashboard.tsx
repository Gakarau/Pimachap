'use client'

import { useMemo, useState } from 'react'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import { activatePartnerApplication, provisionLabFromApplication, usePartnerApplications } from '@/lib/use-partner-applications'
import { useLabsSchema } from '@/lib/use-labs-schema'
import { usePlatformData } from '@/lib/use-platform-data'

export default function OpsDashboard() {
  const { data, loading, error, summary } = usePlatformData()
  const { applications, reload } = usePartnerApplications()
  const { columns, loading: schemaLoading, error: schemaError } = useLabsSchema()
  const [activationLabIds, setActivationLabIds] = useState<Record<string, string>>({})
  const [activatingId, setActivatingId] = useState<string | null>(null)
  const [provisioningId, setProvisioningId] = useState<string | null>(null)
  const [provisionMessages, setProvisionMessages] = useState<Record<string, string>>({})
  const activationQueue = useMemo(
    () => applications.filter((application) => application.status === 'approved' || application.status === 'submitted' || application.status === 'under_review'),
    [applications]
  )

  async function activate(applicationId: string) {
    const labId = activationLabIds[applicationId]
    if (!labId) {
      return
    }

    setActivatingId(applicationId)
    await activatePartnerApplication(applicationId, labId)
    setActivatingId(null)
    reload()
  }

  async function provision(applicationId: string) {
    setProvisioningId(applicationId)
    const result = await provisionLabFromApplication(applicationId)
    const missingColumns = result.missing_required_columns

    if (result.lab_id) {
      setProvisionMessages((current) => ({
        ...current,
        [applicationId]: `Created lab ${result.lab_id} using columns: ${(result.payload_columns ?? []).join(', ')}`,
      }))
      setActivationLabIds((current) => ({
        ...current,
        [applicationId]: result.lab_id ?? '',
      }))
    } else if (missingColumns && missingColumns.length > 0) {
      setProvisionMessages((current) => ({
        ...current,
        [applicationId]: `Blocked by required labs columns: ${missingColumns.join(', ')}`,
      }))
    } else {
      setProvisionMessages((current) => ({
        ...current,
        [applicationId]: result.error ?? 'Provisioning failed',
      }))
    }

    setProvisioningId(null)
    reload()
  }

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
                      {application.status === 'approved' ? (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            className="rounded-full px-4 py-3 text-[13px] font-bold text-white"
                            style={{ background: 'var(--teal-dark)' }}
                            onClick={() => provision(application.id)}
                            disabled={provisioningId === application.id}
                          >
                            {provisioningId === application.id ? 'Provisioning...' : 'Create lab from application'}
                          </button>
                          <input
                            value={activationLabIds[application.id] ?? ''}
                            onChange={(event) => setActivationLabIds((current) => ({ ...current, [application.id]: event.target.value }))}
                            placeholder="Existing lab ID to activate"
                            className="min-w-[240px] rounded-[14px] border bg-white px-4 py-3 text-[13px] outline-none"
                            style={{ borderColor: 'var(--border)' }}
                          />
                          <button
                            className="rounded-full px-4 py-3 text-[13px] font-bold text-white"
                            style={{ background: 'var(--teal)' }}
                            onClick={() => activate(application.id)}
                            disabled={activatingId === application.id}
                          >
                            {activatingId === application.id ? 'Activating...' : 'Activate'}
                          </button>
                        </div>
                      ) : null}

                      {provisionMessages[application.id] ? (
                        <div className="mt-3 rounded-[16px] p-3 text-[12px] leading-6" style={{ background: '#fff', color: 'var(--text-mid)' }}>
                          {provisionMessages[application.id]}
                        </div>
                      ) : null}
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
                  Phase 2 now includes activation handoff and safe schema introspection so lab creation can be built against the real table definition.
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

                <div className="mt-5 rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                  <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                    `public.labs` schema visibility
                  </div>
                  <div className="mt-2 text-[12px]" style={{ color: 'var(--text-soft)' }}>
                    {schemaLoading
                      ? 'Loading real labs columns...'
                      : schemaError
                        ? schemaError
                        : `${columns.length} columns visible via secure schema introspection.`}
                  </div>
                  {!schemaLoading && !schemaError && columns.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {columns.slice(0, 10).map((column) => (
                        <span key={column.column_name} className="rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: '#fff', color: 'var(--text-mid)' }}>
                          {column.column_name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </section>
            </div>
          )}
        </RoleWorkspace>
      )}
    </ProtectedWorkspace>
  )
}
