import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  try {
    const { supabase, response } = createClient(request)

    // This will refresh the session cookie if it's expired.
    console.log('Middleware: Checking session...');
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      console.log('Middleware: No session found.');
      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        console.log('Middleware: Path is /dashboard, redirecting to /');
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    } else {
      console.log('Middleware: Session found for user:', session.user.email);
    }

    console.log('Middleware: Proceeding to requested path:', request.nextUrl.pathname);
    return response;
  } catch (e) {
    const error = e as Error;
    console.error('Middleware Error:', error.message);
    // If you are here, a Supabase client could not be created!
    // This is likely because you have not set up your Supabase environment variables.
    // Check the `README.md` for more details.
    return NextResponse.next({ request: { headers: request.headers } });
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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
