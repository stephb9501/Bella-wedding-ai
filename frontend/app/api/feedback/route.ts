import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const gmail = google.gmail('v1');

export async function POST(req: NextRequest) {
  try {
    const { feedback, category, userEmail, userId } = await req.json();

    if (!feedback) {
      return NextResponse.json(
        { error: 'Feedback is required' },
        { status: 400 }
      );
    }

    // Use provided user info or default to anonymous
    const fromEmail = userEmail || 'Anonymous';
    const fromUserId = userId || 'Unknown';

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
        return NextResponse.json(
          { error: 'Feedback service not configured' },
          { status: 503 }
        );
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

    const categoryLabels: Record<string, string> = {
      improvement: '💡 Feature Improvement',
      bug: '🐛 Bug Report',
      feature: '✨ New Feature Request',
      general: '💬 General Feedback',
    };

    // Send feedback email to bellaweddingai@gmail.com
    const feedbackMessage = {
      to: 'bellaweddingai@gmail.com',
      subject: `${categoryLabels[category] || '📝 Feedback'} - Early Tester Feedback`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #a64c74; border-bottom: 2px solid #b84b7a; padding-bottom: 10px;">
            ${categoryLabels[category] || 'Feedback from Early Tester'}
          </h2>

          <div style="background-color: #f9f5f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${feedback}</p>
          </div>

          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="margin: 5px 0; color: #666;"><strong>Category:</strong> ${categoryLabels[category] || category}</p>
            <p style="margin: 5px 0; color: #666;"><strong>From:</strong> ${fromEmail}</p>
            <p style="margin: 5px 0; color: #666;"><strong>User ID:</strong> ${fromUserId}</p>
            <p style="margin: 5px 0; color: #666;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <p style="margin-top: 30px; color: #999; font-size: 12px;">
            Sent from Bella Wedding AI Early Tester Feedback System
          </p>
        </div>
      `,
    };

    const encodedFeedback = Buffer.from(
      `To: ${feedbackMessage.to}\nSubject: ${feedbackMessage.subject}\nContent-Type: text/html; charset=utf-8\n\n${feedbackMessage.html}`
    ).toString('base64');

    await gmail.users.messages.send({
      auth: jwtClient,
      userId: 'me',
      requestBody: {
        raw: encodedFeedback,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Feedback sent successfully! Thank you for helping us improve.'
    });
  } catch (error) {
    console.error('Error sending feedback:', error);
    return NextResponse.json(
      { error: 'Failed to send feedback. Please try again.' },
      { status: 500 }
    );
  }
}
