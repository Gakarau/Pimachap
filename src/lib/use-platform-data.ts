'use client'

import { useEffect, useMemo, useState } from 'react'

import { supabase } from '@/lib/supabase'

export type TestRow = {
  id: string
  name: string
  slug: string
  category: string
  sample_type: string
  turnaround_hours: number | null
  is_active: boolean
}

export type LabRow = {
  id: string
  name: string
  town: string
  rating: number | null
  review_count: number | null
  turnaround_hours: number | null
  is_active: boolean
}

export type PriceRow = {
  id?: string
  lab_id: string
  test_id: string
  price_kes: number
  turnaround_hours: number | null
  is_available: boolean
}

export type SlotRow = {
  id: string
  label: string
  start_time: string
  end_time: string
  is_active: boolean
}

export type PlatformData = {
  tests: TestRow[]
  labs: LabRow[]
  pricing: PriceRow[]
  slots: SlotRow[]
}

export function usePlatformData() {
  const [data, setData] = useState<PlatformData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      const [testsRes, labsRes, pricingRes, slotsRes] = await Promise.all([
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

      const firstError = testsRes.error || labsRes.error || pricingRes.error || slotsRes.error
      if (firstError) {
        setError(firstError.message)
        setLoading(false)
        return
      }

      setData({
        tests: (testsRes.data ?? []) as TestRow[],
        labs: (labsRes.data ?? []) as LabRow[],
        pricing: (pricingRes.data ?? []) as PriceRow[],
        slots: (slotsRes.data ?? []) as SlotRow[],
      })
      setLoading(false)
    }

    load()

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

    const testsPerLab = new Map<string, Set<string>>()
    for (const row of availablePrices) {
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

    return {
      activeTests,
      activeLabs,
      activeSlots,
      availablePricesCount: availablePrices.length,
      avgPrice,
      avgCoverage,
      topCategories,
      labCoverage,
    }
  }, [data])

  return { data, loading, error, summary }
}
