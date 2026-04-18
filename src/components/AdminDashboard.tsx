'use client'

import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import type { PlatformRole } from '@/lib/rbac'
import { usePlatformData } from '@/lib/use-platform-data'
import { useStaffAccounts } from '@/lib/use-staff-accounts'

function formatKES(value: number) {
  return `KES ${value.toLocaleString()}`
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string
  value: string | number
  hint: string
}) {
  return (
    <div className="rounded-[24px] border bg-white p-5" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color: 'var(--text-soft)' }}>
        {label}
      </div>
      <div className="mt-3 text-[30px] font-extrabold leading-none" style={{ color: 'var(--text)' }}>
        {value}
      </div>
      <div className="mt-3 text-[12px]" style={{ color: 'var(--text-mid)' }}>
        {hint}
      </div>
    </div>
  )
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
      <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
        {title}
      </h2>
      <p className="mt-1 text-[13px]" style={{ color: 'var(--text-soft)' }}>
        {subtitle}
      </p>
      <div className="mt-5">{children}</div>
    </section>
  )
}

export default function AdminDashboard() {
  const { data, loading, error, summary } = usePlatformData()
  const { staff, loading: loadingStaff, saving: savingStaff, error: staffError, createStaff, updateStaff } = useStaffAccounts()
  const [phone, setPhone] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [primaryRole, setPrimaryRole] = useState<PlatformRole>('ops')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const staffByRole = useMemo(() => {
    return staff.reduce<Record<string, number>>((acc, member) => {
      acc[member.primary_role] = (acc[member.primary_role] ?? 0) + 1
      return acc
    }, {})
  }, [staff])

  async function handleCreateStaff() {
    setStatusMessage(null)
    const ok = await createStaff({
      phone,
      display_name: displayName,
      primary_role: primaryRole,
      roles: [primaryRole],
    })

    if (!ok) {
      return
    }

    setPhone('')
    setDisplayName('')
    setPrimaryRole('ops')
    setStatusMessage('Staff account saved. The assigned user can now access their workspace.')
  }

  return (
    <ProtectedWorkspace allowedRoles={['owner']}>
      {({ roles }) => (
        <RoleWorkspace
          role="owner"
          title="Executive control across the full platform."
          subtitle="Owner workspace for cross-functional visibility across labs, pricing coverage, activation readiness, and department rollout."
        >
          {loading || !summary || !data ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[132px] animate-pulse rounded-[24px] border bg-white" style={{ borderColor: 'var(--border)' }} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Roles on Account" value={roles.length} hint={roles.join(', ')} />
                <MetricCard label="Active Labs" value={summary.activeLabs} hint={`${data.labs.length} total partner labs`} />
                <MetricCard label="Catalog Depth" value={summary.activeTests} hint={`${summary.topCategories.length} top categories tracked`} />
                <MetricCard label="Avg Listing Price" value={formatKES(summary.avgPrice)} hint={`${summary.availablePricesCount} available lab-price records`} />
              </div>

              {error ? (
                <div className="mt-4 rounded-[20px] border px-4 py-3 text-[13px]" style={{ borderColor: 'var(--amber)', background: 'var(--amber-light)', color: '#7A5A00' }}>
                  {error}
                </div>
              ) : null}

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Section title="Platform Readiness" subtitle="What each department can already run in Phase 1.">
                  <div className="grid gap-3 md:grid-cols-2">
                    {[
                      ['Operations', 'Can access a protected workspace and review live labs, slots, and catalog coverage.'],
                      ['Compliance', 'Has a protected workspace ready for KYC and approval workflow integration.'],
                      ['Finance', 'Has a protected workspace ready for payout review and reconciliation workflow integration.'],
                      ['Partner Labs', 'Can be restricted to their own lab scope via role metadata and lab IDs.'],
                    ].map(([label, body]) => (
                      <div key={label} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                        <div className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>
                          {label}
                        </div>
                        <div className="mt-2 text-[13px] leading-6" style={{ color: 'var(--text-mid)' }}>
                          {body}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Coverage Snapshot" subtitle="Current catalog and network visibility from live tables.">
                  <div className="space-y-4">
                    <div className="rounded-[22px] p-4" style={{ background: 'var(--teal-pale)' }}>
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--teal-dark)' }}>
                        Average Tests per Lab
                      </div>
                      <div className="mt-2 text-[28px] font-extrabold" style={{ color: 'var(--teal-dark)' }}>
                        {summary.avgCoverage}
                      </div>
                    </div>
                    <div className="rounded-[22px] p-4" style={{ background: 'var(--amber-light)' }}>
                      <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: '#9A6500' }}>
                        Highest Coverage Lab
                      </div>
                      <div className="mt-2 text-[18px] font-extrabold" style={{ color: 'var(--text)' }}>
                        {summary.labCoverage[0]?.name ?? 'No data'}
                      </div>
                    </div>
                  </div>
                </Section>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <Section title="Top Categories" subtitle="Most populated categories in the current test catalog.">
                  <div className="space-y-3">
                    {summary.topCategories.map(([category, count]) => (
                      <div key={category}>
                        <div className="mb-1 flex items-center justify-between text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                          <span className="capitalize">{category.replace(/_/g, ' ')}</span>
                          <span>{count}</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'var(--bg)' }}>
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.max((count / Math.max(summary.topCategories[0]?.[1] ?? 1, 1)) * 100, 10)}%`,
                              background: 'linear-gradient(90deg, var(--teal), var(--teal-light))',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>

                <Section title="Lab Coverage" subtitle="Number of currently available tests per lab.">
                  <div className="space-y-3">
                    {summary.labCoverage.slice(0, 6).map((lab) => (
                      <div key={lab.id}>
                        <div className="mb-1 flex items-center justify-between text-[13px]" style={{ color: 'var(--text)' }}>
                          <span className="font-bold">{lab.name}</span>
                          <span>{lab.availableTests} tests</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ background: 'var(--bg)' }}>
                          <div
                            className="h-2 rounded-full"
                            style={{
                              width: `${Math.max((lab.availableTests / Math.max(summary.labCoverage[0]?.availableTests ?? 1, 1)) * 100, 10)}%`,
                              background: 'linear-gradient(90deg, var(--amber), var(--teal))',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <Section
                  title="Department Access"
                  subtitle="Assign internal staff to operations, compliance, finance, or owner workspaces after they sign in once."
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="block">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                        Phone
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+254700000002"
                        className="mt-2 w-full rounded-[18px] border bg-white px-4 py-3 text-[14px] outline-none"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    </label>

                    <label className="block">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                        Display Name
                      </span>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        placeholder="Jane Operations"
                        className="mt-2 w-full rounded-[18px] border bg-white px-4 py-3 text-[14px] outline-none"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    </label>

                    <label className="block md:col-span-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                        Primary Role
                      </span>
                      <select
                        value={primaryRole}
                        onChange={(event) => setPrimaryRole(event.target.value as PlatformRole)}
                        className="mt-2 w-full rounded-[18px] border bg-white px-4 py-3 text-[14px] outline-none"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <option value="ops">Operations</option>
                        <option value="compliance">Compliance</option>
                        <option value="finance">Finance</option>
                        <option value="owner">Owner</option>
                      </select>
                    </label>
                  </div>

                  <div className="mt-4 rounded-[20px] p-4 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                    The user must complete phone login once before you can assign a department role. This writes to
                    <code className="mx-1 rounded bg-white px-1.5 py-0.5">staff_accounts</code>
                    and removes the need to rely on Vercel phone mappings long term.
                  </div>

                  {staffError ? (
                    <div className="mt-4 rounded-[18px] border px-4 py-3 text-[13px]" style={{ borderColor: 'var(--amber)', background: 'var(--amber-light)', color: '#7A5A00' }}>
                      {staffError}
                    </div>
                  ) : null}

                  {statusMessage ? (
                    <div className="mt-4 rounded-[18px] border px-4 py-3 text-[13px]" style={{ borderColor: 'rgba(10,143,148,.24)', background: 'var(--teal-pale)', color: 'var(--teal-dark)' }}>
                      {statusMessage}
                    </div>
                  ) : null}

                  <button className="btn btn-teal mt-4" onClick={handleCreateStaff} disabled={savingStaff}>
                    {savingStaff ? 'Saving staff...' : 'Save Staff Access'}
                  </button>
                </Section>

                <Section title="Assigned Staff" subtitle="Current department accounts resolved from the real staff table.">
                  {loadingStaff ? (
                    <div className="space-y-3">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-[84px] animate-pulse rounded-[20px]" style={{ background: 'var(--bg)' }} />
                      ))}
                    </div>
                  ) : staff.length === 0 ? (
                    <div className="rounded-[22px] p-4 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                      No staff accounts have been assigned yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-3">
                        {(['owner', 'ops', 'compliance', 'finance'] as PlatformRole[]).map((role) => (
                          <div key={role} className="rounded-[20px] p-4" style={{ background: 'var(--bg)' }}>
                            <div className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                              {role}
                            </div>
                            <div className="mt-2 text-[26px] font-extrabold" style={{ color: 'var(--text)' }}>
                              {staffByRole[role] ?? 0}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        {staff.map((member) => (
                          <div key={member.user_id} className="rounded-[22px] border p-4" style={{ borderColor: 'var(--border)' }}>
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div>
                                <div className="text-[16px] font-extrabold" style={{ color: 'var(--text)' }}>
                                  {member.display_name || member.phone || 'Unnamed staff'}
                                </div>
                                <div className="mt-1 text-[13px]" style={{ color: 'var(--text-mid)' }}>
                                  {member.phone ?? 'No phone stored'} · Roles: {member.roles.join(', ')}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                {(['owner', 'ops', 'compliance', 'finance'] as PlatformRole[]).map((role) => (
                                  <button
                                    key={role}
                                    className="rounded-full px-3 py-2 text-[12px] font-bold"
                                    style={{
                                      background: member.primary_role === role ? 'var(--teal)' : 'var(--bg)',
                                      color: member.primary_role === role ? '#fff' : 'var(--text-mid)',
                                    }}
                                    onClick={() => {
                                      setStatusMessage(null)
                                      void updateStaff(member.user_id, {
                                        primary_role: role,
                                        roles: [role],
                                      })
                                    }}
                                    disabled={savingStaff}
                                  >
                                    Make {role}
                                  </button>
                                ))}
                                <button
                                  className="rounded-full px-3 py-2 text-[12px] font-bold"
                                  style={{
                                    background: member.is_active ? 'var(--amber-light)' : 'var(--teal-pale)',
                                    color: member.is_active ? '#8A5F00' : 'var(--teal-dark)',
                                  }}
                                  onClick={() => {
                                    setStatusMessage(null)
                                    void updateStaff(member.user_id, { is_active: !member.is_active })
                                  }}
                                  disabled={savingStaff}
                                >
                                  {member.is_active ? 'Deactivate' : 'Reactivate'}
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Section>
              </div>
            </>
          )}
        </RoleWorkspace>
      )}
    </ProtectedWorkspace>
  )
}
