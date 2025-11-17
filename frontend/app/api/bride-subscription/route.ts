import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const gmail = google.gmail('v1');

export async function POST(req: NextRequest) {
  try {
    const { userId, tier, userEmail: providedEmail } = await req.json();

    if (!userId || !tier) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get user email - either from request or fetch from Supabase
    let userEmail = providedEmail;

    if (!userEmail) {
      // Only create Supabase client if we need to fetch user data
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://cksukpgjkuarktbohseh.supabase.co';
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

        if (userError || !userData?.user) {
          console.error('Error fetching user:', userError);
          userEmail = 'Unknown';
        } else {
          userEmail = userData.user.email || 'Unknown';
        }
      } else {
        userEmail = 'Unknown';
      }
    }

    // Update user's subscription tier in the database
    // TODO: Create a subscriptions table if it doesn't exist
    // For now, we'll just send the notification

    // Send notification email to bellaweddingai@gmail.com
    let credentials;
    if (process.env.GOOGLE_CLIENT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      credentials = {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };
    } else {
      const credentialsPath = path.join(process.cwd(), 'credentials', 'bella-wedding-ai-3b4cd3a0a900.json');
      if (!fs.existsSync(credentialsPath)) {
        console.error('Credentials file not found');
        // Continue without email notification
        return NextResponse.json({ success: true, warning: 'Email notification not sent' });
      }
      credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
    }

    const jwtClient = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/gmail.send'],
    });

    await jwtClient.authorize();

    const tierNames: Record<string, string> = {
      'early-tester': 'Early Tester (FREE)',
      'standard': 'Standard ($13.99/mo - Black Friday Special)',
      'premium': 'Premium ($20.99/mo - Black Friday Special)',
    };

    const notificationMessage = {
      to: 'bellaweddingai@gmail.com',
      subject: `💍 New Subscription - ${tierNames[tier] || tier}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #a64c74; border-bottom: 2px solid #b84b7a; padding-bottom: 10px;">
            💍 New Subscription!
          </h2>

          <div style="background-color: #f9f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-size: 18px; color: #a64c74;"><strong>${tierNames[tier] || tier}</strong></p>
            <p style="margin: 15px 0 0 0; font-size: 16px;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;"><strong>User ID:</strong> ${userId}</p>
            <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;"><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          </div>

          <div style="background-color: #fff3f3; border-left: 4px solid #b84b7a; padding: 15px; margin: 20px 0;">
            ${tier === 'early-tester'
              ? '<p style="margin: 0;">🎉 <strong>Early Tester</strong> - FREE for 3 months</p><p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">Remember: They need to use app 2x/week and complete monthly email surveys!</p>'
              : '<p style="margin: 0;">💳 <strong>Paid Subscription</strong> - Payment processing needed</p><p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">TODO: Set up Stripe payment integration</p>'
            }
          </div>

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

    // Send confirmation email to the bride
    const confirmationMessage = {
      to: userEmail,
      subject: tier === 'early-tester'
        ? '🎉 Welcome to Early Tester Program - Bella Wedding AI'
        : '💍 Subscription Confirmed - Bella Wedding AI',
      html: `
        <div style="font-family: 'Playfair Display', serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #faf8f5 0%, #fdf2f4 100%);">
          <div style="text-align: center; padding: 30px 20px;">
            <h1 style="color: #a64c74; font-size: 36px; margin: 0;">
              ${tier === 'early-tester' ? '🎉 Welcome, Early Tester!' : '💍 Subscription Confirmed!'}
            </h1>
            <p style="color: #666; font-size: 18px; margin-top: 10px;">
              ${tier === 'early-tester'
                ? 'You\'re all set! Enjoy 3 months FREE with all Premium features!'
                : 'Thank you for subscribing to Bella Wedding AI!'}
            </p>
          </div>

          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <h2 style="color: #a64c74; font-size: 24px; margin-top: 0;">Your Subscription Details</h2>

            <div style="background-color: #f9f5f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 20px; color: #a64c74;"><strong>${tierNames[tier] || tier}</strong></p>
              ${tier === 'early-tester'
                ? `<p style="margin: 15px 0 0 0; color: #666;">
                     <strong>Your Commitment:</strong><br/>
                     ✓ Use the app at least 2x per week<br/>
                     ✓ Complete 1 email survey per month (5-10 minutes)<br/>
                     ✓ Share a written testimonial at the end of 3 months
                   </p>`
                : `<p style="margin: 15px 0 0 0; color: #666;">
                     <strong>Billing:</strong> ${tierNames[tier]}<br/>
                     <strong>Started:</strong> ${new Date().toLocaleDateString()}
                   </p>`
              }
            </div>

            ${tier === 'early-tester'
              ? `<div style="background-color: #fff3f3; border-left: 4px solid #b84b7a; padding: 15px; margin: 20px 0;">
                   <p style="margin: 0; color: #666;"><strong>🗓️ Important Dates</strong></p>
                   <p style="margin: 10px 0 0 0; color: #666;">
                     Your free access expires in <strong>3 months</strong>. We'll send you a reminder before then!
                   </p>
                 </div>`
              : ''
            }

            <h3 style="color: #a64c74; font-size: 20px; margin: 30px 0 15px 0;">What You Get:</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>AI Wedding Assistant for personalized advice</li>
              <li>Guest List & RSVP Management with custom links</li>
              <li>Budget Tracker across 13 categories</li>
              <li>Photo Gallery for unlimited memories</li>
              <li>Registry Aggregator to combine all your registries</li>
              <li>Timeline & Checklist with 42 pre-loaded tasks</li>
              ${tier !== 'free' ? '<li>Upload up to 30 photos (Premium)</li>' : ''}
            </ul>

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://bellaweddingai.com/dashboard" style="background: linear-gradient(135deg, #c9a882 0%, #e8637e 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold; font-size: 16px;">
                Start Planning Your Wedding
              </a>
            </div>

            <p style="color: #666; margin-top: 30px; font-size: 14px;">
              Need help? Just reply to this email or visit our <a href="https://bellaweddingai.com/contact" style="color: #a64c74;">contact page</a>.
            </p>
          </div>

          <p style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            © 2025 Bella Wedding AI • All Rights Reserved<br/>
            Your dream wedding, perfectly planned
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
      message: 'Subscription processed successfully'
    });
  } catch (error) {
    console.error('Error processing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to process subscription' },
      { status: 500 }
    );
  }
}
