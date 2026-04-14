'use client'

import { useState } from 'react'

import ProtectedWorkspace from '@/components/ProtectedWorkspace'
import RoleWorkspace from '@/components/RoleWorkspace'
import {
  loadPartnerDocuments,
  updatePartnerApplication,
  updatePartnerDocument,
  usePartnerApplications,
  type PartnerDocument,
} from '@/lib/use-partner-applications'

const checks = [
  'Business registration documents',
  'Lab operating license and accreditation',
  'Responsible contact and phone verification',
  'Address and service-town verification',
  'KMLTTB and related professional compliance requirements',
]

export default function ComplianceDashboard() {
  const { applications, loading, error, reload } = usePartnerApplications()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [documentsByApplication, setDocumentsByApplication] = useState<Record<string, PartnerDocument[]>>({})
  const [documentBusyId, setDocumentBusyId] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<Record<string, string>>({})

  async function decide(id: string, status: 'under_review' | 'approved' | 'rejected', decision?: 'approved' | 'rejected' | 'needs_changes') {
    setBusyId(id)
    await updatePartnerApplication(id, {
      status,
      decision,
      notes: status === 'approved' ? 'Compliance approved.' : status === 'rejected' ? 'Compliance rejected.' : 'Compliance review started.',
    })
    setBusyId(null)
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

  async function reviewDocument(
    applicationId: string,
    documentId: string,
    status: 'under_review' | 'approved' | 'rejected'
  ) {
    setDocumentBusyId(documentId)
    await updatePartnerDocument(documentId, {
      status,
      rejection_reason: status === 'rejected' ? rejectionReasons[documentId] ?? 'Rejected during compliance review.' : undefined,
    })
    const payload = await loadPartnerDocuments(applicationId)
    setDocumentsByApplication((current) => ({
      ...current,
      [applicationId]: payload.documents ?? [],
    }))
    setDocumentBusyId(null)
  }

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
              <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>Review Queue</h2>
              <div className="mt-5 space-y-3">
                {loading ? (
                  <div className="rounded-[22px] p-4 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>Loading applications...</div>
                ) : applications.length === 0 ? (
                  <div className="rounded-[22px] p-4 text-[13px]" style={{ background: 'var(--bg)', color: 'var(--text-mid)' }}>No partner applications yet.</div>
                ) : (
                  applications.map((application) => (
                    <div key={application.id} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[15px] font-extrabold" style={{ color: 'var(--text)' }}>{application.legal_name}</div>
                          <div className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>
                            {application.town ?? 'Town not set'} · {application.contact_phone}
                          </div>
                        </div>
                        <span className="text-[12px] font-bold uppercase" style={{ color: 'var(--teal-dark)' }}>{application.status}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--teal-pale)', color: 'var(--teal-dark)' }} onClick={() => toggleDocuments(application.id)}>
                          {documentsByApplication[application.id] ? 'Hide docs' : 'Review docs'}
                        </button>
                        <button className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--amber-light)', color: '#9A6500' }} onClick={() => decide(application.id, 'under_review')} disabled={busyId === application.id}>
                          Start review
                        </button>
                        <button className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--green-pale)', color: 'var(--green)' }} onClick={() => decide(application.id, 'approved', 'approved')} disabled={busyId === application.id}>
                          Approve
                        </button>
                        <button className="rounded-full px-3 py-1.5 text-[12px] font-bold" style={{ background: 'var(--red-pale)', color: 'var(--red)' }} onClick={() => decide(application.id, 'rejected', 'rejected')} disabled={busyId === application.id}>
                          Reject
                        </button>
                      </div>

                      {documentsByApplication[application.id] ? (
                        <div className="mt-4 space-y-3">
                          {(documentsByApplication[application.id] ?? []).length > 0 ? (
                            (documentsByApplication[application.id] ?? []).map((document) => (
                              <div key={document.id} className="rounded-[18px] bg-white p-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-[13px] font-bold" style={{ color: 'var(--text)' }}>
                                      {document.document_type}
                                    </div>
                                    <div className="mt-1 text-[12px]" style={{ color: 'var(--text-soft)' }}>
                                      {document.file_path}
                                    </div>
                                    <div className="mt-1 text-[12px]" style={{ color: 'var(--text-mid)' }}>
                                      Status: {document.status}
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    <button className="rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: 'var(--amber-light)', color: '#9A6500' }} onClick={() => reviewDocument(application.id, document.id, 'under_review')} disabled={documentBusyId === document.id}>
                                      Review
                                    </button>
                                    <button className="rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: 'var(--green-pale)', color: 'var(--green)' }} onClick={() => reviewDocument(application.id, document.id, 'approved')} disabled={documentBusyId === document.id}>
                                      Approve
                                    </button>
                                    <button className="rounded-full px-3 py-1.5 text-[11px] font-bold" style={{ background: 'var(--red-pale)', color: 'var(--red)' }} onClick={() => reviewDocument(application.id, document.id, 'rejected')} disabled={documentBusyId === document.id}>
                                      Reject
                                    </button>
                                  </div>
                                </div>

                                <input
                                  value={rejectionReasons[document.id] ?? ''}
                                  onChange={(event) => setRejectionReasons((current) => ({ ...current, [document.id]: event.target.value }))}
                                  placeholder="Rejection reason if needed"
                                  className="mt-3 w-full rounded-[12px] border bg-[var(--bg)] px-3 py-2 text-[12px] outline-none"
                                  style={{ borderColor: 'var(--border)' }}
                                />
                              </div>
                            ))
                          ) : (
                            <div className="rounded-[18px] bg-white p-3 text-[12px]" style={{ color: 'var(--text-mid)' }}>
                              No documents uploaded yet for this application.
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border bg-white p-5 md:p-6" style={{ borderColor: 'var(--border)', boxShadow: 'var(--sh)' }}>
              <h2 className="text-[20px] font-extrabold" style={{ color: 'var(--text)' }}>Approval Checklist</h2>
              {error ? <div className="mt-3 rounded-[18px] p-3 text-[12px]" style={{ background: 'var(--amber-light)', color: '#9A6500' }}>{error}</div> : null}
              <div className="mt-5 space-y-3 text-[13px] leading-6" style={{ color: 'var(--text-mid)' }}>
                {checks.map((item) => (
                  <div key={item} className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                    {item}
                  </div>
                ))}
                <div className="rounded-[22px] p-4" style={{ background: 'var(--bg)' }}>
                  Decisions are written to `approval_decisions` and `audit_events`.
                </div>
              </div>
            </section>
          </div>
        </RoleWorkspace>
      )}
    </ProtectedWorkspace>
  )
}
