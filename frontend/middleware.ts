import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth',
    '/vendor-register',
    '/contact',
    '/guest-response',
    '/api/guest-response',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For protected routes, check authentication
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return redirectToAuth(request);
    }

    // Get the auth token from cookies
    const token = request.cookies.get('sb-access-token')?.value ||
                  request.cookies.get('sb-cksukpgjkuarktbohseh-auth-token')?.value;

    if (!token) {
      return redirectToAuth(request);
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the token by getting the user
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return redirectToAuth(request);
    }

    // User is authenticated, allow the request
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return redirectToAuth(request);
  }
}

function redirectToAuth(request: NextRequest) {
  const authUrl = new URL('/auth', request.url);
  // Store the original URL to redirect back after login
  authUrl.searchParams.set('redirect', request.nextUrl.pathname);
  return NextResponse.redirect(authUrl);
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/timeline/:path*',
    '/checklist/:path*',
    '/guests/:path*',
    '/budget/:path*',
    '/vendors/:path*',
    '/ai/:path*',
    '/rsvp/:path*',
    '/website/:path*',
    '/photos/:path*',
    '/registry/:path*',
    '/seating/:path*',
    '/honeymoon/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/vendor-dashboard/:path*',
    '/bride-subscription/:path*',
    '/vendor-collaboration/:path*',
  ],
};