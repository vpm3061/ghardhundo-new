import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const NOTIFY_PHONE = (process.env.WHATSAPP_NOTIFY_NUMBER ?? '919643693090').replace(/\D/g, '')
const WATI_URL    = process.env.WATI_API_URL
const WATI_TOKEN  = process.env.WATI_API_TOKEN
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'https://orenzaacom.vercel.app'

function buildMessage(lead: {
  name: string; phone: string; ai_score: number
  city: string | null; budget: string | null; timeline: string | null
  loan_status: string | null; id: string
}, propertyTitle: string): string {
  const IST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  return [
    '🔥 HOT LEAD ALERT!',
    `Name: ${lead.name}`,
    `Phone: ${lead.phone}`,
    `Score: ${lead.ai_score}/100`,
    `City: ${lead.city ?? '—'}`,
    `Budget: ${lead.budget ?? '—'}`,
    `Timeline: ${lead.timeline ?? '—'}`,
    `Loan: ${lead.loan_status ?? '—'}`,
    `Property Interest: ${propertyTitle}`,
    `Time: ${IST}`,
    '',
    `Open Dashboard: ${SITE_URL}/admin/leads/${lead.id}`,
  ].join('\n')
}

export async function POST(req: Request) {
  try {
    const { leadId } = await req.json() as { leadId?: string }
    if (!leadId) return NextResponse.json({ error: 'leadId required' }, { status: 400 })

    const supabase = await createClient()
    const { data: lead } = await supabase
      .from('leads')
      .select('id, name, phone, ai_score, city, budget, timeline, loan_status, tier, properties(title)')
      .eq('id', leadId)
      .single()

    if (!lead) return NextResponse.json({ error: 'lead not found' }, { status: 404 })
    if (lead.tier !== 'HOT') return NextResponse.json({ skipped: true, tier: lead.tier })

    const propertyTitle =
      lead.properties && !Array.isArray(lead.properties)
        ? (lead.properties as { title: string }).title
        : 'General enquiry'

    const message = buildMessage(lead, propertyTitle)

    if (!WATI_URL || !WATI_TOKEN) {
      // Not configured — log and return so the lead flow isn't blocked
      console.warn('[notify-hot-lead] WATI env vars not set. Message preview:\n' + message)
      return NextResponse.json({ sent: false, reason: 'WATI not configured', preview: message })
    }

    const watiRes = await fetch(
      `${WATI_URL}/api/v1/sendSessionMessage/${NOTIFY_PHONE}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${WATI_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messageText: message }),
      }
    )

    if (!watiRes.ok) {
      const body = await watiRes.text()
      console.error('[notify-hot-lead] WATI error', watiRes.status, body)
      return NextResponse.json({ sent: false, watiStatus: watiRes.status }, { status: 502 })
    }

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[notify-hot-lead]', err)
    return NextResponse.json({ error: 'internal error' }, { status: 500 })
  }
}
