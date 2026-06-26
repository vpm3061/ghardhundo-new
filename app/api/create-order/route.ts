import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
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

    try {
      await supabase.from('payment_orders').insert({
        user_id: user.id,
        razorpay_order_id: order.id,
        plan_type: plan,
        plan_role: role,
        amount,
        status: 'created'
      })
    } catch { /* table may not exist yet */ }

    return NextResponse.json({
      orderId: order.id,
      amount,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      name: user.email
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json({ error: error.message || 'Order failed' }, { status: 500 })
  }
}
