import { NextResponse } from 'next/server'

const NOTIFY_PHONE = (process.env.WHATSAPP_NOTIFY_NUMBER ?? '919643693090').replace(/\D/g, '')
const WATI_URL   = process.env.WATI_API_URL
const WATI_TOKEN = process.env.WATI_API_TOKEN

function buildMessage(name: string, phone: string, email: string, city: string): string {
  const IST = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  return [
    '🎉 New Expert Registered on Orenzaa!',
    '',
    `👤 Name: ${name}`,
    `📱 Phone: ${phone}`,
    `📧 Email: ${email}`,
    `📍 City: ${city}`,
    `⏰ Time: ${IST}`,
    '',
    'Check admin: orenzaa.com/admin/experts',
  ].join('\n')
}

export async function POST(req: Request) {
  try {
    const { name, phone, email, city } = await req.json() as {
      name?: string; phone?: string; email?: string; city?: string
    }
    if (!name || !phone) return NextResponse.json({ error: 'name and phone required' }, { status: 400 })

    const message = buildMessage(name, phone, email ?? '', city ?? '')

    if (!WATI_URL || !WATI_TOKEN) {
      console.warn('[notify-expert-registration] WATI env vars not set. Message preview:\n' + message)
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
      console.error('[notify-expert-registration] WATI error', watiRes.status, body)
      return NextResponse.json({ sent: false, watiStatus: watiRes.status }, { status: 502 })
    }

    return NextResponse.json({ sent: true })
  } catch (err) {
    console.error('[notify-expert-registration]', err)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
