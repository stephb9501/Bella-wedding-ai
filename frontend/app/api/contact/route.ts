import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const gmail = google.gmail('v1');

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    // Send notification email to bellaweddingai@gmail.com
    const notificationMessage = {
      to: 'bellaweddingai@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #a64c74; border-bottom: 2px solid #b84b7a; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>

          <div style="margin-top: 20px;">
            <p><strong>From:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #b84b7a; margin-top: 10px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            Sent from Bella Wedding AI Contact Form
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

    // Optionally send confirmation email to the person who submitted the form
    const confirmationMessage = {
      to: email,
      subject: 'Thank you for contacting Bella Wedding AI! 💕',
      html: `
        <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #a64c74; text-align: center;">Thank you for reaching out! 💕</h1>

          <p>Hi ${name}!</p>

          <p>We've received your message and our team will get back to you as soon as possible—usually within 24 hours.</p>

          <div style="background-color: #f9f5f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #666;"><strong>Your message:</strong></p>
            <p style="margin-top: 10px; color: #333;">${message.replace(/\n/g, '<br>')}</p>
          </div>

          <p style="text-align: center; margin-top: 30px;">
            <a href="https://bellaweddingai.com" style="background-color: #b84b7a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit Bella Wedding AI</a>
          </p>

          <p style="margin-top: 30px; border-top: 1px solid #ddd; padding-top: 20px; color: #999; font-size: 12px;">
            © 2025 Bella Wedding AI • All Rights Reserved<br/>
            If you didn't send this message, please ignore this email.
          </p>
        </div>
      `,
    };

    const encodedConfirmation = Buffer.from(
      `To: ${confirmationMessage.to}\nSubject: ${confirmationMessage.subject}\nContent-Type: text/html; charset=utf-8\n\n${confirmationMessage.html}`
    ).toString('base64');

    await gmail.users.messages.send({
      auth: jwtClient,
      userId: 'me',
      requestBody: {
        raw: encodedConfirmation,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully! We\'ll be in touch soon.'
    });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return NextResponse.json(
      { error: 'Failed to send message. Please try again.' },
      { status: 500 }
    );
  }
}
