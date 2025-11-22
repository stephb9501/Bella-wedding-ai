import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface BookingConfirmedEmailData {
  recipientName: string;
  recipientType: 'bride' | 'vendor';
  vendorName: string;
  vendorCategory: string;
  weddingDate: string;
  timeSlot?: string;
  bookingId: string;
  message?: string;
  vendorEmail?: string;
  brideEmail?: string;
}

export const getBookingConfirmedEmail = (data: BookingConfirmedEmailData): string => {
  const {
    recipientName,
    recipientType,
    vendorName,
    vendorCategory,
    weddingDate,
    timeSlot,
    bookingId,
    message,
    vendorEmail,
    brideEmail,
  } = data;

  const firstName = recipientName.split(' ')[0];
  const formattedDate = new Date(weddingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const timeSlotText = timeSlot && timeSlot !== 'all_day'
    ? ` (${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)})`
    : '';

  const brideContent = `
    <h2>Booking Confirmed!</h2>
    <p>Hi ${firstName},</p>
    <p>
      Great news! <strong>${vendorName}</strong> has confirmed your booking request.
      Your ${vendorCategory} is now officially booked for your wedding!
    </p>

    ${getInfoBox(`
      <h3 style="margin: 0 0 15px 0; color: ${emailColors.success}; font-size: 20px;">
        Booking Details
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight}; width: 35%;">Vendor:</td>
          <td style="padding: 8px 0; font-weight: 600;">${vendorName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Category:</td>
          <td style="padding: 8px 0; font-weight: 600;">${vendorCategory}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Date:</td>
          <td style="padding: 8px 0; font-weight: 600;">${formattedDate}${timeSlotText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Contact:</td>
          <td style="padding: 8px 0;"><a href="mailto:${vendorEmail}" style="color: ${emailColors.primary};">${vendorEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Booking ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${bookingId}</td>
        </tr>
      </table>
    `, 'success')}

    ${message ? `
      <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 25px 0 10px 0;">
        Message from ${vendorName}:
      </h3>
      <div style="
        background: ${emailColors.secondary};
        padding: 15px;
        border-radius: 8px;
        border-left: 3px solid ${emailColors.primary};
        font-style: italic;
        color: ${emailColors.text};
      ">
        ${message}
      </div>
    ` : ''}

    <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
      What's Next?
    </h3>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
      <li>Check your booking details in your dashboard</li>
      <li>Message your vendor directly for any questions</li>
      <li>Add this to your wedding timeline</li>
      <li>Mark this task as complete in your checklist</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      ${getButton('View Booking Details', `https://bellaweddingai.com/bookings/${bookingId}`)}
    </div>

    <p style="color: ${emailColors.textLight}; font-size: 14px; margin-top: 30px;">
      We'll send you a reminder as your wedding date approaches. You can also message
      ${vendorName} anytime through the platform.
    </p>
  `;

  const vendorContent = `
    <h2>New Booking Confirmed!</h2>
    <p>Hi ${firstName},</p>
    <p>
      You've successfully confirmed a booking! The couple is excited to have you as
      part of their special day.
    </p>

    ${getInfoBox(`
      <h3 style="margin: 0 0 15px 0; color: ${emailColors.success}; font-size: 20px;">
        Booking Details
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight}; width: 35%;">Client:</td>
          <td style="padding: 8px 0; font-weight: 600;">${recipientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Service:</td>
          <td style="padding: 8px 0; font-weight: 600;">${vendorCategory}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Date:</td>
          <td style="padding: 8px 0; font-weight: 600;">${formattedDate}${timeSlotText}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Contact:</td>
          <td style="padding: 8px 0;"><a href="mailto:${brideEmail}" style="color: ${emailColors.primary};">${brideEmail}</a></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Booking ID:</td>
          <td style="padding: 8px 0; font-family: monospace; font-size: 12px;">${bookingId}</td>
        </tr>
      </table>
    `, 'success')}

    <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
      Action Items:
    </h3>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
      <li>Add this event to your calendar</li>
      <li>Review any special requests from the couple</li>
      <li>Update your availability calendar</li>
      <li>Reach out to confirm next steps</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      ${getButton('View Booking Details', `https://bellaweddingai.com/vendor/bookings/${bookingId}`)}
    </div>

    <p style="color: ${emailColors.textLight}; font-size: 14px; margin-top: 30px;">
      Stay in touch with the couple through our messaging system. Great communication
      leads to amazing reviews!
    </p>
  `;

  const content = `
    ${getEmailHeader('Booking Confirmed')}
    <div class="content">
      ${recipientType === 'bride' ? brideContent : vendorContent}

      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong style="color: ${emailColors.primary};">The Bella Wedding AI Team</strong>
      </p>
    </div>
    ${getEmailFooter()}
  `;

  return getBaseEmailTemplate(content);
};
