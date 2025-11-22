import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';
import { getWelcomeEmail, WelcomeEmailData } from './email-templates/welcome-email';
import { getBookingConfirmedEmail, BookingConfirmedEmailData } from './email-templates/booking-confirmed';
import { getBookingReminderEmail, BookingReminderEmailData } from './email-templates/booking-reminder';
import { getMessageNotificationEmail, MessageNotificationEmailData } from './email-templates/message-notification';
import { getReviewRequestEmail, ReviewRequestEmailData } from './email-templates/review-request';
import { getWeeklyDigestEmail, WeeklyDigestEmailData } from './email-templates/weekly-digest';
import { getVendorLeadEmail, VendorLeadEmailData } from './email-templates/vendor-lead';

/**
 * Email Service - Centralized email sending with Resend
 * Includes error handling, retry logic, preference checking, and logging
 */

export type EmailType =
  | 'welcome'
  | 'booking_confirmed'
  | 'booking_reminder'
  | 'message_notification'
  | 'review_request'
  | 'weekly_digest'
  | 'vendor_lead';

interface EmailQueueItem {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string;
  metadata?: Record<string, any>;
}

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  type: EmailType;
  userId?: string;
  metadata?: Record<string, any>;
  skipPreferenceCheck?: boolean;
  retries?: number;
}

interface EmailLogEntry {
  user_id?: string;
  email_type: EmailType;
  recipient_email: string;
  subject: string;
  status: 'sent' | 'failed' | 'skipped';
  error_message?: string;
  metadata?: Record<string, any>;
}

// Email queue for batch sending
const emailQueue: EmailQueueItem[] = [];
let isProcessingQueue = false;

/**
 * Initialize Resend client
 */
const getResendClient = (): Resend | null => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured');
    return null;
  }
  return new Resend(apiKey);
};

/**
 * Get Supabase admin client for logging and preference checking
 */
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('Supabase configuration missing for email logging');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
};

/**
 * Check if user wants to receive this type of email
 */
async function checkUserPreference(userId: string, emailType: EmailType): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return true; // Allow if we can't check

    const { data, error } = await supabase
      .from('email_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      // No preferences set, allow all by default
      return true;
    }

    // Check if user has opted out of this email type
    const preferenceKey = emailType as keyof typeof data;
    return data[preferenceKey] !== false;
  } catch (error) {
    console.error('Error checking email preferences:', error);
    return true; // Allow on error
  }
}

/**
 * Log email send attempt to database
 */
async function logEmail(entry: EmailLogEntry): Promise<void> {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) return;

    await supabase.from('email_logs').insert({
      ...entry,
      sent_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging email:', error);
    // Don't throw - logging failure shouldn't prevent email sending
  }
}

/**
 * Send email with retry logic
 */
async function sendEmailWithRetry(
  resend: Resend,
  options: SendEmailOptions,
  attempt: number = 1
): Promise<boolean> {
  const maxRetries = options.retries || 3;
  const fromEmail = process.env.EMAIL_FROM || 'Bella Wedding AI <onboarding@resend.dev>';

  try {
    const result = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (result.error) {
      throw new Error(result.error.message);
    }

    // Log success
    await logEmail({
      user_id: options.userId,
      email_type: options.type,
      recipient_email: options.to,
      subject: options.subject,
      status: 'sent',
      metadata: { ...options.metadata, email_id: result.data?.id },
    });

    console.log(`Email sent successfully: ${options.type} to ${options.to}`);
    return true;
  } catch (error: any) {
    console.error(`Email send attempt ${attempt} failed:`, error);

    // Retry logic
    if (attempt < maxRetries) {
      const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Exponential backoff, max 10s
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return sendEmailWithRetry(resend, options, attempt + 1);
    }

    // Log failure after all retries
    await logEmail({
      user_id: options.userId,
      email_type: options.type,
      recipient_email: options.to,
      subject: options.subject,
      status: 'failed',
      error_message: error.message,
      metadata: options.metadata,
    });

    return false;
  }
}

/**
 * Core send email function
 */
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.error('Cannot send email: Resend not configured');
      return false;
    }

    // Check user preferences if userId provided and not skipped
    if (options.userId && !options.skipPreferenceCheck) {
      const shouldSend = await checkUserPreference(options.userId, options.type);
      if (!shouldSend) {
        console.log(`Email skipped due to user preference: ${options.type} to ${options.to}`);
        await logEmail({
          user_id: options.userId,
          email_type: options.type,
          recipient_email: options.to,
          subject: options.subject,
          status: 'skipped',
          metadata: options.metadata,
        });
        return false;
      }
    }

    // Send with retry logic
    return await sendEmailWithRetry(resend, options);
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return false;
  }
}

