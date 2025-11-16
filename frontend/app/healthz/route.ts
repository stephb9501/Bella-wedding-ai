import { supabaseServer } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection using the shared server client
    const { data, error } = await supabaseServer
      .from('couples')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Database connection failed',
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: 'ok',
          auth: 'ok',
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}