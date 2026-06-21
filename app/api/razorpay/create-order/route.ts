import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

const PLAN_AMOUNTS: Record<string, number> = {
  Starter: 299900,
  Pro:     599900,
  Power:   999900,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 503 })
  }

  const { plan } = await req.json()
  const amount = PLAN_AMOUNTS[plan]
  if (!amount) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  const rzp = new Razorpay({ key_id: keyId, key_secret: keySecret })
  const order = await rzp.orders.create({
    amount,
    currency: 'INR',
    notes: { plan, userId: user.id },
  })

  return NextResponse.json({
    orderId: order.id,
    amount: order.amount,
    currency: 'INR',
    keyId,
  })
}
