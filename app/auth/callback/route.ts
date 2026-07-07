import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectParam = requestUrl.searchParams.get('redirect') || '/'
  const origin = requestUrl.origin

  const safeRedirect = redirectParam.startsWith('/') && !redirectParam.startsWith('//')
    ? redirectParam
    : '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL || user.email === 'tellitorg1@gmail.com') {
          return NextResponse.redirect(`${origin}/admin`)
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'builder') return NextResponse.redirect(`${origin}/builder`)
        if (profile?.role === 'expert') return NextResponse.redirect(`${origin}/expert`)

        return NextResponse.redirect(`${origin}${safeRedirect}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
