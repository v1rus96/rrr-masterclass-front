import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { session }, error } = await supabase.auth.getSession()

    return NextResponse.json({
      authenticated: !!session,
      session: session,
      error: error,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      // Don't expose the full key
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to check auth status' }, { status: 500 })
  }
}
