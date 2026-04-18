import { NextRequest, NextResponse } from 'next/server'

import { requireServerRoleProfile } from '@/lib/server-platform-auth'

export async function GET(request: NextRequest) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops', 'compliance', 'partner_lab'])
  if (!auth.ok) {
    return auth.response
  }

  let query = auth.serviceClient
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
    .order('created_at', { ascending: false })

  if (auth.profile.roles.includes('partner_lab') && !auth.profile.roles.includes('owner') && !auth.profile.roles.includes('ops') && !auth.profile.roles.includes('compliance')) {
    query = query.eq('submitted_by', auth.profile.userId)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ applications: data ?? [] })
}

export async function POST(request: NextRequest) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops', 'partner_lab'])
  if (!auth.ok) {
    return auth.response
  }

  let body: {
    legal_name?: string
    trading_name?: string
    town?: string
    contact_name?: string
    contact_phone?: string
    contact_email?: string
    notes?: string
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body.legal_name || !body.contact_phone) {
    return NextResponse.json({ error: 'legal_name and contact_phone are required' }, { status: 400 })
  }

  const { data, error } = await auth.serviceClient
    .from('partner_applications')
    .insert({
      legal_name: body.legal_name,
      trading_name: body.trading_name ?? null,
      town: body.town ?? null,
      contact_name: body.contact_name ?? null,
      contact_phone: body.contact_phone,
      contact_email: body.contact_email ?? null,
      notes: body.notes ?? null,
      status: 'submitted',
      submitted_by: auth.profile.userId,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await auth.serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_application.created',
    subject_type: 'partner_application',
    subject_id: data.id,
    metadata: {
      status: data.status,
      legal_name: data.legal_name,
    },
  })

  return NextResponse.json({ application: data }, { status: 201 })
}
