import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tellitorg1@gmail.com'
      if (user?.email === adminEmail) {
        return NextResponse.redirect(`${origin}/admin`)
      }
      // Role-based redirect
      const { data: profile } = await supabase
        .from('profiles').select('role').eq('id', user!.id).single()
      if (profile?.role === 'builder') return NextResponse.redirect(`${origin}/builder`)
      if (profile?.role === 'dealer')  return NextResponse.redirect(`${origin}/dealer`)
      if (profile?.role === 'owner')   return NextResponse.redirect(`${origin}/owner`)
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
