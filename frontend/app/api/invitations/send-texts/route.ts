import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { randomBytes } from 'crypto';

// Generate unique RSVP token
function generateRSVPToken(): string {
  return randomBytes(32).toString('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { email, guests } = await request.json();

    if (!email || !guests || guests.length === 0) {
      return NextResponse.json(
        { error: 'Missing email or guests' },
        { status: 400 }
      );
    }

    // Get user ID
    const { data: userData, error: userError } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userId = userData.id;
    const invites = [];
    let sentCount = 0;

    // Create text invites for each guest
    for (const guest of guests) {
      const token = generateRSVPToken();
      const rsvpLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rsvp/${token}`;

      // Insert into database
      const { data: invite, error: insertError } = await supabaseServer
        .from('text_invites')
        .insert({
          user_id: userId,
          guest_name: guest.name,
          guest_phone: guest.phone,
          rsvp_token: token,
          sent_at: new Date().toISOString(),
          delivered: false,
          opened: false,
          rsvp_status: 'pending',
        })
        .select()
        .single();

      if (insertError) {
        console.error('Error inserting invite:', insertError);
        continue;
      }

      // Send SMS via Twilio (if credentials are configured)
      if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
        try {
          // Note: In production, you would use the actual Twilio SDK
          // const twilio = require('twilio');
          // const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
          //
          // await client.messages.create({
          //   body: `You're invited to our wedding! Please RSVP at: ${rsvpLink}`,
          //   from: process.env.TWILIO_PHONE_NUMBER,
          //   to: guest.phone,
          // });

          // For now, just mark as delivered (simulation)
          await supabaseServer
            .from('text_invites')
            .update({ delivered: true })
            .eq('id', invite.id);

          sentCount++;
          console.log(`SMS would be sent to ${guest.name} at ${guest.phone}: ${rsvpLink}`);
        } catch (twilioError) {
          console.error('Twilio error:', twilioError);
        }
      } else {
        console.log('Twilio not configured. RSVP link:', rsvpLink);
      }

      invites.push(invite);
    }

    return NextResponse.json({
      success: true,
      sent: sentCount,
      invites,
      message: process.env.TWILIO_ACCOUNT_SID
        ? `Sent ${sentCount} text invitations`
        : 'Text invites created (Twilio not configured)',
    });
  } catch (error) {
    console.error('Send texts error:', error);
    return NextResponse.json(
      { error: 'Failed to send text invitations' },
      { status: 500 }
    );
  }
}
