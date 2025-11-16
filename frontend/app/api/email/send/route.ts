import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, emailTemplates } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, to, data } = body;

    if (!type || !to) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let emailContent;

    // Generate email based on type
    switch (type) {
      case 'welcome':
        emailContent = emailTemplates.welcome(data.name || 'there');
        break;

      case 'subscription_confirmation':
        emailContent = emailTemplates.subscriptionConfirmation(
          data.name || 'there',
          data.plan || 'Premium',
          data.price || '$39.99/mo'
        );
        break;

      case 'task_reminder':
        emailContent = emailTemplates.taskReminder(
          data.name || 'there',
          data.taskCount || 0,
          data.daysUntilWedding || 0
        );
        break;

      case 'vendor_message':
        emailContent = emailTemplates.vendorMessage(
          data.name || 'there',
          data.vendorName || 'A vendor',
          data.messagePreview || 'You have a new message'
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Send email
    const result = await sendEmail({
      to,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    );
  }
}
