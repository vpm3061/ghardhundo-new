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
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, expert_registered, is_partner')
          .eq('id', user.id)
          .single()

        if (user.email === 'tellitorg1@gmail.com') {
          return NextResponse.redirect(`${origin}/admin`)
        }
        if (profile?.expert_registered === true) {
          return NextResponse.redirect(`${origin}/expert`)
        }
        return NextResponse.redirect(`${origin}/`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
