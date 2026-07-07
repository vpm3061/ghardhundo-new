import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const origin = requestUrl.origin

  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : null

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Admin always goes to /admin
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.email === 'tellitorg1@gmail.com') {
          return NextResponse.redirect(`${origin}/admin`)
        }

        // If user came from a specific page, send them back there
        if (safeNext) {
          return NextResponse.redirect(`${origin}${safeNext}`)
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'builder') return NextResponse.redirect(`${origin}/builder`)
        if (profile?.role === 'expert') return NextResponse.redirect(`${origin}/expert`)

        return NextResponse.redirect(`${origin}/`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
