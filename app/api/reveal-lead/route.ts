import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { leadId } = await request.json()
  if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

  // Check coin balance
  const { data: coins } = await supabase.from('coins').select('amount, type').eq('user_id', user.id)
  const balance = (coins || []).reduce(
    (sum, c) => sum + (c.type === 'earned' ? c.amount : -c.amount), 0
  )
  if (balance < 10) return NextResponse.json({ error: 'Insufficient coins. Need 10 coins to reveal.' }, { status: 402 })

  // Check if already revealed
  const { data: existing } = await supabase
    .from('lead_reveals')
    .select('id')
    .eq('dealer_id', user.id)
    .eq('lead_id', leadId)
    .single()

  if (existing) {
    // Already revealed — just return the phone
    const { data: lead } = await supabase.from('leads').select('phone').eq('id', leadId).single()
    return NextResponse.json({ phone: lead?.phone })
  }

  // Deduct 10 coins
  const { error: coinErr } = await supabase.from('coins').insert({
    user_id: user.id,
    amount: 10,
    type: 'spent',
    description: `Revealed lead contact: ${leadId.slice(0, 8)}`,
  })
  if (coinErr) return NextResponse.json({ error: 'Failed to deduct coins' }, { status: 500 })

  // Record reveal
  await supabase.from('lead_reveals').insert({ dealer_id: user.id, lead_id: leadId })

  // Return phone
  const { data: lead } = await supabase.from('leads').select('phone').eq('id', leadId).single()
  return NextResponse.json({ phone: lead?.phone })
}
