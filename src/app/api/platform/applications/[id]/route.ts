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
  const { data, error } = await auth.serviceClient
    .from('partner_applications')
    .select(`
      id,
      legal_name,
      trading_name,
      town,
      contact_name,
      contact_phone,
      contact_email,
      status,
      submitted_by,
      reviewed_by,
      reviewed_at,
      notes,
      created_at,
      updated_at
    `)
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  if (
    auth.profile.roles.includes('partner_lab') &&
    !auth.profile.roles.includes('owner') &&
    !auth.profile.roles.includes('ops') &&
    !auth.profile.roles.includes('compliance') &&
    data.submitted_by !== auth.profile.userId
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ application: data })
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops', 'compliance'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params
  const body = (await request.json()) as {
    status?: 'submitted' | 'under_review' | 'approved' | 'rejected'
    notes?: string
    decision?: 'approved' | 'rejected' | 'needs_changes'
  }

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (body.status) {
    updatePayload.status = body.status
  }
  if (body.notes !== undefined) {
    updatePayload.notes = body.notes
  }
  if (body.status === 'approved' || body.status === 'rejected' || body.status === 'under_review') {
    updatePayload.reviewed_by = auth.profile.userId
    updatePayload.reviewed_at = new Date().toISOString()
  }

  const { data, error } = await auth.serviceClient
    .from('partner_applications')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (body.decision) {
    await auth.serviceClient.from('approval_decisions').insert({
      subject_type: 'partner_application',
      subject_id: id,
      decision: body.decision,
      decided_by: auth.profile.userId,
      notes: body.notes ?? null,
    })
  }

  await auth.serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_application.updated',
    subject_type: 'partner_application',
    subject_id: id,
    metadata: {
      status: data.status,
      decision: body.decision ?? null,
    },
  })

  return NextResponse.json({ application: data })
}
