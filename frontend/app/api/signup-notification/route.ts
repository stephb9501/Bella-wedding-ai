import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const gmail = google.gmail('v1');

export async function POST(req: NextRequest) {
  try {
    const { email, userId } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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
        // Don't fail signup if email notification fails
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

    // Send notification email to bellaweddingai@gmail.com
    const notificationMessage = {
      to: 'bellaweddingai@gmail.com',
      subject: '🎉 New Bride Signup - Bella Wedding AI',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #a64c74; border-bottom: 2px solid #b84b7a; padding-bottom: 10px;">
            🎉 New Bride Signup!
          </h2>

          <div style="background-color: #f9f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;"><strong>User ID:</strong> ${userId || 'N/A'}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="color: #666; font-size: 14px;">
            A new bride has signed up for Bella Wedding AI! 💕
          </p>

          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
            Automated notification from Bella Wedding AI
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

    // Send welcome email to the new bride
    const welcomeMessage = {
      to: email,
      subject: 'Welcome to Bella Wedding AI! 💕',
      html: `
        <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #faf8f5 0%, #fdf2f4 100%);">
          <div style="text-align: center; padding: 30px 20px;">
            <h1 style="color: #a64c74; font-size: 36px; margin: 0;">Welcome to Bella Wedding AI! 💕</h1>
            <p style="color: #666; font-size: 18px; margin-top: 10px;">We're so excited to help you plan your dream wedding!</p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #a64c74; font-size: 24px; margin-top: 0;">What's Next?</h2>

            <div style="margin: 20px 0;">
              <p style="margin: 15px 0;"><strong style="color: #a64c74;">✓ Complete Your Profile</strong><br/>
              <span style="color: #666;">Add your wedding details, budget, and preferences</span></p>

              <p style="margin: 15px 0;"><strong style="color: #a64c74;">✓ Choose Your Plan</strong><br/>
              <span style="color: #666;">Join as an Early Tester for FREE or choose a paid tier</span></p>

              <p style="margin: 15px 0;"><strong style="color: #a64c74;">✓ Start Planning</strong><br/>
              <span style="color: #666;">Use our AI assistant, budget tracker, guest list, and more!</span></p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bellaweddingai.com/dashboard" style="background: linear-gradient(135deg, #c9a882 0%, #e8637e 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Go to Your Dashboard
              </a>
            </div>

            <div style="background-color: #f9f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #a64c74; font-size: 18px; margin-top: 0;">💡 Early Tester Program</h3>
              <p style="color: #666; margin: 10px 0;">Get <strong>3 months FREE</strong> with all Premium features! Just commit to:</p>
              <ul style="color: #666; margin: 10px 0;">
                <li>Using the app 2x per week</li>
                <li>1 email survey per month (5-10 min)</li>
                <li>Written testimonial at the end</li>
              </ul>
              <p style="color: #666; margin: 10px 0; font-size: 14px;"><em>Only 30 spots available!</em></p>
            </div>

            <p style="color: #666; margin-top: 30px;">
              Need help? Just reply to this email - we're here for you! 💕
            </p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            © 2025 Bella Wedding AI • All Rights Reserved<br/>
            Your dream wedding, perfectly planned
          </p>
        </div>
      `,
    };

    const encodedWelcome = Buffer.from(
      `To: ${welcomeMessage.to}\nSubject: ${welcomeMessage.subject}\nContent-Type: text/html; charset=utf-8\n\n${welcomeMessage.html}`
    ).toString('base64');

    await gmail.users.messages.send({
      auth: jwtClient,
      userId: 'me',
      requestBody: {
        raw: encodedWelcome,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending signup notification:', error);
    // Don't fail signup if email notification fails
    return NextResponse.json({ success: true, warning: 'Notification failed' });
  }
}
