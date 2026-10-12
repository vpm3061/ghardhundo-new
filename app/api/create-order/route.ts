import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PAYMENTS_ENABLED } from '@/lib/billing'

export async function POST(req: Request) {
  if (!PAYMENTS_ENABLED) {
    return NextResponse.json({ error: 'Payments are paused. Registration and listings are free for now.' }, { status: 403 })
  }
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Login required' }, { status: 401 })

    const { amount, plan, role } = await req.json()

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: 'INR',
      notes: { plan, role, userId: user.id }
    })

    const { error: insertError } = await supabase.from('payment_orders').insert({
      user_id: user.id,
      razorpay_order_id: order.id,
      plan_type: plan,
      plan_role: role,
      amount,
      currency: 'INR',
      status: 'created'
    })
    if (insertError) {
      console.error('[create-order] payment_orders insert failed:', insertError.message)
    } else {
      console.log('[create-order] payment_orders insert success:', order.id)
    }

    return NextResponse.json({
      orderId: order.id,
      amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: user.email
    })
  } catch (error: unknown) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Order failed' }, { status: 500 })
  }
}
