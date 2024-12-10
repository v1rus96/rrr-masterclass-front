import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareSupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareSupabaseClient({ req, res });

  // Retrieve the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If no active session, redirect to the login page
  if (!session) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

// Configure the matcher to protect specific routes
export const config = {
  matcher: [
    '/((?!login|api|_next/static|_next/image|favicon.ico).*)',
  ],
};
