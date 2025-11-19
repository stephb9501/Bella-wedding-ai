// API Security Utilities
// Shared security functions for API routes

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeHtml, sanitizeText, sanitizeSqlInput, validators } from './security';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * Verify user authentication from request
 */
export async function verifyAuth(request: NextRequest) {
  const supabase = getSupabaseClient();
  try {
    // Get token from headers or cookies
    const authHeader = request.headers.get('authorization');
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get from cookies
      token = request.cookies.get('sb-access-token')?.value ||
              request.cookies.get('sb-cksukpgjkuarktbohseh-auth-token')?.value;
    }

    if (!token) {
      return { authenticated: false, user: null, error: 'No token provided' };
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { authenticated: false, user: null, error: 'Invalid token' };
    }

    // Get user details from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return { authenticated: false, user: null, error: 'User not found' };
    }

    return { authenticated: true, user: userData, error: null };
  } catch (error) {
    console.error('Auth verification error:', error);
    return { authenticated: false, user: null, error: 'Authentication failed' };
  }
}

/**
 * Verify admin role
 */
export async function verifyAdmin(request: NextRequest) {
  const authResult = await verifyAuth(request);

  if (!authResult.authenticated || !authResult.user) {
    return { authorized: false, user: null, error: 'Not authenticated' };
  }

  if (authResult.user.role !== 'admin') {
    return { authorized: false, user: authResult.user, error: 'Not authorized' };
  }

  return { authorized: true, user: authResult.user, error: null };
}

/**
 * Sanitize request body
 */
export function sanitizeRequestBody(body: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(body)) {
    if (typeof value === 'string') {
      // Check if the value looks like HTML
      if (/<[a-z][\s\S]*>/i.test(value)) {
        sanitized[key] = sanitizeHtml(value);
      } else {
        // For regular text, sanitize SQL patterns
        sanitized[key] = sanitizeSqlInput(value);
      }
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeSqlInput(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestBody(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Validate email in request
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }

  if (!validators.email(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
  body: Record<string, any>,
  requiredFields: string[]
): { valid: boolean; error?: string; missing?: string[] } {
  const missing = requiredFields.filter((field) => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });

  if (missing.length > 0) {
    return {
      valid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
      missing,
    };
  }

  return { valid: true };
}

/**
 * Log audit event
 */
export async function logAudit(
  userId: number | null,
  action: string,
  resourceType: string,
  resourceId?: number,
  oldValue?: any,
  newValue?: any,
  request?: NextRequest
) {
  try {
    const supabase = getSupabaseClient();
    const ipAddress = request
      ? request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        'unknown'
      : 'unknown';

    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      old_value: oldValue ? JSON.stringify(oldValue) : null,
      new_value: newValue ? JSON.stringify(newValue) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
    });
  } catch (error) {
    console.error('Failed to log audit event:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  request: NextRequest,
  userId?: number,
  metadata?: Record<string, any>
) {
  try {
    const supabase = getSupabaseClient();
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    await supabase.from('security_events').insert({
      event_type: eventType,
      severity,
      description,
      ip_address: ipAddress,
      user_id: userId || null,
      metadata: metadata || null,
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Check ownership of resource
 */
export async function verifyOwnership(
  userId: number,
  table: string,
  resourceId: number
): Promise<{ isOwner: boolean; error?: string }> {
  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from(table)
      .select('user_id')
      .eq('id', resourceId)
      .single();

    if (error || !data) {
      return { isOwner: false, error: 'Resource not found' };
    }

    return { isOwner: data.user_id === userId };
  } catch (error) {
    console.error('Ownership verification error:', error);
    return { isOwner: false, error: 'Verification failed' };
  }
}

/**
 * Validate pagination parameters
 */
export function validatePagination(
  page?: string | null,
  limit?: string | null
): { page: number; limit: number; error?: string } {
  const parsedPage = page ? parseInt(page, 10) : 1;
  const parsedLimit = limit ? parseInt(limit, 10) : 10;

  if (isNaN(parsedPage) || parsedPage < 1) {
    return { page: 1, limit: 10, error: 'Invalid page number' };
  }

  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
    return { page: parsedPage, limit: 10, error: 'Invalid limit (must be 1-100)' };
  }

  return { page: parsedPage, limit: parsedLimit };
}

/**
 * Rate limit check for specific user action
 */
export async function checkUserRateLimit(
  userId: number,
  action: string,
  maxRequests: number,
  windowMinutes: number
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const supabase = getSupabaseClient();
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    // Count recent actions
    const { count, error } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('action', action)
      .gte('created_at', windowStart.toISOString());

    if (error) {
      console.error('Rate limit check error:', error);
      return { allowed: true, remaining: maxRequests }; // Fail open
    }

    const requestCount = count || 0;
    const allowed = requestCount < maxRequests;
    const remaining = Math.max(0, maxRequests - requestCount);

    return { allowed, remaining };
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: maxRequests }; // Fail open
  }
}

/**
 * Create standardized error response
 */
export function createErrorResponse(
  message: string,
  status: number = 400,
  details?: Record<string, any>
) {
  return {
    error: message,
    status,
    timestamp: new Date().toISOString(),
    ...details,
  };
}

/**
 * Create standardized success response
 */
export function createSuccessResponse(
  data: any,
  message?: string,
  meta?: Record<string, any>
) {
  return {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString(),
    ...meta,
  };
}
