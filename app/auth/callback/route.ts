import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  console.log('Auth callback hit, code:', code ? 'present' : 'missing')
  console.log('Origin:', origin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('Exchange result:', error ? error.message : 'success')

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      console.log('User:', user?.email)
      if (!user) return NextResponse.redirect(`${origin}/login`)

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      console.log('Profile role:', profile?.role)

      if (user.email === 'tellitorg1@gmail.com') return NextResponse.redirect(`${origin}/admin`)
      if (profile?.role === 'dealer')  return NextResponse.redirect(`${origin}/dealer`)
      if (profile?.role === 'builder') return NextResponse.redirect(`${origin}/builder`)
      if (profile?.role === 'owner')   return NextResponse.redirect(`${origin}/owner`)
      return NextResponse.redirect(`${origin}/`)
    }
    console.log('Exchange error:', error)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
