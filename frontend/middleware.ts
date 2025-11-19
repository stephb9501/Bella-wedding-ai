import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { RateLimiter, validateContentType } from './lib/security';

// Initialize rate limiters for different endpoints
const apiRateLimiter = new RateLimiter(60000, 60); // 60 requests per minute for API
const authRateLimiter = new RateLimiter(300000, 5); // 5 requests per 5 minutes for auth
const generalRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute general

// Suspicious patterns to block
const SUSPICIOUS_PATTERNS = [
  /\.\.\//g, // Path traversal
  /<script/gi, // XSS attempts
  /javascript:/gi, // XSS attempts
  /on\w+=/gi, // Event handler injection
  /eval\(/gi, // Code execution attempts
  /union.*select/gi, // SQL injection
  /exec\(/gi, // Command injection
];

// Known malicious user agents
const BLOCKED_USER_AGENTS = [
  /headless/i,
  /phantomjs/i,
  /selenium/i,
  /webdriver/i,
  /scraper/i,
  /curl/i,
  /wget/i,
  /python-requests/i,
  /go-http-client/i,
];

// Allowed user agents for API access (exceptions to bot blocking)
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /slackbot/i,
  /twitterbot/i,
  /facebookexternalhit/i,
];

/**
 * Check if request contains suspicious patterns
 */
function isSuspiciousRequest(request: NextRequest): boolean {
  const url = request.url;
  const userAgent = request.headers.get('user-agent') || '';

  // Check URL for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(url)) {
      return true;
    }
  }

  // Check user agent
  const isBlockedBot = BLOCKED_USER_AGENTS.some((pattern) => pattern.test(userAgent));
  const isAllowedBot = ALLOWED_BOTS.some((pattern) => pattern.test(userAgent));

  // Block if it's a bot and not in allowed list
  if (isBlockedBot && !isAllowedBot) {
    return true;
  }

  return false;
}

/**
 * Get client IP address
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIp) {
    return realIp.trim();
  }

  return 'unknown';
}

/**
 * Apply rate limiting
 */
function applyRateLimit(
  request: NextRequest,
  ip: string
): { allowed: boolean; response?: NextResponse; remaining?: number } {
  const pathname = request.nextUrl.pathname;

  // Choose appropriate rate limiter
  let limiter = generalRateLimiter;
  if (pathname.startsWith('/api/auth/')) {
    limiter = authRateLimiter;
  } else if (pathname.startsWith('/api/')) {
    limiter = apiRateLimiter;
  }

  const { allowed, remaining, resetTime } = limiter.check(ip);

  if (!allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
      },
      { status: 429 }
    );

    response.headers.set('X-RateLimit-Limit', limiter['maxRequests'].toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', resetTime.toString());
    response.headers.set('Retry-After', Math.ceil((resetTime - Date.now()) / 1000).toString());

    return { allowed: false, response };
  }

  return { allowed: true, remaining };
}

/**
 * Add security headers
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  );

  // Prevent clickjacking
  response.headers.set('X-Frame-Options', 'DENY');

  // Prevent MIME sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Strict Transport Security (HTTPS only)
  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return response;
}

/**
 * Validate CSRF token for state-changing requests
 */
function validateCsrfToken(request: NextRequest): boolean {
  const method = request.method;

  // Only check CSRF for state-changing methods
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  // Skip CSRF check for auth endpoints (they use other mechanisms)
  if (request.nextUrl.pathname.startsWith('/api/auth/')) {
    return true;
  }

  // Skip CSRF for guest-response (public endpoint)
  if (request.nextUrl.pathname.startsWith('/api/guest-response')) {
    return true;
  }

  const csrfToken = request.headers.get('x-csrf-token');
  const csrfCookie = request.cookies.get('csrf-token')?.value;

  // If no CSRF token is set yet, allow (it will be set on first GET request)
  if (!csrfCookie) {
    return true;
  }

  // Validate CSRF token matches
  return csrfToken === csrfCookie;
}

/**
 * Log security event
 */
async function logSecurityEvent(
  type: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  description: string,
  ip: string,
  metadata?: Record<string, any>
) {
  try {
    // In production, send to logging service or database
    if (process.env.NODE_ENV === 'production') {
      const event = {
        event_type: type,
        severity,
        description,
        ip_address: ip,
        metadata,
        timestamp: new Date().toISOString(),
      };

      // Log to console (will be captured by logging service)
      console.warn('[SECURITY EVENT]', event);
    }
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Generate CSRF token
 */
function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function middleware(request: NextRequest) {
  const ip = getClientIp(request);
  const pathname = request.nextUrl.pathname;

  // 1. Block suspicious requests
  if (isSuspiciousRequest(request)) {
    await logSecurityEvent(
      'suspicious_request',
      'high',
      'Blocked suspicious request',
      ip,
      {
        url: request.url,
        userAgent: request.headers.get('user-agent'),
      }
    );

    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  // 2. Apply rate limiting
  const rateLimitResult = applyRateLimit(request, ip);
  if (!rateLimitResult.allowed) {
    await logSecurityEvent(
      'rate_limit_exceeded',
      'medium',
      'Rate limit exceeded',
      ip,
      { endpoint: pathname }
    );

    return rateLimitResult.response!;
  }

  // 3. Validate CSRF token
  if (!validateCsrfToken(request)) {
    await logSecurityEvent(
      'csrf_validation_failed',
      'high',
      'CSRF token validation failed',
      ip,
      { endpoint: pathname }
    );

    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  // 4. Validate Content-Type for API requests with body
  if (
    request.method !== 'GET' &&
    request.method !== 'HEAD' &&
    pathname.startsWith('/api/')
  ) {
    const contentType = request.headers.get('content-type');
    if (contentType && !validateContentType(contentType, ['application/json', 'multipart/form-data'])) {
      return NextResponse.json(
        { error: 'Invalid Content-Type' },
        { status: 415 }
      );
    }
  }

  // 5. Authentication check for protected routes
  const publicRoutes = [
    '/',
    '/auth',
    '/vendor-register',
    '/contact',
    '/guest-response',
    '/api/guest-response',
    '/api/monitoring',
    '/privacy',
    '/terms',
    '/gdpr',
  ];

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  let response: NextResponse;

  if (!isPublicRoute) {
    // For protected routes, check authentication
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Missing Supabase environment variables');
        response = redirectToAuth(request);
      } else {
        // Get the auth token from cookies
        const token = request.cookies.get('sb-access-token')?.value ||
                      request.cookies.get('sb-cksukpgjkuarktbohseh-auth-token')?.value;

        if (!token) {
          response = redirectToAuth(request);
        } else {
          // Create Supabase client
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          // Verify the token by getting the user
          const { data: { user }, error } = await supabase.auth.getUser(token);

          if (error || !user) {
            response = redirectToAuth(request);
          } else {
            // User is authenticated, allow the request
            response = NextResponse.next();
          }
        }
      }
    } catch (error) {
      console.error('Auth middleware error:', error);
      response = redirectToAuth(request);
    }
  } else {
    // Public route, allow
    response = NextResponse.next();
  }

  // 6. Add security headers
  addSecurityHeaders(response);

  // 7. Set CSRF token cookie for GET requests if not already set
  if (request.method === 'GET' && !request.cookies.get('csrf-token')) {
    const csrfToken = generateCsrfToken();
    response.cookies.set('csrf-token', csrfToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // 8. Add rate limit headers
  if (rateLimitResult.remaining !== undefined) {
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  }

  return response;
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