import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // This will refresh the session cookie if it's expired.
    const { data: { session } } = await supabase.auth.getSession()

    // Define protected routes that require authentication
    const protectedRoutes = ['/dashboard', '/admin', '/lecturer', '/student']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Define public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/attend']
    const isPublicRoute = publicRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If the user is not logged in and is trying to access a protected route,
    // redirect them to the home page with a redirect parameter.
    if (!session && isProtectedRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('redirect', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // If user is logged in and trying to access login page, redirect to dashboard
    if (session && request.nextUrl.pathname === '/') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

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
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
