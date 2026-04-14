'use client'

import { useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

type LabsSchemaColumn = {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
}

export function useLabsSchema() {
  const [columns, setColumns] = useState<LabsSchemaColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token

      const response = await fetch('/api/platform/schema/labs', {
        headers: token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : undefined,
      })

      const payload = (await response.json()) as {
        columns?: LabsSchemaColumn[]
        error?: string
      }

      if (cancelled) {
        return
      }

      if (!response.ok) {
        setError(payload.error ?? 'Failed to load labs schema')
        setLoading(false)
        return
      }

      setColumns(payload.columns ?? [])
      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  return { columns, loading, error }
}
