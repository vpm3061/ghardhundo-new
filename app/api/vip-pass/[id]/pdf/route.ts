import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateVipPassPdf } from '@/lib/pdf/vipPassGenerator'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  const { data: pass, error } = await supabase.from('vip_passes')
    .select('pass_id,buyer_name,buyer_phone_masked,property_id,visit_timestamp')
    .eq('pass_id', id).single()
  if (error || !pass) return NextResponse.json({ error: 'Pass not found' }, { status: 404 })
  const { data: property } = await supabase.from('properties').select('title').eq('id', pass.property_id).maybeSingle()
  const pdf = generateVipPassPdf({
    id: pass.pass_id, name: pass.buyer_name, maskedPhone: pass.buyer_phone_masked,
    project: property?.title || 'Property visit', visitDate: pass.visit_timestamp.slice(0, 10),
  })
  const body = pdf.buffer.slice(pdf.byteOffset, pdf.byteOffset + pdf.byteLength) as ArrayBuffer
  return new Response(body, { headers: {
    'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${pass.pass_id}.pdf"`,
    'Cache-Control': 'private, no-store',
  } })
}
