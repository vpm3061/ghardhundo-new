import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'tellitorg1@gmail.com'
const PUBLIC_PATHS = ['/login', '/auth/callback', '/api/', '/p/', '/pricing', '/find-buyers', '/share-earn', '/list']

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return supabaseResponse
  }

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && user.email !== ADMIN_EMAIL) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/dealer') && user.email !== ADMIN_EMAIL) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'dealer') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  if (pathname.startsWith('/builder') && user.email !== ADMIN_EMAIL) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'builder') {
      return NextResponse.redirect(new URL('/pricing', request.url))
    }
  }

  if (pathname.startsWith('/owner') && !pathname.startsWith('/owner/list') && user.email !== ADMIN_EMAIL) {
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single()
    if (!['owner', 'admin'].includes(profile?.role ?? '')) {
      return NextResponse.redirect(new URL('/owner/list', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon-|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
