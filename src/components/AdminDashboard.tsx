'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import ThemeToggle from '@/components/ThemeToggle'
import { supabase } from '@/lib/supabase'

type AdminTab = 'overview' | 'tests' | 'labs' | 'pricing' | 'slots'

type TestRow = {
  id: string
  name: string
  slug: string
  category: string
  sample_type: string
  turnaround_hours: number | null
  is_active: boolean
}

type LabRow = {
  id: string
  name: string
  town: string
  rating: number | null
  review_count: number | null
  turnaround_hours: number | null
  is_active: boolean
}

type PriceRow = {
  id?: string
  lab_id: string
  test_id: string
  price_kes: number
  turnaround_hours: number | null
  is_available: boolean
}

type SlotRow = {
  id: string
  label: string
  start_time: string
  end_time: string
  is_active: boolean
}

type SessionState = 'loading' | 'signed_out' | 'signed_in'

type AdminData = {
  tests: TestRow[]
  labs: LabRow[]
  pricing: PriceRow[]
  slots: SlotRow[]
}

const tabs: { key: AdminTab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'tests', label: 'Tests' },
  { key: 'labs', label: 'Labs' },
  { key: 'pricing', label: 'Pricing' },
  { key: 'slots', label: 'Time Slots' },
]

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
    <div className="rounded-[24px] border p-5 bg-white" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
      <div className="text-[11px] uppercase tracking-[0.18em] font-bold" style={{ color: 'var(--text-soft)' }}>
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

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
      <div className="mb-4">
        <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[13px]" style={{ color: 'var(--text-soft)' }}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

