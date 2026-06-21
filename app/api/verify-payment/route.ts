import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

const DEALER_PLANS: Record<string, { amount: number; leadsLimit: number }> = {
  Starter: { amount: 2999, leadsLimit: 5   },
  Pro:     { amount: 5999, leadsLimit: 25  },
  Power:   { amount: 9999, leadsLimit: 999 },
}

const BUILDER_PLANS: Record<string, { amount: number; listingLimit: number }> = {
  Standard: { amount: 4999, listingLimit: 10  },
  Premium:  { amount: 9999, listingLimit: 999 },
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return NextResponse.json({ error: 'Not configured' }, { status: 503 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, role } = await req.json()

  /* Verify signature */
  const expected = createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')
  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  /* Activate role */
  await supabase.from('profiles').update({ role }).eq('id', user.id)

  const now    = new Date()
  const expiry = new Date(now)
  expiry.setMonth(expiry.getMonth() + 1)

  if (role === 'dealer') {
    const config = DEALER_PLANS[plan]
    if (!config) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })

    await supabase.from('dealer_subscriptions').update({ status: 'Cancelled' })
      .eq('dealer_id', user.id).eq('status', 'Active')

    await supabase.from('dealer_subscriptions').insert({
      dealer_id:   user.id,
      plan,
      amount:      config.amount,
      leads_limit: config.leadsLimit,
      leads_used:  0,
      started_at:  now.toISOString(),
      expires_at:  expiry.toISOString(),
      status:      'Active',
    })
  } else if (role === 'builder') {
    const config = BUILDER_PLANS[plan]
    if (!config) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })

    await supabase.from('builder_packages').update({ status: 'Cancelled' })
      .eq('builder_id', user.id).eq('status', 'Active')

    await supabase.from('builder_packages').insert({
      builder_id:     user.id,
      plan,
      amount:         config.amount,
      listing_limit:  config.listingLimit,
      started_at:     now.toISOString(),
      expires_at:     expiry.toISOString(),
      status:         'Active',
    })
  }

  /* Update payment record — non-critical, ignore errors */
  try {
    await supabase.from('payment_orders').update({
      razorpay_payment_id, status: 'paid',
    }).eq('razorpay_order_id', razorpay_order_id)
  } catch { /* table may not exist yet */ }

  return NextResponse.json({ success: true })
}
