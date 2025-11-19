import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeText, sanitizeSqlInput } from '@/lib/security';
import { validateRequiredFields, createErrorResponse, createSuccessResponse } from '@/lib/api-security';

function getSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface ErrorLogRequest {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  userId?: number;
  context?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body: ErrorLogRequest = await request.json();

    // Validate required fields
    const validation = validateRequiredFields(body, ['message', 'url']);
    if (!validation.valid) {
      return NextResponse.json(
        createErrorResponse(validation.error!, 400),
        { status: 400 }
      );
    }

    // Get IP address from request
    const ipAddress =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Sanitize and limit data size
    const errorMessage = sanitizeSqlInput(body.message.substring(0, 1000));
    const stackTrace = body.stack ? sanitizeSqlInput(body.stack.substring(0, 5000)) : null;
    const url = sanitizeSqlInput(body.url.substring(0, 500));
    const userAgent = body.userAgent ? sanitizeSqlInput(body.userAgent.substring(0, 500)) : 'unknown';

    // Sanitize context/metadata
    let metadata = null;
    if (body.context) {
      metadata = Object.entries(body.context).reduce((acc, [key, value]) => {
        if (typeof value === 'string') {
          acc[key] = sanitizeSqlInput(value);
        } else {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
    }

    // Insert error log into database
    const { error: dbError } = await supabase.from('error_logs').insert({
      user_id: body.userId || null,
      error_message: errorMessage,
      stack_trace: stackTrace,
      url: url,
      user_agent: userAgent,
      ip_address: ipAddress,
      metadata: metadata,
    });

    if (dbError) {
      console.error('Failed to log error to database:', dbError);
      return NextResponse.json(
        createErrorResponse('Failed to log error', 500),
        { status: 500 }
      );
    }

    // For critical errors, could trigger alerts here
    // e.g., send to Slack, PagerDuty, etc.
    const isCritical = errorMessage.toLowerCase().includes('critical') ||
                       errorMessage.toLowerCase().includes('fatal');

    if (isCritical) {
      // Log as security event
      await supabase.from('security_events').insert({
        event_type: 'critical_error',
        severity: 'high',
        description: `Critical error logged: ${errorMessage.substring(0, 200)}`,
        ip_address: ipAddress,
        user_id: body.userId || null,
        metadata: { url, userAgent },
      });
    }

    return NextResponse.json(
      createSuccessResponse({ logged: true }, 'Error logged successfully'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in monitoring endpoint:', error);
    return NextResponse.json(
      createErrorResponse('Internal server error', 500),
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { status: 'ok', service: 'error-monitoring' },
    { status: 200 }
  );
}
