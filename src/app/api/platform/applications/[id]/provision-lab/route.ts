import { NextRequest, NextResponse } from 'next/server'

import { getTableSchema, requireServerRoleProfile } from '@/lib/server-platform-auth'

type ApplicationRow = {
  id: string
  legal_name: string
  trading_name: string | null
  town: string | null
  contact_name: string | null
  contact_phone: string
  contact_email: string | null
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected'
  submitted_by: string | null
  activated_lab_id: string | null
}

function buildLabPayload(application: ApplicationRow, availableColumns: Set<string>) {
  const payload: Record<string, unknown> = {}

  const assign = (column: string, value: unknown) => {
    if (availableColumns.has(column)) {
      payload[column] = value
    }
  }

  assign('name', application.trading_name || application.legal_name)
  assign('town', application.town)
  assign('is_active', false)
  assign('rating', 0)
  assign('review_count', 0)
  assign('turnaround_hours', null)
  assign('contact_name', application.contact_name)
  assign('contact_phone', application.contact_phone)
  assign('contact_email', application.contact_email)

  return payload
}

function getMissingRequiredColumns(
  columns: Awaited<ReturnType<typeof getTableSchema>>,
  payload: Record<string, unknown>
) {
  const ignoredColumns = new Set(['id', 'created_at', 'updated_at'])

  return columns
    .filter((column) => !ignoredColumns.has(column.column_name))
    .filter((column) => column.is_nullable === 'NO')
    .filter((column) => column.column_default == null)
    .filter((column) => !(column.column_name in payload))
    .map((column) => column.column_name)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops'])
  if (!auth.ok) {
    return auth.response
  }

  const { id } = await context.params
  const { data: application, error: applicationError } = await auth.serviceClient
    .from('partner_applications')
    .select('id, legal_name, trading_name, town, contact_name, contact_phone, contact_email, status, submitted_by, activated_lab_id')
    .eq('id', id)
    .single()

  if (applicationError || !application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 })
  }

  const typedApplication = application as ApplicationRow

  if (typedApplication.status !== 'approved') {
    return NextResponse.json({ error: 'Only approved applications can be provisioned into labs' }, { status: 400 })
  }

  if (typedApplication.activated_lab_id) {
    return NextResponse.json({ error: 'This application is already linked to a lab' }, { status: 400 })
  }

  let schema
  try {
    schema = await getTableSchema('labs', auth.serviceClient)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to inspect labs schema' },
      { status: 500 }
    )
  }

  const availableColumns = new Set(schema.map((column) => column.column_name))
  const payload = buildLabPayload(typedApplication, availableColumns)
  const missingRequiredColumns = getMissingRequiredColumns(schema, payload)

  if (missingRequiredColumns.length > 0) {
    return NextResponse.json(
      {
        error: 'Lab provisioning blocked by required schema columns.',
        missing_required_columns: missingRequiredColumns,
      },
      { status: 400 }
    )
  }

  const { data: lab, error: labError } = await auth.serviceClient
    .from('labs')
    .insert(payload)
    .select('id')
    .single()

  if (labError || !lab) {
    return NextResponse.json({ error: labError?.message ?? 'Failed to create lab' }, { status: 500 })
  }

  const timestamp = new Date().toISOString()

  await auth.serviceClient
    .from('partner_applications')
    .update({
      activated_lab_id: lab.id,
      activated_by: auth.profile.userId,
      activated_at: timestamp,
      notes: 'Lab record provisioned from approved application.',
    })
    .eq('id', id)

  if (typedApplication.submitted_by) {
    await auth.serviceClient
      .from('partner_memberships')
      .upsert(
        {
          user_id: typedApplication.submitted_by,
          lab_id: lab.id,
          role: 'partner_lab',
          is_active: true,
        },
        { onConflict: 'user_id,lab_id' }
      )
  }

  await auth.serviceClient.from('audit_events').insert({
    actor_user_id: auth.profile.userId,
    actor_role: auth.profile.primaryRole,
    event_type: 'partner_application.lab_provisioned',
    subject_type: 'partner_application',
    subject_id: id,
    metadata: {
      lab_id: lab.id,
      payload_columns: Object.keys(payload),
    },
  })

  return NextResponse.json({
    lab_id: lab.id,
    payload_columns: Object.keys(payload),
  })
}
