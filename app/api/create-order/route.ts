import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const PLAN_AMOUNTS: Record<string, number> = {
  /* Dealer */
  Starter: 299900,
  Pro:     599900,
  Power:   999900,
  /* Builder */
  Standard: 499900,
  Premium:  999900,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Payment gateway not configured' }, { status: 503 })
  }

  const { plan, role } = await req.json()
  const amount = PLAN_AMOUNTS[plan]
  if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })
  const order = await rzp.orders.create({
    amount,
    currency: 'INR',
    notes: { plan, role, userId: user.id },
  })

  /* Record intent — non-blocking, ignore errors */
  try {
    await supabase.from('payment_orders').insert({
      user_id: user.id, razorpay_order_id: order.id,
      plan, role, amount: amount / 100, status: 'created',
    })
  } catch { /* table may not exist yet */ }

  return NextResponse.json({ orderId: order.id, amount: order.amount, currency: 'INR', keyId })
}
