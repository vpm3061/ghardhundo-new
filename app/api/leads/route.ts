import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateLead } from '@/lib/trust'
import { calculateScore } from '@/lib/ai-scoring'
import type { AIAnswers } from '@/lib/supabase/types'

export async function POST(request: Request) {
  if (request.headers.get('origin') && request.headers.get('origin') !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid origin' }, { status: 403 })
  }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Please sign in to submit your request' }, { status: 401 })
  let input: ReturnType<typeof validateLead>
  try {
    const raw = await request.text()
    if (raw.length > 8192) throw new Error('Submission is too large')
    input = validateLead(JSON.parse(raw))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Invalid submission' }, { status: 400 })
  }
  const fields = 'id, name, vip_pass_id, project_name, visit_date, property_id'
  const { data: existing } = await supabase.from('leads').select(fields)
    .eq('user_id', user.id).eq('request_id', input.request_id).maybeSingle()
  const respond = async (lead: { id: string; name: string; vip_pass_id: string | null; project_name: string | null; visit_date: string | null; property_id: string | null }) => {
    const { data: passRecord } = lead.vip_pass_id
      ? await supabase.from('vip_passes').select('buyer_phone_masked,base_price_amount,stamp_duty_amount,legal_fees_amount,purpose,urgency_timeline').eq('pass_id', lead.vip_pass_id).maybeSingle()
      : { data: null }
    const base = passRecord?.base_price_amount == null ? null : Number(passRecord.base_price_amount)
    const stampDuty = passRecord?.stamp_duty_amount == null ? null : Number(passRecord.stamp_duty_amount)
    const legalFees = passRecord?.legal_fees_amount == null ? null : Number(passRecord.legal_fees_amount)
    return NextResponse.json({
      leadId: lead.id,
      pass: lead.vip_pass_id ? {
        id: lead.vip_pass_id, name: lead.name, project: lead.project_name, visitDate: lead.visit_date,
        maskedPhone: passRecord?.buyer_phone_masked ? `+91 XXXXX-${passRecord.buyer_phone_masked.slice(-4)}` : undefined,
        purpose: passRecord?.purpose ?? undefined,
        urgencyTimeline: passRecord?.urgency_timeline ?? undefined,
        costBreakdown: {
          base, stampDuty, legalFees,
          onRoad: base == null || stampDuty == null || legalFees == null ? null : base + stampDuty + legalFees,
        },
      } : null,
    }, { headers: { 'Cache-Control': 'no-store' } })
  }
  if (existing) return respond(existing)
  const score = calculateScore({
    budget: input.budget || '', city: input.city || '', timeline: input.timeline || '',
    loan_status: input.loan_status || '', purpose: input.purpose || '',
  } as AIAnswers)
  const { data, error } = await supabase.from('leads').insert({
    ...input, user_id: user.id, source_tag: 'Orenzaa-001', status: 'New',
    disclaimer_accepted_at: new Date().toISOString(),
    ai_score: score.score, tier: score.tier,
  }).select(fields).single()
  if (error) {
    if (error.code === '23505') {
      const { data: duplicate } = await supabase.from('leads').select(fields)
        .eq('user_id', user.id).eq('request_id', input.request_id).maybeSingle()
      if (duplicate) return respond(duplicate)
    }
    const limited = error.message.includes('Too many requests')
    return NextResponse.json({ error: limited ? 'Too many requests. Please try again in an hour.' : 'Could not save your request. Please try again.' }, { status: limited ? 429 : 500 })
  }
  return respond(data)
}
