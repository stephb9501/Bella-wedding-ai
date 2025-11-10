import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes that require authentication
  const protectedRoutes = [
    '/dashboard',
    '/timeline',
    '/checklist',
    '/guests',
    '/budget',
    '/vendors',
    '/ai',
    '/rsvp',
    '/website',
    '/photos',
    '/registry',
    '/seating',
    '/honeymoon',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', request.url));
  }

  return res;
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
  ],
};