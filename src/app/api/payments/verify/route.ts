import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role configuration')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function GET(request: NextRequest) {
  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ error: 'reference is required' }, { status: 400 })
  }

  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackKey) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
  }

  // ── Verify with Paystack ─────────────────────────────────────────────────
  let paystackRes: Response
  try {
    paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: { Authorization: `Bearer ${paystackKey}` },
        cache: 'no-store',
      }
    )
  } catch {
    return NextResponse.json({ error: 'Payment service unreachable' }, { status: 503 })
  }

  if (!paystackRes.ok) {
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 502 })
  }

  const paystackData = (await paystackRes.json()) as {
    status: boolean
    data: {
      status: string
      reference: string
      amount: number
      currency: string
      paid_at: string
      channel: string
      metadata: { order_id?: string; order_number?: string }
    }
  }

  if (!paystackData.status || paystackData.data.status !== 'success') {
    return NextResponse.json(
      { error: 'Payment not successful', paystack_status: paystackData.data?.status ?? 'unknown' },
      { status: 402 }
    )
  }

  const txn = paystackData.data

  // ── Fetch order ──────────────────────────────────────────────────────────
  let serviceClient: ReturnType<typeof getServiceClient>
  try {
    serviceClient = getServiceClient()
  } catch {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
  }

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .select('id, order_number, status, total_amount_kes, booking_metadata, lab_id')
    .eq('paystack_reference', reference)
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Order not found for this reference' }, { status: 404 })
  }

  // ── Idempotent: already confirmed ────────────────────────────────────────
  if (order.status === 'confirmed') {
    return NextResponse.json({ order, already_confirmed: true })
  }

  // ── Confirm order ────────────────────────────────────────────────────────
  const { error: updateError } = await serviceClient
    .from('orders')
    .update({ status: 'confirmed' })
    .eq('id', order.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to confirm order' }, { status: 500 })
  }

  // ── Record payment ───────────────────────────────────────────────────────
  await serviceClient.from('payments').insert({
    order_id: order.id,
    provider: 'paystack',
    provider_reference: txn.reference,
    amount_kes: Math.round(txn.amount / 100),
    status: 'confirmed',
    raw_payload: paystackData as unknown as Record<string, unknown>,
  })

  return NextResponse.json({ order: { ...order, status: 'confirmed' }, already_confirmed: false })
}
