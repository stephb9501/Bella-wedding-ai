import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface BookingReminderEmailData {
  recipientName: string;
  recipientType: 'bride' | 'vendor';
  vendorName?: string;
  clientName?: string;
  vendorCategory: string;
  weddingDate: string;
  timeSlot?: string;
  bookingId: string;
  daysUntilEvent: number;
  contactEmail?: string;
}

export const getBookingReminderEmail = (data: BookingReminderEmailData): string => {
  const {
    recipientName,
    recipientType,
    vendorName,
    clientName,
    vendorCategory,
    weddingDate,
    timeSlot,
    bookingId,
    daysUntilEvent,
    contactEmail,
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

  const urgencyMessage = daysUntilEvent <= 7
    ? `<strong style="color: ${emailColors.warning};">Just ${daysUntilEvent} ${daysUntilEvent === 1 ? 'day' : 'days'} away!</strong>`
    : daysUntilEvent <= 30
    ? `<strong>Coming up in ${daysUntilEvent} days</strong>`
    : `${daysUntilEvent} days until your event`;

  const brideContent = `
    <h2>Upcoming Booking Reminder</h2>
    <p>Hi ${firstName},</p>
    <p>
      This is a friendly reminder about your upcoming booking with <strong>${vendorName}</strong>.
      Your big day is getting closer!
    </p>

    ${getInfoBox(`
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 48px; font-weight: 700; color: ${emailColors.primary}; margin-bottom: 5px;">
          ${daysUntilEvent}
        </div>
        <div style="font-size: 14px; color: ${emailColors.textLight}; text-transform: uppercase; letter-spacing: 1px;">
          ${daysUntilEvent === 1 ? 'DAY TO GO' : 'DAYS TO GO'}
        </div>
      </div>
      <hr style="border: 0; border-top: 1px solid ${emailColors.border}; margin: 20px 0;" />
      <table style="width: 100%; margin-top: 15px;">
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight}; width: 35%;">Vendor:</td>
          <td style="padding: 8px 0; font-weight: 600;">${vendorName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Service:</td>
          <td style="padding: 8px 0; font-weight: 600;">${vendorCategory}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Date:</td>
          <td style="padding: 8px 0; font-weight: 600;">${formattedDate}${timeSlotText}</td>
        </tr>
        ${contactEmail ? `
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Contact:</td>
          <td style="padding: 8px 0;"><a href="mailto:${contactEmail}" style="color: ${emailColors.primary};">${contactEmail}</a></td>
        </tr>
        ` : ''}
      </table>
    `, daysUntilEvent <= 7 ? 'warning' : 'default')}

    <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
      Things to Confirm:
    </h3>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
      <li>Final details and requirements with ${vendorName}</li>
      <li>Arrival time and location specifics</li>
      <li>Any last-minute changes or special requests</li>
      <li>Payment and contract status</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      ${getButton('Message Vendor', `https://bellaweddingai.com/bookings/${bookingId}`)}
    </div>

    <p style="color: ${emailColors.textLight}; font-size: 14px; margin-top: 30px;">
      We recommend reaching out to your vendor a few days before the event to confirm
      all the details. This helps ensure everything goes smoothly on your special day!
    </p>
  `;

  const vendorContent = `
    <h2>Upcoming Booking Reminder</h2>
    <p>Hi ${firstName},</p>
    <p>
      This is a friendly reminder about your upcoming booking with <strong>${clientName}</strong>.
      ${urgencyMessage}
    </p>

    ${getInfoBox(`
      <div style="text-align: center; margin-bottom: 15px;">
        <div style="font-size: 48px; font-weight: 700; color: ${emailColors.primary}; margin-bottom: 5px;">
          ${daysUntilEvent}
        </div>
        <div style="font-size: 14px; color: ${emailColors.textLight}; text-transform: uppercase; letter-spacing: 1px;">
          ${daysUntilEvent === 1 ? 'DAY TO GO' : 'DAYS TO GO'}
        </div>
      </div>
      <hr style="border: 0; border-top: 1px solid ${emailColors.border}; margin: 20px 0;" />
      <table style="width: 100%; margin-top: 15px;">
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight}; width: 35%;">Client:</td>
          <td style="padding: 8px 0; font-weight: 600;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Service:</td>
          <td style="padding: 8px 0; font-weight: 600;">${vendorCategory}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Date:</td>
          <td style="padding: 8px 0; font-weight: 600;">${formattedDate}${timeSlotText}</td>
        </tr>
        ${contactEmail ? `
        <tr>
          <td style="padding: 8px 0; color: ${emailColors.textLight};">Contact:</td>
          <td style="padding: 8px 0;"><a href="mailto:${contactEmail}" style="color: ${emailColors.primary};">${contactEmail}</a></td>
        </tr>
        ` : ''}
      </table>
    `, daysUntilEvent <= 7 ? 'warning' : 'default')}

    <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
      Preparation Checklist:
    </h3>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
      <li>Confirm final details with the couple</li>
      <li>Verify location and timing</li>
      <li>Prepare equipment and materials</li>
      <li>Review special requests or requirements</li>
      <li>Plan your schedule for the day</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      ${getButton('View Booking Details', `https://bellaweddingai.com/vendor/bookings/${bookingId}`)}
    </div>

    <p style="color: ${emailColors.textLight}; font-size: 14px; margin-top: 30px;">
      Make sure to touch base with ${clientName} before the event. Great communication
      leads to happy clients and stellar reviews!
    </p>
  `;

  const content = `
    ${getEmailHeader('Booking Reminder')}
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
