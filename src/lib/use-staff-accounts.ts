'use client'

import { useCallback, useEffect, useState } from 'react'

import { PLATFORM_ROLES, type PlatformRole } from '@/lib/rbac'
import { supabase } from '@/lib/supabase'

export type StaffAccount = {
  id: string
  user_id: string
  phone: string | null
  display_name: string | null
  primary_role: PlatformRole
  roles: PlatformRole[]
  is_active: boolean
  created_at: string
  updated_at: string
}

type StaffPayload = {
  phone: string
  display_name?: string
  primary_role: PlatformRole
  roles?: PlatformRole[]
}

type StaffUpdatePayload = {
  phone?: string
  display_name?: string | null
  primary_role?: PlatformRole
  roles?: PlatformRole[]
  is_active?: boolean
}

export function useStaffAccounts() {
  const [staff, setStaff] = useState<StaffAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStaff = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: sessionData } = await supabase.auth.getSession()
    const accessToken = sessionData.session?.access_token

    if (!accessToken) {
      setStaff([])
      setLoading(false)
      setError('You must be signed in to manage staff accounts.')
      return
    }

    const response = await fetch('/api/platform/staff', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const payload = (await response.json()) as {
      error?: string
      staff?: StaffAccount[]
    }

    if (!response.ok) {
      setStaff([])
      setError(payload.error ?? 'Unable to load staff accounts.')
      setLoading(false)
      return
    }

    setStaff(payload.staff ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchStaff()
  }, [fetchStaff])

  const createStaff = useCallback(
    async (input: StaffPayload) => {
      setSaving(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch('/api/platform/staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(input),
      })

      const payload = (await response.json()) as {
        error?: string
        staff?: StaffAccount
      }

      if (!response.ok || !payload.staff) {
        setSaving(false)
        setError(payload.error ?? 'Unable to save staff account.')
        return false
      }

      const savedStaff = payload.staff
      setStaff((current) => {
        const next = current.filter((item) => item.user_id !== savedStaff.user_id)
        next.push(savedStaff)
        return next.sort((a, b) => a.created_at.localeCompare(b.created_at))
      })
      setSaving(false)
      return true
    },
    []
  )

  const updateStaff = useCallback(
    async (userId: string, input: StaffUpdatePayload) => {
      setSaving(true)
      setError(null)

      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData.session?.access_token

      const response = await fetch(`/api/platform/staff/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(input),
      })

      const payload = (await response.json()) as {
        error?: string
        staff?: StaffAccount
      }

      if (!response.ok || !payload.staff) {
        setSaving(false)
        setError(payload.error ?? 'Unable to update staff account.')
        return false
      }

      const updatedStaff = payload.staff
      setStaff((current) =>
        current
          .map((item) => (item.user_id === userId ? updatedStaff : item))
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
      )
      setSaving(false)
      return true
    },
    []
  )

  return {
    staff,
    loading,
    saving,
    error,
    availableRoles: PLATFORM_ROLES,
    refresh: fetchStaff,
    createStaff,
    updateStaff,
  }
}
