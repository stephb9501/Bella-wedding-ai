import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const cookieStore = cookies();
    const token =
      cookieStore.get('sb-access-token')?.value ||
      cookieStore.get('sb-cksukpgjkuarktbohseh-auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user data from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = userData.id;

    // Log the deletion request before deleting
    await supabase.from('user_privacy_requests').insert({
      user_id: userId,
      request_type: 'delete',
      status: 'processing',
      requested_at: new Date().toISOString(),
    });

    // Delete user data from all tables (in order to avoid foreign key constraints)
    const tables = [
      'rsvps',
      'notes',
      'photos',
      'budget',
      'checklist',
      'timeline',
      'vendors',
      'guests',
      'wedding_events',
      'user_sessions',
      'error_logs',
      'audit_logs',
    ];

    for (const table of tables) {
      try {
        await supabase.from(table).delete().eq('user_id', userId);
      } catch (error) {
        console.error(`Failed to delete from ${table}:`, error);
        // Continue with other tables even if one fails
      }
    }

    // Mark privacy request as completed
    await supabase
      .from('user_privacy_requests')
      .update({
        status: 'completed',
        processed_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('request_type', 'delete')
      .eq('status', 'processing');

    // Delete user from auth
    try {
      await supabase.auth.admin.deleteUser(user.id);
    } catch (error) {
      console.error('Failed to delete user from auth:', error);
    }

    // Delete user record
    await supabase.from('users').delete().eq('id', userId);

    // Clear cookies
    const response = NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );

    response.cookies.delete('sb-access-token');
    response.cookies.delete('sb-cksukpgjkuarktbohseh-auth-token');
    response.cookies.delete('csrf-token');

    return response;
  } catch (error) {
    console.error('GDPR delete error:', error);

    // Try to mark request as failed
    try {
      const cookieStore = cookies();
      const token =
        cookieStore.get('sb-access-token')?.value ||
        cookieStore.get('sb-cksukpgjkuarktbohseh-auth-token')?.value;

      if (token) {
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('id')
            .eq('email', user.email)
            .single();

          if (userData) {
            await supabase
              .from('user_privacy_requests')
              .update({ status: 'failed' })
              .eq('user_id', userData.id)
              .eq('request_type', 'delete')
              .eq('status', 'processing');
          }
        }
      }
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }

    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
