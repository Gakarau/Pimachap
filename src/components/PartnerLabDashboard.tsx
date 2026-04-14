'use client'

import { useState } from 'react'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import {
  createPartnerApplication,
  createPartnerDocument,
  loadPartnerDocuments,
  uploadPartnerDocument,
  usePartnerApplications,
  type PartnerDocument,
} from '@/lib/use-partner-applications'
import { usePlatformData } from '@/lib/use-platform-data'

export default function PartnerLabDashboard() {
  const { data, loading } = usePlatformData()
  const { applications, loading: applicationsLoading, error, reload } = usePartnerApplications()
  const [submitting, setSubmitting] = useState(false)
  const [documentBusy, setDocumentBusy] = useState<string | null>(null)
  const [documentsByApplication, setDocumentsByApplication] = useState<Record<string, PartnerDocument[]>>({})
  const [uploadFiles, setUploadFiles] = useState<Record<string, File | null>>({})
  const [form, setForm] = useState({
    legal_name: '',
    trading_name: '',
    town: '',
    contact_name: '',
    contact_phone: '',
    contact_email: '',
    notes: '',
  })
  const [documentForm, setDocumentForm] = useState<Record<string, { document_type: string; file_path: string }>>({})

  async function submitApplication() {
    setSubmitting(true)
    await createPartnerApplication(form)
    setForm({
      legal_name: '',
      trading_name: '',
      town: '',
      contact_name: '',
      contact_phone: '',
      contact_email: '',
      notes: '',
    })
    setSubmitting(false)
    reload()
  }

  async function toggleDocuments(applicationId: string) {
    if (documentsByApplication[applicationId]) {
      setDocumentsByApplication((current) => {
        const next = { ...current }
        delete next[applicationId]
        return next
      })
      return
    }

    const payload = await loadPartnerDocuments(applicationId)
    setDocumentsByApplication((current) => ({
      ...current,
      [applicationId]: payload.documents ?? [],
    }))
  }

  async function addDocument(applicationId: string) {
    const current = documentForm[applicationId]
    if (!current?.document_type || !current.file_path) {
      return
    }

    setDocumentBusy(applicationId)
    await createPartnerDocument(applicationId, current)
    const payload = await loadPartnerDocuments(applicationId)
    setDocumentsByApplication((existing) => ({
      ...existing,
      [applicationId]: payload.documents ?? [],
    }))
    setDocumentForm((existing) => ({
      ...existing,
      [applicationId]: { document_type: '', file_path: '' },
    }))
    setDocumentBusy(null)
  }

  async function uploadDocument(applicationId: string) {
    const current = documentForm[applicationId]
    const file = uploadFiles[applicationId]
    if (!current?.document_type || !file) {
      return
    }

    setDocumentBusy(applicationId)
    await uploadPartnerDocument(applicationId, {
      document_type: current.document_type,
      file,
    })
    const payload = await loadPartnerDocuments(applicationId)
    setDocumentsByApplication((existing) => ({
      ...existing,
      [applicationId]: payload.documents ?? [],
    }))
    setUploadFiles((existing) => ({
      ...existing,
      [applicationId]: null,
    }))
    setDocumentBusy(null)
  }

  return (
    <ProtectedWorkspace allowedRoles={['owner', 'ops', 'partner_lab']}>
      {({ scopedLabIds, phone }) => {
        const scopedLabs = (data?.labs ?? []).filter((lab) => scopedLabIds.includes(lab.id))
        const scopedPricing = (data?.pricing ?? []).filter((row) => scopedLabIds.includes(row.lab_id))

        return (
          <RoleWorkspace
            role="partner_lab"
            title="Partner lab self-service workspace."
            subtitle="Partner labs are restricted by assigned lab IDs. This workspace now includes real application intake and KYC document record submission."
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
                    {error ? (
                      <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--amber-light)', color: '#9A6500' }}>
                        {error}
                      </div>
                    ) : null}
                  </div>
                </section>

                <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                  <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>Submit Partner Application</h2>
                  <div className="mt-5 grid gap-3">
                    {[
                      ['legal_name', 'Legal name'],
                      ['trading_name', 'Trading name'],
                      ['town', 'Town'],
                      ['contact_name', 'Contact name'],
                      ['contact_phone', 'Contact phone'],
                      ['contact_email', 'Contact email'],
                    ].map(([key, label]) => (
                      <input
                        key={key}
                        value={form[key as keyof typeof form]}
                        onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))}
                        placeholder={label}
                        className="w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] outline-none"
                        style={{ borderColor: 'var(--border)' }}
                      />
                    ))}
                    <textarea
                      value={form.notes}
                      onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                      placeholder="Notes"
                      className="min-h-[96px] w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] outline-none"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <button className="rounded-full px-4 py-3 text-[14px] font-bold text-white" style={{ background: 'var(--teal)' }} onClick={submitApplication} disabled={submitting}>
                      {submitting ? 'Submitting...' : 'Submit application'}
                    </button>
                  </div>
                </section>
              </div>
            )}

            {!loading && (
              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                  <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>Scoped Labs</h2>
                  <div className="mt-5 space-y-3">
                    {scopedLabs.length > 0 ? (
                      scopedLabs.map((lab) => (
                        <div key={lab.id} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                          <div className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>{lab.name}</div>
                          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>{lab.town}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[22px] p-4 text-[13px] leading-6" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>
                        No lab IDs have been assigned to this partner account yet.
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
                  <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>My Applications</h2>
                  <div className="mt-5 space-y-3">
                    {applicationsLoading ? (
                      <div className="rounded-[22px] p-4 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>Loading applications...</div>
                    ) : applications.length === 0 ? (
                      <div className="rounded-[22px] p-4 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>No applications submitted yet.</div>
                    ) : (
                      applications.map((application) => (
                        <div key={application.id} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>{application.legal_name}</div>
                              <div className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>{application.status}</div>
                            </div>
                            <button className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--teal-pale)', color: 'var(--teal-dark)' }} onClick={() => toggleDocuments(application.id)}>
                              {documentsByApplication[application.id] ? 'Hide docs' : 'View docs'}
                            </button>
                          </div>

                          {documentsByApplication[application.id] ? (
                            <div className="mt-4 space-y-3">
                              {(documentsByApplication[application.id] ?? []).map((document) => (
                                <div key={document.id} className="rounded-[18px] p-3 text-[12px]" style={{ background: '#fff' }}>
                                  <div className="font-bold" style={{ color: 'var(--text)' }}>
                                    {document.document_type}
                                  </div>
                                  <div className="mt-1" style={{ color: 'var(--text-soft)' }}>
                                    {document.file_path}
                                  </div>
                                  <div className="mt-1" style={{ color: 'var(--text-mid)' }}>
                                    Status: {document.status}
                                  </div>
                                  {document.rejection_reason ? (
                                    <div className="mt-2 rounded-[12px] px-3 py-2" style={{ background: 'var(--amber-light)', color: '#9A6500' }}>
                                      Reason: {document.rejection_reason}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                              <input
                                value={documentForm[application.id]?.document_type ?? ''}
                                onChange={(event) => setDocumentForm((current) => ({
                                  ...current,
                                  [application.id]: {
                                    document_type: event.target.value,
                                    file_path: current[application.id]?.file_path ?? '',
                                  },
                                }))}
                                placeholder="Document type"
                                className="w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] outline-none"
                                style={{ borderColor: 'var(--border)' }}
                              />
                              <input
                                value={documentForm[application.id]?.file_path ?? ''}
                                onChange={(event) => setDocumentForm((current) => ({
                                  ...current,
                                  [application.id]: {
                                    document_type: current[application.id]?.document_type ?? '',
                                    file_path: event.target.value,
                                  },
                                }))}
                                placeholder="File path or storage key"
                                className="w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] outline-none"
                                style={{ borderColor: 'var(--border)' }}
                              />
                              <input
                                type="file"
                                onChange={(event) => setUploadFiles((current) => ({
                                  ...current,
                                  [application.id]: event.target.files?.[0] ?? null,
                                }))}
                                className="w-full rounded-[14px] border bg-white px-4 py-3 text-[14px] outline-none"
                                style={{ borderColor: 'var(--border)' }}
                              />
                              <button className="rounded-full px-3 py-2 text-[12px] font-bold text-white" style={{ background: 'var(--teal)' }} onClick={() => addDocument(application.id)} disabled={documentBusy === application.id}>
                                {documentBusy === application.id ? 'Saving...' : 'Add document record'}
                              </button>
                              <button className="rounded-full px-3 py-2 text-[12px] font-bold text-white" style={{ background: 'var(--teal-dark)' }} onClick={() => uploadDocument(application.id)} disabled={documentBusy === application.id}>
                                {documentBusy === application.id ? 'Uploading...' : 'Upload file to storage'}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      ))
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
