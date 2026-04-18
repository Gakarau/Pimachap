import { NextRequest, NextResponse } from 'next/server'

import { createPlatformServiceClient, getPartnerDocumentBucket, requireServerRoleProfile } from '@/lib/server-platform-auth'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const ALLOWED_DOCUMENT_TYPES = new Set([
  'business_registration',
  'tax_compliance',
  'facility_license',
  'accreditation_certificate',
  'director_id',
  'bank_statement',
  'other',
])

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops', 'partner_lab', 'compliance'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params
  const formData = await request.formData()
  const file = formData.get('file')
  const documentType = formData.get('document_type')

  if (!(file instanceof File) || typeof documentType !== 'string' || documentType.length === 0) {
    return NextResponse.json({ error: 'file and document_type are required' }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File exceeds 10 MB limit' }, { status: 400 })
  }

  if (file.size === 0) {
    return NextResponse.json({ error: 'File is empty' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Unsupported file type. Allowed: PDF, JPEG, PNG, DOC, DOCX' },
      { status: 400 }
    )
  }

  if (!ALLOWED_DOCUMENT_TYPES.has(documentType)) {
    return NextResponse.json(
      { error: `Invalid document_type. Allowed: ${[...ALLOWED_DOCUMENT_TYPES].join(', ')}` },
      { status: 400 }
    )
  }

  const bucket = getPartnerDocumentBucket()
  const serviceClient = createPlatformServiceClient()
  const fileExtension = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : ''
  const storagePath = `${id}/${Date.now()}-${documentType}${fileExtension}`
  const bytes = Buffer.from(await file.arrayBuffer())

  const { error: uploadError } = await serviceClient.storage
    .from(bucket)
    .upload(storagePath, bytes, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: documentRecord, error: documentError } = await serviceClient
    .from('partner_documents')
    .insert({
      application_id: id,
      document_type: documentType,
      file_path: storagePath,
      status: 'uploaded',
      uploaded_by: auth.profile.userId,
    })
    .select()
    .single()

  if (documentError) {
    return NextResponse.json({ error: documentError.message }, { status: 500 })
  }

  await serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_document.uploaded',
    subject_type: 'partner_document',
    subject_id: documentRecord.id,
    metadata: {
      application_id: id,
      bucket,
      file_path: storagePath,
    },
  })

  return NextResponse.json({ document: documentRecord }, { status: 201 })
}
