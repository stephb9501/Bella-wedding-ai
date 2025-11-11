import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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

  // For now, allow all routes (we'll implement auth later)
  return NextResponse.next();
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