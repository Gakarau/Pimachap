import { NextRequest, NextResponse } from 'next/server'

import { requireServerRoleProfile } from '@/lib/server-platform-auth'

type SchemaColumnRow = {
  column_name: string
  data_type: string
  is_nullable: 'YES' | 'NO'
  column_default: string | null
}

export async function GET(request: NextRequest) {
  const auth = await requireServerRoleProfile(request, ['owner', 'ops'])
  if (!auth.ok) {
    return auth.response
  }

  const { data, error } = await auth.serviceClient
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public')
    .eq('table_name', 'labs')
    .order('ordinal_position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    table: 'public.labs',
    columns: (data ?? []) as SchemaColumnRow[],
  })
}
