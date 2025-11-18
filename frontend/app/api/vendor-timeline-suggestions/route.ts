import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { Resend } from 'resend';

// Create a suggestion to another vendor
export async function POST(request: NextRequest) {
  try {
    const {
      booking_id,
      suggesting_vendor_id,
      suggesting_vendor_name,
      suggesting_vendor_category,
      target_vendor_id,
      target_vendor_name,
      target_vendor_category,
      suggestion_type,
      original_timeline_id,
      proposed_time_slot,
      proposed_activity,
      proposed_duration_minutes,
      proposed_location,
      proposed_notes,
      reason
    } = await request.json();

    if (!booking_id || !suggesting_vendor_id || !target_vendor_id || !suggestion_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current values if modifying existing entry
    let currentValues: any = {};
    if (original_timeline_id) {
      const { data: timeline } = await supabaseServer
        .from('wedding_timeline')
        .select('time_slot, activity, duration_minutes, location, notes')
        .eq('id', original_timeline_id)
        .single();

      if (timeline) {
        currentValues = {
          current_time_slot: timeline.time_slot,
          current_activity: timeline.activity,
          current_duration_minutes: timeline.duration_minutes,
          current_location: timeline.location,
          current_notes: timeline.notes
        };
      }
    }

    // Create suggestion
    const { data, error } = await supabaseServer
      .from('timeline_suggestions')
      .insert({
        booking_id,
        original_timeline_id: original_timeline_id || null,
        suggesting_vendor_id,
        suggesting_vendor_name,
        suggesting_vendor_category,
        target_vendor_id,
        target_vendor_name,
        target_vendor_category,
        suggestion_type,
        proposed_time_slot,
        proposed_activity,
        proposed_duration_minutes,
        proposed_location,
        proposed_notes,
        ...currentValues,
        reason,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Send notification email to target vendor
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data: targetVendor } = await supabaseServer
          .from('vendors')
          .select('email, business_name')
          .eq('id', target_vendor_id)
          .single();

        if (targetVendor?.email) {
          const suggestionText = suggestion_type === 'new_entry'
            ? `New timeline entry: ${proposed_activity} at ${proposed_time_slot}`
            : `Change to ${currentValues.current_activity}: ${reason}`;

          await resend.emails.send({
            from: 'Bella Wedding <notifications@bellawedding.com>',
            to: targetVendor.email,
            subject: `${suggesting_vendor_name} has a suggestion for the timeline`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #8B4789;">Timeline Suggestion from ${suggesting_vendor_name}</h2>

                <p>Hi ${targetVendor.business_name},</p>

                <p><strong>${suggesting_vendor_name}</strong> (${suggesting_vendor_category}) has suggested:</p>

                <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Suggestion:</strong></p>
                  <p>${suggestionText}</p>
                  ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                </div>

                <p>You can:</p>
                <ul>
                  <li>✅ Accept the suggestion</li>
                  <li>🔄 Counter-propose an adjustment</li>
                  <li>❌ Decline with your reason</li>
                </ul>

                <p>
                  <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor-dashboard/clients/${booking_id}"
                     style="background: linear-gradient(to right, #8B4789, #D97757); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
                    Review Suggestion
                  </a>
                </p>
              </div>
            `,
          });
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      suggestion_id: data.id,
      message: `Suggestion sent to ${target_vendor_name}. They'll be notified.`
    });
  } catch (error) {
    console.error('Create suggestion error:', error);
    return NextResponse.json({ error: 'Failed to create suggestion' }, { status: 500 });
  }
}

// Respond to a suggestion (accept, counter-propose, reject)
export async function PUT(request: NextRequest) {
  try {
    const {
      suggestion_id,
      action,
      responding_vendor_id,
      counter_proposal,
      rejection_reason,
      resolution_notes
    } = await request.json();

    if (!suggestion_id || !action || !responding_vendor_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get original suggestion
    const { data: suggestion } = await supabaseServer
      .from('timeline_suggestions')
      .select('*')
      .eq('id', suggestion_id)
      .single();

    if (!suggestion) {
      return NextResponse.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    if (action === 'accept') {
      // Accept the suggestion
      const { error } = await supabaseServer
        .from('timeline_suggestions')
        .update({
          status: 'accepted',
          resolved_by_vendor_id: responding_vendor_id,
          resolved_at: new Date().toISOString(),
          resolution_notes
        })
        .eq('id', suggestion_id);

      if (error) throw error;

      // Trigger will auto-create/update timeline entry

      return NextResponse.json({
        success: true,
        message: 'Accepted! Timeline has been updated.'
      });
    }

    if (action === 'counter_propose') {
      if (!counter_proposal) {
        return NextResponse.json({ error: 'Counter proposal required' }, { status: 400 });
      }

      // Mark original as counter-proposed
      await supabaseServer
        .from('timeline_suggestions')
        .update({
          status: 'counter_proposed',
          resolved_by_vendor_id: responding_vendor_id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', suggestion_id);

      // Create counter-proposal (swap suggesting and target)
      const { data: counterData, error: counterError } = await supabaseServer
        .from('timeline_suggestions')
        .insert({
          booking_id: suggestion.booking_id,
          original_timeline_id: suggestion.original_timeline_id,
          suggesting_vendor_id: suggestion.target_vendor_id, // Swapped
          suggesting_vendor_name: suggestion.target_vendor_name,
          suggesting_vendor_category: suggestion.target_vendor_category,
          target_vendor_id: suggestion.suggesting_vendor_id, // Swapped
          target_vendor_name: suggestion.suggesting_vendor_name,
          target_vendor_category: suggestion.suggesting_vendor_category,
          suggestion_type: suggestion.suggestion_type,
          proposed_time_slot: counter_proposal.time_slot,
          proposed_activity: counter_proposal.activity,
          proposed_duration_minutes: counter_proposal.duration_minutes,
          proposed_location: counter_proposal.location,
          proposed_notes: counter_proposal.notes,
          current_time_slot: suggestion.proposed_time_slot,
          current_activity: suggestion.proposed_activity,
          current_duration_minutes: suggestion.proposed_duration_minutes,
          reason: counter_proposal.reason,
          counter_proposal_id: suggestion_id,
          status: 'pending'
        })
        .select()
        .single();

      if (counterError) throw counterError;

      // Add to conversation
      await supabaseServer
        .from('suggestion_conversation')
        .insert({
          suggestion_id,
          from_vendor_id: responding_vendor_id,
          message: counter_proposal.reason || 'Counter-proposal submitted',
          is_counter_proposal: true,
          proposed_changes: counter_proposal
        });

      return NextResponse.json({
        success: true,
        counter_proposal_id: counterData.id,
        message: 'Counter-proposal sent!'
      });
    }

    if (action === 'reject') {
      const { error } = await supabaseServer
        .from('timeline_suggestions')
        .update({
          status: 'rejected',
          resolved_by_vendor_id: responding_vendor_id,
          resolved_at: new Date().toISOString(),
          resolution_notes: rejection_reason
        })
        .eq('id', suggestion_id);

      if (error) throw error;

      // Add to conversation
      await supabaseServer
        .from('suggestion_conversation')
        .insert({
          suggestion_id,
          from_vendor_id: responding_vendor_id,
          message: rejection_reason || 'Suggestion declined'
        });

      return NextResponse.json({
        success: true,
        message: 'Suggestion declined.'
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Respond to suggestion error:', error);
    return NextResponse.json({ error: 'Failed to respond to suggestion' }, { status: 500 });
  }
}

// Get suggestions for a vendor or booking
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('booking_id');
    const vendorId = searchParams.get('vendor_id');
    const status = searchParams.get('status'); // pending, accepted, rejected, etc.

    if (!vendorId) {
      return NextResponse.json({ error: 'Missing vendor_id' }, { status: 400 });
    }

    let query = supabaseServer
      .from('timeline_suggestions')
      .select(`
        *,
        suggesting_vendor:suggesting_vendor_id (
          business_name,
          category
        ),
        target_vendor:target_vendor_id (
          business_name,
          category
        )
      `)
      .or(`suggesting_vendor_id.eq.${vendorId},target_vendor_id.eq.${vendorId}`);

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Get suggestions error:', error);
    return NextResponse.json({ error: 'Failed to fetch suggestions' }, { status: 500 });
  }
}
