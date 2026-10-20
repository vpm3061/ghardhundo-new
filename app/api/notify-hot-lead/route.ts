import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Lead notifications are now created automatically.' }, { status: 410 })
}
