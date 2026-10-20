import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Buyer contact details are private. Contact Orenzaa for assistance.' }, { status: 410 })
}
