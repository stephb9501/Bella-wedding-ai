import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface ReviewRequestEmailData {
  brideName: string;
  vendorName: string;
  vendorCategory: string;
  weddingDate: string;
  bookingId: string;
  vendorId: string;
}

export const getReviewRequestEmail = (data: ReviewRequestEmailData): string => {
  const {
    brideName,
    vendorName,
    vendorCategory,
    weddingDate,
    bookingId,
    vendorId,
  } = data;

  const firstName = brideName.split(' ')[0];
  const formattedDate = new Date(weddingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const content = `
    ${getEmailHeader('How Was Your Experience?')}
    <div class="content">
      <h2>Share Your Experience</h2>
      <p>Hi ${firstName},</p>
      <p>
        Congratulations on your wedding! We hope your special day was absolutely magical.
      </p>
      <p>
        We'd love to hear about your experience with <strong>${vendorName}</strong>.
        Your feedback helps other couples make informed decisions and helps vendors
        improve their services.
      </p>

      ${getInfoBox(`
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight}; width: 35%;">Vendor:</td>
            <td style="padding: 8px 0; font-weight: 600;">${vendorName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Category:</td>
            <td style="padding: 8px 0; font-weight: 600;">${vendorCategory}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: ${emailColors.textLight};">Wedding Date:</td>
            <td style="padding: 8px 0; font-weight: 600;">${formattedDate}</td>
          </tr>
        </table>
      `)}

      <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
        Your Review Helps:
      </h3>
      <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
        <li><strong>Future Couples</strong> - Make confident vendor choices</li>
        <li><strong>Vendors</strong> - Improve their services and grow their business</li>
        <li><strong>Community</strong> - Build trust and transparency</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        ${getButton('Write a Review', `https://bellaweddingai.com/vendors/${vendorId}/review?booking=${bookingId}`)}
      </div>

      <p style="
        background: ${emailColors.secondary};
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        color: ${emailColors.textLight};
        font-size: 14px;
        margin: 30px 0;
      ">
        Your review will be public, but you can choose to keep your identity private.
        We moderate all reviews to ensure they're helpful and respectful.
      </p>

      <hr class="divider" />

      <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 20px 0 15px 0;">
        What to Include in Your Review:
      </h3>
      <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8; color: ${emailColors.textLight}; font-size: 14px;">
        <li>Overall quality of service</li>
        <li>Professionalism and communication</li>
        <li>Value for money</li>
        <li>Any standout moments or details</li>
        <li>Would you recommend them to others?</li>
      </ul>

      <p style="margin-top: 30px; color: ${emailColors.textLight};">
        Thank you for being part of the Bella Wedding AI community. We wish you a
        lifetime of happiness together!
      </p>

      <p style="margin-top: 30px;">
        Warmest congratulations,<br/>
        <strong style="color: ${emailColors.primary};">The Bella Wedding AI Team</strong>
      </p>
    </div>
    ${getEmailFooter()}
  `;

  return getBaseEmailTemplate(content);
};
