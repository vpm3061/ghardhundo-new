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

const EXPERT_PLANS: Record<string, { amount: number; months: number }> = {
  'Pro-Monthly':  { amount: 599, months: 1 },
  'Pro-6Month':   { amount: 999, months: 6 },
  'expert-pro':   { amount: 499, months: 1 },
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
  const { error: roleError } = await supabase.from('profiles').update({ role }).eq('id', user.id)
  if (roleError) {
    console.error('[verify-payment] role update failed', roleError)
    return NextResponse.json({ error: 'Could not activate account: ' + roleError.message }, { status: 500 })
  }

  const now    = new Date()
  const expiry = new Date(now)
  expiry.setMonth(expiry.getMonth() + 1)

  if (role === 'expert' && plan === 'expert-registration') {
    const { error: regError } = await supabase.from('profiles').update({
      expert_registered: true,
      registration_paid_at: now.toISOString(),
    }).eq('id', user.id)
    if (regError) {
      console.error('[verify-payment] expert_registered update failed', regError)
      return NextResponse.json({ error: 'Could not complete registration: ' + regError.message }, { status: 500 })
    }
  } else if (role === 'expert') {
    const config = EXPERT_PLANS[plan]
    if (!config) return NextResponse.json({ error: 'Unknown plan' }, { status: 400 })

    const expertExpiry = new Date(now)
    expertExpiry.setMonth(expertExpiry.getMonth() + config.months)

    await supabase.from('expert_subscriptions').update({ status: 'Cancelled' })
      .eq('expert_id', user.id).eq('status', 'Active')

    await supabase.from('expert_subscriptions').insert({
      expert_id:  user.id,
      plan,
      amount:     config.amount,
      started_at: now.toISOString(),
      expires_at: expertExpiry.toISOString(),
      status:     'Active',
    })
  } else if (role === 'dealer') {
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
    console.log('[verify-payment] updating payment_orders:', razorpay_order_id)
    const { error: updateError } = await supabase
      .from('payment_orders')
      .update({ status: 'paid', razorpay_payment_id })
      .eq('razorpay_order_id', razorpay_order_id)
    console.log('[verify-payment] update result:', updateError?.message || 'success')
  } catch { /* table may not exist yet */ }

  return NextResponse.json({ success: true })
}
