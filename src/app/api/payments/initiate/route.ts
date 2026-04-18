import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

import { getAuthenticatedUser, resolvePaystackEmail } from '@/lib/consumer-auth'

const RIDER_FEE_KES = 300

function generateOrderNumber(): string {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `PCH-${yy}${mm}${dd}-${suffix}`
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase service role configuration')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export async function POST(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const user = await getAuthenticatedUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Sign in to complete your booking' }, { status: 401 })
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: {
    cart?: unknown
    selectedLab?: { id?: string; name?: string; total_price?: number; turnaround_hours?: number; town?: string; rating?: number }
    schedule?: { date?: string; timeSlotId?: string; timeSlotLabel?: string; addressLine?: string; landmark?: string }
    delivery?: unknown
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { cart, selectedLab, schedule, delivery } = body

  if (!selectedLab?.id || !selectedLab.total_price || !schedule?.date || !schedule.addressLine) {
    return NextResponse.json({ error: 'Incomplete booking details' }, { status: 400 })
  }

  // ── Paystack config ─────────────────────────────────────────────────────
  const paystackKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackKey) {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const grandTotal = selectedLab.total_price + RIDER_FEE_KES
  const orderNumber = generateOrderNumber()
  const email = resolvePaystackEmail(user)

  const patientPhone = user.phone ?? null
  const patientName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : patientPhone ?? 'Patient'

  // ── Create pending order ─────────────────────────────────────────────────
  let serviceClient: ReturnType<typeof getServiceClient>
  try {
    serviceClient = getServiceClient()
  } catch {
    return NextResponse.json({ error: 'Payment service not configured' }, { status: 503 })
  }

  const { data: order, error: orderError } = await serviceClient
    .from('orders')
    .insert({
      order_number: orderNumber,
      patient_name: patientName,
      patient_phone: patientPhone ?? 'unknown',
      lab_id: selectedLab.id,
      status: 'pending_payment',
      total_amount_kes: grandTotal,
      platform_fee_kes: 0,
      lab_payout_kes: selectedLab.total_price,
      rider_fee_kes: RIDER_FEE_KES,
      booked_by: user.id,
      booking_metadata: { cart, selectedLab, schedule, delivery },
    })
    .select('id')
    .single()

  if (orderError || !order) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }

  // ── Initialize Paystack transaction ──────────────────────────────────────
  let paystackRes: Response
  try {
    paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: grandTotal * 100, // Paystack uses smallest currency unit (KES cents)
        currency: 'KES',
        reference: orderNumber,
        callback_url: `${appUrl}/confirmation`,
        channels: ['mobile_money', 'card', 'bank_transfer'],
        metadata: {
          order_id: order.id,
          order_number: orderNumber,
          lab_name: selectedLab.name,
          custom_fields: [
            { display_name: 'Order', variable_name: 'order_number', value: orderNumber },
            { display_name: 'Lab', variable_name: 'lab_name', value: selectedLab.name ?? '' },
          ],
        },
      }),
    })
  } catch {
    // Clean up the pending order if Paystack is unreachable
    await serviceClient.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Payment service unreachable' }, { status: 503 })
  }

  if (!paystackRes.ok) {
    await serviceClient.from('orders').delete().eq('id', order.id)
    const detail = await paystackRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: (detail as { message?: string }).message ?? 'Payment initialization failed' },
      { status: 502 }
    )
  }

  const paystackData = (await paystackRes.json()) as {
    status: boolean
    data: { authorization_url: string; reference: string }
  }

  if (!paystackData.status || !paystackData.data?.authorization_url) {
    await serviceClient.from('orders').delete().eq('id', order.id)
    return NextResponse.json({ error: 'Invalid response from payment provider' }, { status: 502 })
  }

  // ── Store Paystack reference on the order ────────────────────────────────
  await serviceClient
    .from('orders')
    .update({ paystack_reference: paystackData.data.reference })
    .eq('id', order.id)

  return NextResponse.json({
    authorization_url: paystackData.data.authorization_url,
    order_number: orderNumber,
    order_id: order.id,
  })
}
