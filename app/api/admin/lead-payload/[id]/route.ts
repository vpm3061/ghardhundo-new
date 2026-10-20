import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isUUID } from '@/lib/is-uuid'

// Authenticated admin export. No provider request is made until a provider is connected.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'tellitorg1@gmail.com') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params
  if (!isUUID(id)) return NextResponse.json({ error: 'Invalid lead' }, { status: 400 })
  const { data, error } = await supabase.from('lead_notifications').select('id,event_type,payload')
    .eq('lead_id', id).single()
  if (error || !data) return NextResponse.json({ error: 'Payload not found' }, { status: 404 })
  return NextResponse.json({ event_id: data.id, event: data.event_type, ...data.payload }, {
    headers: { 'Cache-Control': 'private, no-store', 'Content-Disposition': `attachment; filename="orenzaa-${id}.json"` },
  })
}
