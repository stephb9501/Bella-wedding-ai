import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import crypto from 'crypto';

// Get acknowledgments for a booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const acknowledgmentType = searchParams.get('acknowledgment_type');

    if (!bookingId) {
      return NextResponse.json({ error: 'Missing booking_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('client_acknowledgments')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: false });

    if (acknowledgmentType) {
      query = query.eq('acknowledgment_type', acknowledgmentType);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      acknowledgments: data || [],
      total: data?.length || 0
    });
  } catch (error) {
    console.error('Get acknowledgments error:', error);
    return NextResponse.json({ error: 'Failed to fetch acknowledgments' }, { status: 500 });
  }
}

// Create tamper-proof acknowledgment
export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      acknowledgment_type,
      acknowledged_content,
      method,
      evidence_file_url,
      client_ip,
      client_user_agent
    } = await request.json();

    if (!booking_id || !acknowledgment_type || !acknowledged_content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get IP and user agent from request if not provided
    const ipAddress = client_ip || request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = client_user_agent || request.headers.get('user-agent') || 'unknown';

    // Create SHA256 hash of content for tamper detection
    const contentHash = crypto
      .createHash('sha256')
      .update(JSON.stringify(acknowledged_content))
      .digest('hex');

    const { data, error } = await supabaseServer
      .from('client_acknowledgments')
      .insert({
        booking_id,
        acknowledgment_type,
        acknowledged_content: JSON.stringify(acknowledged_content),
        acknowledged_content_hash: contentHash,
        ip_address: ipAddress,
        user_agent: userAgent,
        method: method || 'checkbox',
        evidence_file_url: evidence_file_url || null,
        cannot_be_disputed: true
      })
      .select()
      .single();

    if (error) throw error;

    // Log to audit trail
    await supabaseServer
      .from('wedding_audit_trail')
      .insert({
        booking_id,
        action_type: 'client_acknowledged',
        user_id: 'client',
        description: `Client acknowledged: ${acknowledgment_type}`,
        involves_client: true,
        client_acknowledged: true,
        after_data: {
          acknowledgment_id: data.id,
          content_hash: contentHash
        },
        ip_address: ipAddress,
        user_agent: userAgent
      });

    return NextResponse.json({
      success: true,
      message: 'Acknowledgment recorded with tamper-proof hash',
      acknowledgment: {
        id: data.id,
        type: data.acknowledgment_type,
        hash: data.acknowledged_content_hash,
        timestamp: data.created_at,
        ip: data.ip_address,
        cannot_be_disputed: true
      }
    });
  } catch (error) {
    console.error('Create acknowledgment error:', error);
    return NextResponse.json({ error: 'Failed to create acknowledgment' }, { status: 500 });
  }
}

// Verify acknowledgment hasn't been tampered with
export async function PUT(request: NextRequest) {
  try {
    const { acknowledgment_id } = await request.json();

    if (!acknowledgment_id) {
      return NextResponse.json({ error: 'Missing acknowledgment_id' }, { status: 400 });
    }

    const { data: acknowledgment } = await supabaseServer
      .from('client_acknowledgments')
      .select('*')
      .eq('id', acknowledgment_id)
      .single();

    if (!acknowledgment) {
      return NextResponse.json({ error: 'Acknowledgment not found' }, { status: 404 });
    }

    // Recalculate hash
    const currentHash = crypto
      .createHash('sha256')
      .update(acknowledgment.acknowledged_content)
      .digest('hex');

    const isValid = currentHash === acknowledgment.acknowledged_content_hash;

    return NextResponse.json({
      success: true,
      is_valid: isValid,
      message: isValid
        ? 'Acknowledgment is valid and has not been tampered with'
        : 'WARNING: Acknowledgment may have been tampered with!',
      details: {
        original_hash: acknowledgment.acknowledged_content_hash,
        current_hash: currentHash,
        timestamp: acknowledgment.created_at,
        ip_address: acknowledgment.ip_address,
        method: acknowledgment.method,
        cannot_be_disputed: acknowledgment.cannot_be_disputed
      }
    });
  } catch (error) {
    console.error('Verify acknowledgment error:', error);
    return NextResponse.json({ error: 'Failed to verify acknowledgment' }, { status: 500 });
  }
}
