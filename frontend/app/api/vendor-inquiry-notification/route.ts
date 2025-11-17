import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const gmail = google.gmail('v1');

export async function POST(req: NextRequest) {
  try {
    const {
      vendorEmail,
      vendorBusinessName,
      brideFirstName,
      weddingDate,
      venueLocation,
      messagePreview,
      category,
      bookingId
    } = await req.json();

    if (!vendorEmail || !brideFirstName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Try to load credentials from environment variables first, then fall back to file
    let credentials;
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    } else {
      // Fall back to credentials file
      const credentialsPath = path.join(process.cwd(), 'credentials', 'bella-wedding-ai-3b4cd3a0a900.json');
      if (!fs.existsSync(credentialsPath)) {
        console.error('Credentials file not found and environment variables not set');
        // Don't fail the booking if email notification fails
        return NextResponse.json({ success: true, warning: 'Notification not sent' });
      }
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    }

    // Create JWT client for authentication
    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    // Authorize the client
    await jwtClient.authorize();

    // Format message preview (first 100 chars)
    const preview = messagePreview
      ? (messagePreview.length > 100 ? messagePreview.substring(0, 100) + '...' : messagePreview)
      : 'No message provided';

    // Send notification email to vendor
    const notificationMessage = {
      to: vendorEmail,
      subject: `🎉 New Inquiry from ${brideFirstName} - Bella Wedding AI`,
      html: `
        <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #faf8f5 0%, #fdf2f4 100%);">
          <div style="text-align: center; padding: 30px 20px; background: linear-gradient(135deg, #c9a882 0%, #e8637e 100%); border-radius: 12px 12px 0 0;">
            <h1 style="color: white; font-size: 32px; margin: 0;">🎉 New Inquiry!</h1>
            <p style="color: white; font-size: 18px; margin-top: 10px;">A bride is interested in your services</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="background-color: #f9f5f7; padding: 20px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #a64c74;">
              <h2 style="color: #a64c74; font-size: 20px; margin: 0 0 15px 0;">Inquiry Details</h2>

              <p style="margin: 10px 0; color: #666;">
                <strong style="color: #333;">Bride:</strong> ${brideFirstName}
              </p>

              ${category ? `<p style="margin: 10px 0; color: #666;">
                <strong style="color: #333;">Category:</strong> ${category}
              </p>` : ''}

              ${weddingDate ? `<p style="margin: 10px 0; color: #666;">
                <strong style="color: #333;">Wedding Date:</strong> ${weddingDate}
              </p>` : ''}

              ${venueLocation ? `<p style="margin: 10px 0; color: #666;">
                <strong style="color: #333;">Location:</strong> ${venueLocation}
              </p>` : ''}

              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                <strong style="color: #333;">Message Preview:</strong>
                <p style="margin: 10px 0; color: #666; font-style: italic;">"${preview}"</p>
              </div>
            </div>

            <div style="background-color: #fff3f3; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                🔒 To protect both you and the bride, all communication happens through our secure platform
              </p>
              <p style="margin: 0; color: #999; font-size: 12px;">
                View full details and respond to unlock this opportunity
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bellaweddingai.com/vendor-dashboard?inquiry=${bookingId || 'latest'}"
                 style="background: linear-gradient(135deg, #c9a882 0%, #e8637e 100%); color: white; padding: 18px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 18px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                View Full Inquiry & Respond →
              </a>
            </div>

            <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                💡 <strong>Quick Tips:</strong>
              </p>
              <ul style="color: #666; font-size: 14px; margin: 10px 0; padding-left: 20px;">
                <li>Respond quickly to increase your booking chances</li>
                <li>Be professional and personalize your response</li>
                <li>All inquiries are tracked in your dashboard analytics</li>
              </ul>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; color: #999; font-size: 12px;">
                This is an automated notification from Bella Wedding AI<br/>
                Log in to your dashboard to manage all inquiries and bookings
              </p>
            </div>
          </div>

          <p style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
            © 2025 Bella Wedding AI • Connecting couples with their perfect vendors
          </p>
        </div>
      `,
    };

    const encodedNotification = Buffer.from(
      `To: ${notificationMessage.to}\nSubject: ${notificationMessage.subject}\nContent-Type: text/html; charset=utf-8\n\n${notificationMessage.html}`
    ).toString('base64');

    await gmail.users.messages.send({
      auth: jwtClient,
      userId: 'me',
      requestBody: {
        raw: encodedNotification,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending vendor inquiry notification:', error);
    // Don't fail the booking if email notification fails
    return NextResponse.json({ success: true, warning: 'Notification failed' });
  }
}
