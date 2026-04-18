import { NextRequest, NextResponse } from 'next/server'

import { requireServerRoleProfile } from '@/lib/server-platform-auth'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params
  let body: { lab_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.lab_id) {
    return NextResponse.json({ error: 'lab_id is required' }, { status: 400 })
  }

  const { data: application, error: appError } = await auth.serviceClient
    .from('partner_applications')
    .select('id, status, submitted_by')
    .eq('id', id)
    .single()

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  if (application.status !== 'approved') {
    return NextResponse.json({ error: 'Only approved applications can be activated' }, { status: 400 })
  }

  const { data: lab, error: labError } = await auth.serviceClient
    .from('labs')
    .select('id, is_active')
    .eq('id', body.lab_id)
    .single()

  if (labError || !lab) {
    return NextResponse.json({ error: 'Lab not found' }, { status: 404 })
  }

  const activationTimestamp = new Date().toISOString()

  await auth.serviceClient
    .from('labs')
    .update({ is_active: true })
    .eq('id', body.lab_id)

  if (application.submitted_by) {
    await auth.serviceClient
      .from('partner_memberships')
      .upsert({
        user_id: application.submitted_by,
        lab_id: body.lab_id,
        role: 'partner_lab',
        is_active: true,
      }, { onConflict: 'user_id,lab_id' })
  }

  const { data: updatedApplication, error: updateError } = await auth.serviceClient
    .from('partner_applications')
    .update({
      activated_lab_id: body.lab_id,
      activated_by: auth.profile.userId,
      activated_at: activationTimestamp,
      notes: 'Activated into live partner network.',
    })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  await auth.serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_application.activated',
    subject_type: 'partner_application',
    subject_id: id,
    metadata: {
      lab_id: body.lab_id,
    },
  })

  return NextResponse.json({ application: updatedApplication })
}
