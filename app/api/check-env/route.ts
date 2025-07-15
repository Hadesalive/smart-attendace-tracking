import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures the route is not cached

export function GET() {
  const keyExists = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  return NextResponse.json({
    message: 'Checking for SUPABASE_SERVICE_ROLE_KEY...',
    keyExists: keyExists,
  });
}
