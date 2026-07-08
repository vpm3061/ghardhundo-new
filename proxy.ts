import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Admin only
  if (path.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (user.email !== 'tellitorg1@gmail.com') {
      if (path !== '/admin/properties/new') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
  }

  // Expert — login required
  if (path.startsWith('/expert')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Builder — login required
  if (path.startsWith('/builder')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Profile — login required
  if (path.startsWith('/profile')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // /list-property is NOT protected here — handles its own auth client-side

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/expert/:path*',
    '/builder/:path*',
    '/profile/:path*',
  ],
}
