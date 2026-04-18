import { NextRequest, NextResponse } from 'next/server'

import { requireServerRoleProfile } from '@/lib/server-platform-auth'

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'compliance', 'ops'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params
  let body: {
    status?: 'uploaded' | 'under_review' | 'approved' | 'rejected'
    rejection_reason?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.status) {
    return NextResponse.json({ error: 'status is required' }, { status: 400 })
  }

  const updatePayload: Record<string, unknown> = {
    status: body.status,
    reviewed_by: auth.profile.userId,
    reviewed_at: new Date().toISOString(),
    rejection_reason: body.status === 'rejected' ? body.rejection_reason ?? 'Rejected during document review.' : null,
  }

  const { data, error } = await auth.serviceClient
    .from('partner_documents')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await auth.serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_document.updated',
    subject_type: 'partner_document',
    subject_id: id,
    metadata: {
      status: data.status,
      rejection_reason: data.rejection_reason,
    },
  })

  return NextResponse.json({ document: data })
}