function StatusPill({
  active,
  activeLabel = 'Active',
  inactiveLabel = 'Inactive',
}: {
  active: boolean
  activeLabel?: string
  inactiveLabel?: string
}) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        background: active ? 'var(--green-pale)' : 'var(--amber-light)',
        color: active ? 'var(--green)' : '#9A6500',
      }}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  )
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview')
  const [sessionState, setSessionState] = useState<SessionState>('loading')
  const [data, setData] = useState<AdminData | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadAdminData() {
      setError('')

      const [{ data: sessionData, error: sessionError }, testsRes, labsRes, pricingRes, slotsRes] = await Promise.all([
        supabase.auth.getSession(),
        supabase
          .from('tests')
          .select('id, name, slug, category, sample_type, turnaround_hours, is_active')
          .order('name'),
        supabase
          .from('labs')
          .select('id, name, town, rating, review_count, turnaround_hours, is_active')
          .order('name'),
        supabase
          .from('lab_test_pricing')
          .select('lab_id, test_id, price_kes, turnaround_hours, is_available'),
        supabase
          .from('time_slots')
          .select('id, label, start_time, end_time, is_active')
          .order('start_time'),
      ])

      if (cancelled) {
        return
      }

      if (sessionError) {
        setError(sessionError.message)
        setSessionState('signed_out')
        return
      }

      setSessionState(sessionData.session ? 'signed_in' : 'signed_out')

      const firstError = testsRes.error || labsRes.error || pricingRes.error || slotsRes.error
      if (firstError) {
        setError(firstError.message)
        return
      }

      setData({
        tests: (testsRes.data ?? []) as TestRow[],
        labs: (labsRes.data ?? []) as LabRow[],
        pricing: (pricingRes.data ?? []) as PriceRow[],
        slots: (slotsRes.data ?? []) as SlotRow[],
      })
    }

    loadAdminData()

    return () => {
      cancelled = true
    }
  }, [])

  const summary = useMemo(() => {
    if (!data) {
      return null
    }

    const activeTests = data.tests.filter((item) => item.is_active).length
    const activeLabs = data.labs.filter((item) => item.is_active).length
    const availablePrices = data.pricing.filter((item) => item.is_available)
    const activeSlots = data.slots.filter((item) => item.is_active).length

    const priceByLab = new Map<string, number[]>()
    const testsPerLab = new Map<string, Set<string>>()

    for (const row of availablePrices) {
      const prices = priceByLab.get(row.lab_id) ?? []
      prices.push(row.price_kes)
      priceByLab.set(row.lab_id, prices)

      const testSet = testsPerLab.get(row.lab_id) ?? new Set<string>()
      testSet.add(row.test_id)
      testsPerLab.set(row.lab_id, testSet)
    }

    const totalPrice = availablePrices.reduce((sum, row) => sum + row.price_kes, 0)
    const avgPrice = availablePrices.length > 0 ? Math.round(totalPrice / availablePrices.length) : 0
    const avgCoverage =
      testsPerLab.size > 0
        ? Math.round(
            Array.from(testsPerLab.values()).reduce((sum, testSet) => sum + testSet.size, 0) / testsPerLab.size
          )
        : 0

    const topCategories = Object.entries(
      data.tests.reduce<Record<string, number>>((acc, row) => {
        acc[row.category] = (acc[row.category] ?? 0) + 1
        return acc
      }, {})
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    const labCoverage = data.labs
      .map((lab) => ({
        ...lab,
        availableTests: testsPerLab.get(lab.id)?.size ?? 0,
      }))
      .sort((a, b) => b.availableTests - a.availableTests)

    const expensiveRows = availablePrices
      .map((row) => {
        const lab = data.labs.find((item) => item.id === row.lab_id)
        const test = data.tests.find((item) => item.id === row.test_id)
        return {
          ...row,
          labName: lab?.name ?? row.lab_id,
          testName: test?.name ?? row.test_id,
        }
      })
      .sort((a, b) => b.price_kes - a.price_kes)
      .slice(0, 8)

    return {
      activeTests,
      activeLabs,
      activeSlots,
      availablePricesCount: availablePrices.length,
      avgPrice,
      avgCoverage,
      topCategories,
      labCoverage,
      expensiveRows,
    }
  }, [data])

  if (error && !data) {
    return (
      <div className="min-h-screen px-4 py-8 md:px-8">
        <SectionCard title="Admin Unavailable" subtitle="The dashboard could not load from Supabase.">
          <p className="text-[14px]" style={{ color: 'var(--text-mid)' }}>
            {error}
          </p>
        </SectionCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, var(--bg) 0%, var(--white) 100%)' }}>
      <div className="mx-auto max-w-7xl px-4 py-5 md:px-8 md:py-8">
        <div className="overflow-hidden rounded-[32px] border" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh-lg)' }}>
          <div
            className="px-5 py-6 md:px-8 md:py-8"
            style={{ background: 'linear-gradient(135deg, var(--teal-dark) 0%, var(--teal) 55%, var(--teal-light) 100%)' }}
          >
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80" style={{ borderColor: 'rgba(255,255,255,0.28)' }}>
                  Pimachap Admin
                </div>
                <h1 className="mt-4 text-[32px] font-extrabold leading-tight text-white md:text-[44px]">
                  Platform control for your live catalog and network.
                </h1>
                <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/75 md:text-[15px]">
                  This admin is wired to the same Supabase data your booking flow already uses. It reflects live tests, labs, pricing coverage, and collection slots.
                </p>
              </div>

              <div className="flex items-center gap-3 self-start">
                <ThemeToggle variant="header" />
                <Link
                  href="/"
                  className="rounded-full px-4 py-2 text-[13px] font-bold no-underline"
                  style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.26)' }}
                >
                  Back to Storefront
                </Link>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {sessionState === 'loading' ? (
                <span className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'rgba(255,255,255,0.16)', color: '#fff' }}>
                  Checking session...
                </span>
              ) : sessionState === 'signed_in' ? (
                <span className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'rgba(220,252,231,0.95)', color: '#166534' }}>
                  Signed in
                </span>
              ) : (
                <span className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'rgba(255,244,214,0.96)', color: '#9A6500' }}>
                  No active session
                </span>
              )}

              <span className="text-[12px] text-white/70">
                Role-based admin protection is not configured in this repo yet.
              </span>
            </div>
          </div>

          <div className="bg-[var(--bg)] px-3 py-3 md:px-5">
            <div className="flex gap-2 overflow-x-auto">
              {tabs.map((tab) => {
                const active = activeTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className="shrink-0 rounded-full px-4 py-2 text-[13px] font-bold"
                    style={{
                      background: active ? 'var(--teal)' : 'transparent',
                      color: active ? '#fff' : 'var(--text-mid)',
                      border: active ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-[20px] border px-4 py-3 text-[13px]" style={{ borderColor: 'var(--amber)', background: 'var(--amber-light)', color: '#7A5A00' }}>
            {error}
          </div>
        ) : null}

        {!data || !summary ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[132px] animate-pulse rounded-[24px] border bg-white" style={{ borderColor: 'var(--border)' }} />
            ))}
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="Active Tests" value={summary.activeTests} hint={`${data.tests.length} total catalog items`} />
              <MetricCard label="Active Labs" value={summary.activeLabs} hint={`${data.labs.length} total partner labs`} />
              <MetricCard label="Available Prices" value={summary.availablePricesCount} hint={`Average ${formatKES(summary.avgPrice)} per listing`} />
              <MetricCard label="Collection Slots" value={summary.activeSlots} hint={`${data.slots.length} slots configured`} />
            </div>

            {activeTab === 'overview' ? (
              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <SectionCard title="Coverage Snapshot" subtitle="How complete your current marketplace setup is.">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-[22px] p-4" style={{ background: 'var(--teal-pale)' }}>
                      <div className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--teal-dark)' }}>
                        Avg Tests per Lab
                      </div>
                      <div className="mt-2 text-[28px] font-extrabold" style={{ color: 'var(--teal-dark)' }}>
                        {summary.avgCoverage}
                      </div>
                    </div>
                    <div className="rounded-[22px] p-4" style={{ background: 'var(--amber-light)' }}>
                      <div className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: '#9A6500' }}>
                        Top Coverage Lab
                      </div>
                      <div className="mt-2 text-[18px] font-extrabold" style={{ color: 'var(--text)' }}>
                        {summary.labCoverage[0]?.name ?? 'No lab data'}
                      </div>
                    </div>
                    <div className="rounded-[22px] p-4" style={{ background: 'var(--blue-pale)' }}>
                      <div className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--blue)' }}>
                        Catalog Categories
                      </div>
                      <div className="mt-2 text-[28px] font-extrabold" style={{ color: 'var(--text)' }}>
                        {summary.topCategories.length}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Lab</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Town</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Available Tests</th>
                          <th className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.labCoverage.slice(0, 6).map((lab) => (
                          <tr key={lab.id}>
                            <td className="border-b py-3 pr-3 text-[14px] font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>{lab.name}</td>
                            <td className="border-b py-3 pr-3 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}>{lab.town}</td>
                            <td className="border-b py-3 pr-3 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>{lab.availableTests}</td>
                            <td className="border-b py-3" style={{ borderColor: 'var(--border)' }}>
                              <StatusPill active={lab.is_active} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

                <SectionCard title="Top Categories" subtitle="Highest-volume catalog groups in your current data.">
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
                              width: `${Math.max((count / Math.max(summary.topCategories[0]?.[1] ?? 1, 1)) * 100, 12)}%`,
                              background: 'linear-gradient(90deg, var(--teal), var(--teal-light))',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                    <div className="text-[11px] uppercase tracking-[0.16em] font-bold" style={{ color: 'var(--text-soft)' }}>
                      Security Note
                    </div>
                    <p className="mt-2 text-[13px] leading-6" style={{ color: 'var(--text-mid)' }}>
                      This admin page currently depends on public Supabase reads plus the user session. For a real protected admin, add an admin profile table or a secure server endpoint backed by service-role credentials.
                    </p>
                  </div>
                </SectionCard>
              </div>
            ) : null}

            {activeTab === 'tests' ? (
              <div className="mt-6">
                <SectionCard title="Test Catalog" subtitle="Live tests from the `tests` table.">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Test</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Category</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Sample</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Turnaround</th>
                          <th className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.tests.map((test) => (
                          <tr key={test.id}>
                            <td className="border-b py-3 pr-3" style={{ borderColor: 'var(--border)' }}>
                              <div className="text-[14px] font-bold" style={{ color: 'var(--text)' }}>{test.name}</div>
                              <div className="text-[12px]" style={{ color: 'var(--text-soft)' }}>{test.slug}</div>
                            </td>
                            <td className="border-b py-3 pr-3 text-[13px] capitalize" style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}>
                              {test.category.replace(/_/g, ' ')}
                            </td>
                            <td className="border-b py-3 pr-3 text-[13px] capitalize" style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}>
                              {test.sample_type.replace(/_/g, ' ')}
                            </td>
                            <td className="border-b py-3 pr-3 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>
                              {test.turnaround_hours ? `${test.turnaround_hours}h` : 'Not set'}
                            </td>
                            <td className="border-b py-3" style={{ borderColor: 'var(--border)' }}>
                              <StatusPill active={test.is_active} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </div>
            ) : null}

            {activeTab === 'labs' ? (
              <div className="mt-6">
                <SectionCard title="Partner Labs" subtitle="Live records from the `labs` table.">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {summary.labCoverage.map((lab) => (
                      <article key={lab.id} className="rounded-[24px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-[16px] font-extrabold" style={{ color: 'var(--text)' }}>{lab.name}</h3>
                            <p className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>{lab.town}</p>
                          </div>
                          <StatusPill active={lab.is_active} />
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>Rating</div>
                            <div className="mt-1 text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                              {lab.rating ?? 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>Reviews</div>
                            <div className="mt-1 text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                              {lab.review_count ?? 0}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>Turnaround</div>
                            <div className="mt-1 text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                              {lab.turnaround_hours ? `${lab.turnaround_hours}h` : 'N/A'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--text-soft)' }}>Priced Tests</div>
                            <div className="mt-1 text-[16px] font-bold" style={{ color: 'var(--text)' }}>
                              {lab.availableTests}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </div>
            ) : null}

            {activeTab === 'pricing' ? (
              <div className="mt-6 grid gap-4 xl:grid-cols-[1fr_1fr]">
                <SectionCard title="Most Expensive Listings" subtitle="Highest current `lab_test_pricing` entries marked available.">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--text-soft)' }}>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Test</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Lab</th>
                          <th className="border-b pb-3 pr-3" style={{ borderColor: 'var(--border)' }}>Price</th>
                          <th className="border-b pb-3" style={{ borderColor: 'var(--border)' }}>Turnaround</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.expensiveRows.map((row, index) => (
                          <tr key={`${row.lab_id}-${row.test_id}-${index}`}>
                            <td className="border-b py-3 pr-3 text-[13px] font-bold" style={{ borderColor: 'var(--border)', color: 'var(--text)' }}>{row.testName}</td>
                            <td className="border-b py-3 pr-3 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}>{row.labName}</td>
                            <td className="border-b py-3 pr-3 text-[13px] font-bold" style={{ borderColor: 'var(--border)', color: 'var(--teal-dark)' }}>{formatKES(row.price_kes)}</td>
                            <td className="border-b py-3 text-[13px]" style={{ borderColor: 'var(--border)', color: 'var(--text-mid)' }}>{row.turnaround_hours ? `${row.turnaround_hours}h` : 'N/A'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>

                <SectionCard title="Coverage by Lab" subtitle="How many tests each lab currently exposes as available.">
                  <div className="space-y-3">
                    {summary.labCoverage.map((lab) => (
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
                </SectionCard>
              </div>
            ) : null}

            {activeTab === 'slots' ? (
              <div className="mt-6">
                <SectionCard title="Collection Time Slots" subtitle="Live slots from the `time_slots` table.">
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {data.slots.map((slot) => (
                      <article key={slot.id} className="rounded-[24px] border p-5" style={{ borderColor: 'var(--border)', background: 'var(--bg)' }}>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-[16px] font-extrabold" style={{ color: 'var(--text)' }}>{slot.label}</h3>
                          <StatusPill active={slot.is_active} />
                        </div>
                        <div className="mt-4 text-[13px]" style={{ color: 'var(--text-mid)' }}>
                          {slot.start_time} to {slot.end_time}
                        </div>
                      </article>
                    ))}
                  </div>
                </SectionCard>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
