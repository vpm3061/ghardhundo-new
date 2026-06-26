import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        if (user.email === 'tellitorg1@gmail.com') {
          return NextResponse.redirect(`${origin}/admin`)
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'dealer') return NextResponse.redirect(`${origin}/dealer`)
        if (profile?.role === 'builder') return NextResponse.redirect(`${origin}/builder`)
        if (profile?.role === 'owner') return NextResponse.redirect(`${origin}/owner`)

        return NextResponse.redirect(`${origin}/`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
