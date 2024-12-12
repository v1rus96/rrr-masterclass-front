import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Create a Response object
  const res = NextResponse.next()

  // Create a Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value
        },
        set(name, value, options) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
          res.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Refresh the session
  const { data: { session } } = await supabase.auth.getSession()

  // If the request is for the login page and we have a session, redirect to home
  if (req.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Allow access to public routes
  if (
    req.nextUrl.pathname.startsWith('/telegram-lead') ||
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api/auth') ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    return res
  }

  // If we don't have a session, redirect to login
  if (!session) {
    const redirectUrl = new URL('/login', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  return res
}
