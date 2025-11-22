import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface VendorLeadEmailData {
  vendorName: string;
  brideName: string;
  weddingDate: string;
  timeSlot?: string;
  guestCount?: number;
  budget?: string;
  message?: string;
  brideEmail: string;
  requestId: string;
  category: string;
}

export const getVendorLeadEmail = (data: VendorLeadEmailData): string => {
  const {
    vendorName,
    brideName,
    weddingDate,
    timeSlot,
    guestCount,
    budget,
    message,
    brideEmail,
    requestId,
    category,
  } = data;

  const firstName = vendorName.split(' ')[0];
  const formattedDate = new Date(weddingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const timeSlotText = timeSlot && timeSlot !== 'all_day'
    ? ` (${timeSlot.charAt(0).toUpperCase() + timeSlot.slice(1)})`
    : '';

  const content = `
    ${getEmailHeader('New Booking Request!')}
    <div class="content">
      <h2>New Lead - Booking Request</h2>
      <p>Hi ${firstName},</p>
      <p>
        Exciting news! You have a new booking inquiry from a couple planning their wedding.
        Respond quickly to increase your chances of securing this booking!
      </p>

      ${getInfoBox(`
        <h3 style="margin: 0 0 15px 0; color: ${emailColors.primary}; font-size: 20px;">
          Booking Request Details
        </h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight}; width: 35%;">Couple:</td>
            <td style="padding: 8px 0; font-weight: 600;">${brideName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Service:</td>
            <td style="padding: 8px 0; font-weight: 600;">${category}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Wedding Date:</td>
            <td style="padding: 8px 0; font-weight: 600;">${formattedDate}${timeSlotText}</td>
          </tr>
          ${guestCount ? `
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Guest Count:</td>
            <td style="padding: 8px 0; font-weight: 600;">${guestCount} guests</td>
          </tr>
          ` : ''}
          ${budget ? `
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Budget Range:</td>
            <td style="padding: 8px 0; font-weight: 600;">${budget}</td>
          </tr>
          ` : ''}
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Contact:</td>
            <td style="padding: 8px 0;"><a href="mailto:${brideEmail}" style="color: ${emailColors.primary};">${brideEmail}</a></td>
          </tr>
        </table>
      `, 'success')}

      ${message ? `
        <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 25px 0 10px 0;">
          Message from ${brideName}:
        </h3>
        <div style="
          background: ${emailColors.secondary};
          padding: 20px;
          border-radius: 8px;
          border-left: 3px solid ${emailColors.primary};
          font-style: italic;
          color: ${emailColors.text};
          line-height: 1.6;
        ">
          ${message}
        </div>
      ` : ''}

      <div style="
        background: linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%);
        border-left: 4px solid ${emailColors.warning};
        padding: 20px;
        margin: 30px 0;
        border-radius: 6px;
      ">
        <h3 style="margin: 0 0 10px 0; color: ${emailColors.text}; font-size: 16px;">
          Response Time Matters!
        </h3>
        <p style="margin: 0; color: ${emailColors.textLight}; font-size: 14px; line-height: 1.6;">
          Couples who receive a response within 24 hours are <strong>3x more likely</strong>
          to book. Don't miss this opportunity!
        </p>
      </div>

      <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
        Next Steps:
      </h3>
      <ol style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
        <li style="margin-bottom: 10px;">
          <strong>Review the details</strong> and check your availability
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Respond promptly</strong> with your availability and pricing
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Ask questions</strong> to understand their vision better
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Showcase your expertise</strong> and previous work
        </li>
      </ol>

      <div style="text-align: center; margin: 35px 0;">
        ${getButton('View & Respond to Request', `https://bellaweddingai.com/vendor/leads/${requestId}`)}
      </div>

      <hr class="divider" />

      <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 20px 0 15px 0;">
        Tips for a Great Response:
      </h3>
      <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8; color: ${emailColors.textLight}; font-size: 14px;">
        <li>Personalize your response to their specific needs</li>
        <li>Share relevant examples from your portfolio</li>
        <li>Be transparent about pricing and what's included</li>
        <li>Highlight your unique value proposition</li>
        <li>Suggest a call or meeting to discuss further</li>
        <li>Show enthusiasm and professionalism</li>
      </ul>

      <p style="
        background: ${emailColors.secondary};
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        color: ${emailColors.textLight};
        font-size: 14px;
        margin: 30px 0;
      ">
        Remember: Great communication leads to bookings, and bookings lead to reviews.
        Build your reputation one wedding at a time!
      </p>

      <p style="margin-top: 30px;">
        Best of luck,<br/>
        <strong style="color: ${emailColors.primary};">The Bella Wedding AI Team</strong>
      </p>
    </div>
    ${getEmailFooter()}
  `;

  return getBaseEmailTemplate(content);
};
