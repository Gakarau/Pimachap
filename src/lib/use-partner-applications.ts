'use client'

import { useCallback, useEffect, useState } from 'react'

import { supabase } from '@/lib/supabase'

export type PartnerApplication = {
  id: string
  legal_name: string
  trading_name: string | null
  town: string | null
  contact_name: string | null
  contact_phone: string
  contact_email: string | null
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submitted_by: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PartnerDocument = {
  id: string
  application_id: string
  document_type: string
  file_path: string
  status: 'uploaded' | 'under_review' | 'approved' | 'rejected'
  uploaded_by: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

async function getAuthHeaders() {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export function usePartnerApplications() {
  const [applications, setApplications] = useState<PartnerApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const reload = useCallback(() => {
    setRefreshKey((value) => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')

      const response = await fetch('/api/platform/applications', {
        headers: await getAuthHeaders(),
      })

      const payload = (await response.json()) as { applications?: PartnerApplication[]; error?: string }

      if (cancelled) {
        return
      }

      if (!response.ok) {
        setError(payload.error ?? 'Failed to load applications')
        setLoading(false)
        return
      }

      setApplications(payload.applications ?? [])
      setLoading(false)
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  return { applications, loading, error, reload }
}

export async function createPartnerApplication(input: {
  legal_name: string
  trading_name?: string
  town?: string
  contact_name?: string
  contact_phone: string
  contact_email?: string
  notes?: string
}) {
  const response = await fetch('/api/platform/applications', {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  })

  return response.json()
}

export async function updatePartnerApplication(
  id: string,
  input: {
    status?: 'submitted' | 'under_review' | 'approved' | 'rejected'
    notes?: string
    decision?: 'approved' | 'rejected' | 'needs_changes'
  }
) {
  const response = await fetch(`/api/platform/applications/${id}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  })

  return response.json()
}

export async function loadPartnerDocuments(applicationId: string) {
  const response = await fetch(`/api/platform/applications/${applicationId}/documents`, {
    headers: await getAuthHeaders(),
  })

  return response.json() as Promise<{ documents?: PartnerDocument[]; error?: string }>
}

export async function createPartnerDocument(
  applicationId: string,
  input: {
    document_type: string
    file_path: string
  }
) {
  const response = await fetch(`/api/platform/applications/${applicationId}/documents`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  })

  return response.json()
}

export async function updatePartnerDocument(
  documentId: string,
  input: {
    status: 'uploaded' | 'under_review' | 'approved' | 'rejected'
    rejection_reason?: string
  }
) {
  const response = await fetch(`/api/platform/documents/${documentId}`, {
    method: 'PATCH',
    headers: await getAuthHeaders(),
    body: JSON.stringify(input),
  })

  return response.json()
}

export async function uploadPartnerDocument(
  applicationId: string,
  input: {
    document_type: string
    file: File
  }
) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  const formData = new FormData()
  formData.append('document_type', input.document_type)
  formData.append('file', input.file)

  const response = await fetch(`/api/platform/applications/${applicationId}/documents/upload`, {
    method: 'POST',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
    body: formData,
  })

  return response.json()
}

export async function activatePartnerApplication(applicationId: string, labId: string) {
  const response = await fetch(`/api/platform/applications/${applicationId}/activate`, {
    method: 'POST',
    headers: await getAuthHeaders(),
    body: JSON.stringify({ lab_id: labId }),
  })

  return response.json()
}

export async function provisionLabFromApplication(applicationId: string) {
  const response = await fetch(`/api/platform/applications/${applicationId}/provision-lab`, {
    method: 'POST',
    headers: await getAuthHeaders(),
  })

  return response.json() as Promise<{
    lab_id?: string
    payload_columns?: string[]
    missing_required_columns?: string[]
    error?: string
  }>
}
