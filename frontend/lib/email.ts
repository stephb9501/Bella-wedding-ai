// Email service for sending transactional emails
// Supports multiple providers: Resend, SendGrid, or Postmark

interface EmailParams {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend'; // 'resend', 'sendgrid', or 'postmark'
const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@bellaweddingai.com';
const FROM_NAME = process.env.FROM_NAME || 'Bella Wedding AI';

export async function sendEmail({ to, subject, html, from }: EmailParams) {
  const fromAddress = from || `${FROM_NAME} <${FROM_EMAIL}>`;

  try {
    if (EMAIL_PROVIDER === 'resend') {
      return await sendWithResend({ to, subject, html, from: fromAddress });
    } else if (EMAIL_PROVIDER === 'sendgrid') {
      return await sendWithSendGrid({ to, subject, html, from: fromAddress });
    } else if (EMAIL_PROVIDER === 'postmark') {
      return await sendWithPostmark({ to, subject, html, from: fromAddress });
    }

    // Fallback - log to console in development
    console.log('📧 Email (dev mode):', { to, subject, from: fromAddress });
    return { success: true, provider: 'dev' };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

async function sendWithResend(params: EmailParams) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.log('📧 Email (no API key):', params);
    return { success: true, provider: 'dev' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: params.from,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, provider: 'resend', id: data.id };
}

async function sendWithSendGrid(params: EmailParams) {
  const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

  if (!SENDGRID_API_KEY) {
    console.log('📧 Email (no API key):', params);
    return { success: true, provider: 'dev' };
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: { email: params.from },
      subject: params.subject,
      content: [{ type: 'text/html', value: params.html }],
    }),
  });

  if (!response.ok) {
    throw new Error(`SendGrid API error: ${response.statusText}`);
  }

  return { success: true, provider: 'sendgrid' };
}

async function sendWithPostmark(params: EmailParams) {
  const POSTMARK_API_KEY = process.env.POSTMARK_API_KEY;

  if (!POSTMARK_API_KEY) {
    console.log('📧 Email (no API key):', params);
    return { success: true, provider: 'dev' };
  }

  const response = await fetch('https://api.postmarkapp.com/email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': POSTMARK_API_KEY,
    },
    body: JSON.stringify({
      From: params.from,
      To: params.to,
      Subject: params.subject,
      HtmlBody: params.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Postmark API error: ${response.statusText}`);
  }

  const data = await response.json();
  return { success: true, provider: 'postmark', id: data.MessageID };
}

// Email Templates
export const emailTemplates = {
  welcome: (name: string) => ({
    subject: 'Welcome to Bella Wedding AI! 🎉',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4A574 0%, #9F7AEA 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .button { display: inline-block; padding: 12px 30px; background: #D4A574; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to Bella Wedding AI!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>We're thrilled to have you join Bella Wedding AI! Your journey to planning the perfect wedding starts now.</p>
            <p><strong>Here's what you can do next:</strong></p>
            <ul>
              <li>✅ Complete your wedding profile</li>
              <li>📋 Start your 90+ task checklist</li>
              <li>💰 Set up your budget tracker</li>
              <li>👰 Browse our vendor directory</li>
              <li>🤖 Chat with our AI planning assistant</li>
            </ul>
            <center>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">Get Started</a>
            </center>
            <p>Need help? Our AI assistant is available 24/7, or you can reach out to our support team anytime.</p>
            <p>Happy planning! 💕</p>
            <p>The Bella Wedding AI Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Bella Wedding AI. All rights reserved.</p>
            <p>You're receiving this because you signed up for Bella Wedding AI.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  subscriptionConfirmation: (name: string, plan: string, price: string) => ({
    subject: `Welcome to ${plan}! Your subscription is active`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #9F7AEA 0%, #D4A574 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .plan-badge { display: inline-block; padding: 8px 16px; background: #9F7AEA; color: white; border-radius: 20px; font-weight: bold; margin: 10px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #D4A574; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 You're all set!</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Your subscription is now active!</p>
            <center>
              <div class="plan-badge">${plan} Plan - ${price}</div>
            </center>
            <p><strong>What's unlocked for you:</strong></p>
            <ul>
              <li>✨ Full access to all planning tools</li>
              <li>📋 90+ task checklist with deadlines</li>
              <li>💰 Complete budget planner</li>
              <li>🎨 Décor zone planner</li>
              <li>💬 Unlimited vendor messaging</li>
              <li>🤖 AI planning assistant</li>
              ${plan === 'Premium' ? '<li>🌐 Wedding website builder</li><li>📊 RSVP management</li><li>🎨 Seating chart designer</li>' : ''}
            </ul>
            <center>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard" class="button">Start Planning</a>
            </center>
            <p>Questions about your subscription? Visit your <a href="${process.env.NEXT_PUBLIC_BASE_URL}/subscription/manage">subscription dashboard</a> to manage billing.</p>
            <p>Happy planning!</p>
            <p>The Bella Wedding AI Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Bella Wedding AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  taskReminder: (name: string, taskCount: number, daysUntilWedding: number) => ({
    subject: `${taskCount} tasks to complete - ${daysUntilWedding} days until your wedding!`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #D4A574 0%, #F9A8D4 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .countdown { font-size: 48px; font-weight: bold; color: #D4A574; text-align: center; margin: 20px 0; }
          .button { display: inline-block; padding: 12px 30px; background: #D4A574; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Task Reminder</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <div class="countdown">${daysUntilWedding} days</div>
            <p style="text-align: center; color: #666;">until your big day!</p>
            <p>You have <strong>${taskCount} tasks</strong> to complete. Stay on track to make your wedding day perfect!</p>
            <center>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/checklist" class="button">View Tasks</a>
            </center>
            <p>Need help prioritizing? Ask our AI assistant for personalized advice!</p>
            <p>You've got this! 💪</p>
            <p>The Bella Wedding AI Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Bella Wedding AI. All rights reserved.</p>
            <p>Manage your notification preferences in <a href="${process.env.NEXT_PUBLIC_BASE_URL}/settings">Settings</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),

  vendorMessage: (name: string, vendorName: string, messagePreview: string) => ({
    subject: `New message from ${vendorName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #60A5FA 0%, #9F7AEA 100%); color: white; padding: 30px; text-center; border-radius: 10px 10px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
          .message-preview { background: #f3f4f6; padding: 20px; border-left: 4px solid #60A5FA; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 30px; background: #60A5FA; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💬 New Message</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p><strong>${vendorName}</strong> sent you a message:</p>
            <div class="message-preview">
              <p>${messagePreview}</p>
            </div>
            <center>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL}/messages" class="button">Reply Now</a>
            </center>
            <p>Quick responses help you book your perfect vendors faster!</p>
            <p>The Bella Wedding AI Team</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Bella Wedding AI. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};
