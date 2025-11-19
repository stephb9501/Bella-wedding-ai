import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

/**
 * Verify authentication for API routes
 * Returns the authenticated user or null if not authenticated
 */
export async function verifyAuth(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return { user: null, error: error?.message || 'Not authenticated' };
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: 'Authentication failed' };
  }
}

/**
 * Middleware wrapper for protected API routes
 * Returns 401 Unauthorized if user is not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<NextResponse | null> {
  const { user, error } = await verifyAuth(request);

  if (!user) {
    return NextResponse.json(
      { error: error || 'Unauthorized - Please log in' },
      { status: 401 }
    );
  }

  return null; // No error, user is authenticated
}

/**
 * Get the current authenticated user from request
 * Useful for routes that need user ID or user data
 */
export async function getCurrentUser(request: NextRequest) {
  const { user } = await verifyAuth(request);
  return user;
}
