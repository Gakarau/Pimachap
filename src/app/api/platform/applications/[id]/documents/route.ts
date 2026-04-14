import { NextRequest, NextResponse } from 'next/server'

import { requireServerRoleProfile } from '@/lib/server-platform-auth'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops', 'compliance', 'partner_lab'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params

  const { data: application } = await auth.serviceClient
    .from('partner_applications')
    .select('id, submitted_by')
    .eq('id', id)
    .single()

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (
    auth.profile.roles.includes('partner_lab') &&
    !auth.profile.roles.includes('owner') &&
    !auth.profile.roles.includes('ops') &&
    !auth.profile.roles.includes('compliance') &&
    application.submitted_by !== auth.profile.userId
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await auth.serviceClient
    .from('partner_documents')
    .select(`
      id,
      application_id,
      document_type,
      file_path,
      status,
      uploaded_by,
      reviewed_by,
      reviewed_at,
      rejection_reason,
      created_at,
      updated_at
    `)
    .eq('application_id', id)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ documents: data ?? [] })
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops', 'partner_lab', 'compliance'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params
  const body = (await request.json()) as {
    document_type?: string
    file_path?: string
    status?: 'uploaded' | 'under_review' | 'approved' | 'rejected'
    rejection_reason?: string
  }

  if (!body.document_type || !body.file_path) {
    return NextResponse.json({ error: 'document_type and file_path are required' }, { status: 400 })
  }

  const { data, error } = await auth.serviceClient
    .from('partner_documents')
    .insert({
      application_id: id,
      document_type: body.document_type,
      file_path: body.file_path,
      status: body.status ?? 'uploaded',
      uploaded_by: auth.profile.userId,
      rejection_reason: body.rejection_reason ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await auth.serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_document.created',
    subject_type: 'partner_document',
    subject_id: data.id,
    metadata: {
      application_id: id,
      document_type: data.document_type,
      status: data.status,
    },
  })

  return NextResponse.json({ document: data }, { status: 201 })
}