/**
 * Add email to queue for batch processing
 */
export function queueEmail(item: EmailQueueItem): void {
  emailQueue.push(item);
}

/**
 * Process email queue
 */
export async function processEmailQueue(): Promise<void> {
  if (isProcessingQueue || emailQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  console.log(`Processing email queue: ${emailQueue.length} emails`);

  while (emailQueue.length > 0) {
    const item = emailQueue.shift();
    if (item) {
      await sendEmail({
        to: item.to,
        subject: item.subject,
        html: item.html,
        type: item.type,
        userId: item.userId,
        metadata: item.metadata,
      });
      // Small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  isProcessingQueue = false;
  console.log('Email queue processing complete');
}

// =============================================================================
// TEMPLATE-SPECIFIC SEND FUNCTIONS
// =============================================================================

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData,
  userId?: string
): Promise<boolean> {
  const html = getWelcomeEmail(data);
  return sendEmail({
    to,
    subject: data.userType === 'bride'
      ? 'Welcome to Your Wedding Planning Journey! 💍'
      : 'Welcome to Bella Wedding AI Vendor Network!',
    html,
    type: 'welcome',
    userId,
    metadata: { userType: data.userType, fullName: data.fullName },
  });
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmedEmail(
  to: string,
  data: BookingConfirmedEmailData,
  userId?: string
): Promise<boolean> {
  const html = getBookingConfirmedEmail(data);
  return sendEmail({
    to,
    subject: `Booking Confirmed: ${data.vendorName} for ${new Date(data.weddingDate).toLocaleDateString()}`,
    html,
    type: 'booking_confirmed',
    userId,
    metadata: {
      vendorName: data.vendorName,
      weddingDate: data.weddingDate,
      bookingId: data.bookingId,
    },
  });
}

/**
 * Send booking reminder email
 */
export async function sendBookingReminderEmail(
  to: string,
  data: BookingReminderEmailData,
  userId?: string
): Promise<boolean> {
  const html = getBookingReminderEmail(data);
  const daysText = data.daysUntilEvent === 1 ? '1 Day' : `${data.daysUntilEvent} Days`;
  return sendEmail({
    to,
    subject: `Reminder: ${data.vendorName || data.clientName} Booking in ${daysText}`,
    html,
    type: 'booking_reminder',
    userId,
    metadata: {
      bookingId: data.bookingId,
      daysUntilEvent: data.daysUntilEvent,
    },
  });
}

/**
 * Send message notification email
 */
export async function sendMessageNotificationEmail(
  to: string,
  data: MessageNotificationEmailData,
  userId?: string
): Promise<boolean> {
  const html = getMessageNotificationEmail(data);
  return sendEmail({
    to,
    subject: `New Message from ${data.senderName}`,
    html,
    type: 'message_notification',
    userId,
    metadata: {
      senderName: data.senderName,
      conversationId: data.conversationId,
      bookingId: data.bookingId,
    },
  });
}

/**
 * Send review request email
 */
export async function sendReviewRequestEmail(
  to: string,
  data: ReviewRequestEmailData,
  userId?: string
): Promise<boolean> {
  const html = getReviewRequestEmail(data);
  return sendEmail({
    to,
    subject: `How was your experience with ${data.vendorName}?`,
    html,
    type: 'review_request',
    userId,
    metadata: {
      vendorName: data.vendorName,
      vendorId: data.vendorId,
      bookingId: data.bookingId,
    },
  });
}

/**
 * Send weekly digest email
 */
export async function sendWeeklyDigestEmail(
  to: string,
  data: WeeklyDigestEmailData,
  userId?: string
): Promise<boolean> {
  const html = getWeeklyDigestEmail(data);
  return sendEmail({
    to,
    subject: `Your Weekly Wedding Planning Digest - ${data.daysUntilWedding} Days to Go!`,
    html,
    type: 'weekly_digest',
    userId,
    metadata: {
      daysUntilWedding: data.daysUntilWedding,
      progressPercentage: Math.round((data.completedTasks / data.totalTasks) * 100),
    },
  });
}

/**
 * Send vendor lead notification email
 */
export async function sendVendorLeadEmail(
  to: string,
  data: VendorLeadEmailData,
  userId?: string
): Promise<boolean> {
  const html = getVendorLeadEmail(data);
  return sendEmail({
    to,
    subject: `New Booking Request from ${data.brideName}!`,
    html,
    type: 'vendor_lead',
    userId,
    metadata: {
      brideName: data.brideName,
      weddingDate: data.weddingDate,
      requestId: data.requestId,
    },
  });
}
