import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const gmail = google.gmail('v1');

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    // Load the service account credentials
    const credentialsPath = path.join(process.cwd(), 'credentials', 'bella-wedding-ai-3b4cd3a0a900.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));

    // Create JWT client for authentication
    const jwtClient = new google.auth.JWT({
  email: credentials.client_email,
  key: credentials.private_key,
  scopes: ['https://www.googleapis.com/auth/gmail.send'],
});

    // Authorize the client
    await jwtClient.authorize();

    // Create the email message
    const emailMessage = {
      to: email,
      subject: 'Welcome to Bella Wedding AI! 💕',
      html: `
        <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #a64c74; text-align: center;">Welcome to Bella Wedding AI! 💕</h1>
          
          <p>Hi there!</p>
          
          <p>Thank you for joining our launch list! We're so excited to have you.</p>
          
          <p>Bella Wedding AI is coming soon with everything you need to plan your perfect wedding—all in one beautiful, AI-powered platform.</p>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://bellaweddingai.com" style="background-color: #b84b7a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit Bella Wedding AI</a>
          </p>
          
          <p style="margin-top: 30px; color: #666;">
            In the meantime, follow us for updates and special launch offers!
          </p>
          
          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
            © 2025 Bella Wedding AI • All Rights Reserved<br/>
            You received this email because you joined our launch list.
          </p>
        </div>
      `,
    };

    // Encode the message
    const encodedMessage = Buffer.from(
      `To: ${emailMessage.to}\nSubject: ${emailMessage.subject}\nContent-Type: text/html; charset=utf-8\n\n${emailMessage.html}`
    ).toString('base64');

    // Send the email
    await gmail.users.messages.send(
      {
        auth: jwtClient,
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
        },
      }
    );

    // Also send you a notification
    const notificationMessage = {
      to: 'bellaweddingai@gmail.com',
      subject: `New Signup: ${email}`,
      html: `<p>New subscriber: <strong>${email}</strong></p>`,
    };

    const encodedNotification = Buffer.from(
      `To: ${notificationMessage.to}\nSubject: ${notificationMessage.subject}\nContent-Type: text/html; charset=utf-8\n\n${notificationMessage.html}`
    ).toString('base64');

    await gmail.users.messages.send(
      {
        auth: jwtClient,
        userId: 'me',
        requestBody: {
          raw: encodedNotification,
        },
      }
    );

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
