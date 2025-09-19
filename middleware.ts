import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // This will refresh the session cookie if it's expired.
    const { data: { session }, error } = await supabase.auth.getSession()

    // If there's an error getting the session, let it pass through
    if (error) {
      console.log('Session error:', error.message)
      return response
    }

    // Define protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/admin', '/lecturer', '/student']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Only redirect if user is not logged in and trying to access a protected route
    if (!session && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Don't redirect logged-in users from home page to avoid loops
    // Let the client-side routing handle this

    return response
  } catch (e) {
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up your Supabase environment variables.
    // Check the `README.md` for more details.
    console.error('Middleware error:', e)
    return NextResponse.next({ request: { headers: request.headers } })
  }
}

export const config = {
  matcher: [
    /*
     * Temporarily disable middleware to fix sign-in loop
     * Re-enable by uncommenting the matcher below
     */
    // '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
