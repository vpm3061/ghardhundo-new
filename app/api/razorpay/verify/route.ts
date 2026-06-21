import { NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createClient } from '@/lib/supabase/server'

const PLAN_CONFIG: Record<string, { amount: number; leadsLimit: number }> = {
  Starter: { amount: 2999, leadsLimit: 5   },
  Pro:     { amount: 5999, leadsLimit: 25  },
  Power:   { amount: 9999, leadsLimit: 999 },
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = await req.json()

  const expected = createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex')

  if (expected !== razorpay_signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const config = PLAN_CONFIG[plan]
  if (!config) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const now      = new Date()
  const expiry   = new Date(now)
  expiry.setMonth(expiry.getMonth() + 1)

  /* Cancel any existing active sub first (plan change) */
  await supabase
    .from('dealer_subscriptions')
    .update({ status: 'Cancelled' })
    .eq('dealer_id', user.id)
    .eq('status', 'Active')

  const { error } = await supabase.from('dealer_subscriptions').insert({
    dealer_id:    user.id,
    plan,
    amount:       config.amount,
    leads_limit:  config.leadsLimit,
    started_at:   now.toISOString(),
    expires_at:   expiry.toISOString(),
    status:       'Active',
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
