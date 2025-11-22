import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface MessageNotificationEmailData {
  recipientName: string;
  senderName: string;
  senderType: 'bride' | 'vendor';
  message: string;
  conversationId?: string;
  bookingId?: string;
  contextType?: string; // e.g., "booking", "inquiry", "general"
}

export const getMessageNotificationEmail = (data: MessageNotificationEmailData): string => {
  const {
    recipientName,
    senderName,
    senderType,
    message,
    conversationId,
    bookingId,
    contextType = 'general',
  } = data;

  const firstName = recipientName.split(' ')[0];

  // Truncate message if too long
  const displayMessage = message.length > 300
    ? message.substring(0, 297) + '...'
    : message;

  const messageUrl = bookingId
    ? `https://bellaweddingai.com/bookings/${bookingId}`
    : conversationId
    ? `https://bellaweddingai.com/messages?conversation=${conversationId}`
    : 'https://bellaweddingai.com/messages';

  const contextText = contextType === 'booking'
    ? 'about your booking'
    : contextType === 'inquiry'
    ? 'regarding their inquiry'
    : 'on Bella Wedding AI';

  const content = `
    ${getEmailHeader('New Message')}
    <div class="content">
      <h2>You Have a New Message!</h2>
      <p>Hi ${firstName},</p>
      <p>
        <strong>${senderName}</strong> sent you a message ${contextText}.
      </p>

      ${getInfoBox(`
        <div style="margin-bottom: 10px;">
          <div style="font-size: 12px; color: ${emailColors.textLight}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">
            From ${senderType === 'bride' ? 'Bride/Couple' : 'Vendor'}
          </div>
          <div style="font-weight: 600; font-size: 16px; color: ${emailColors.text}; margin-bottom: 15px;">
            ${senderName}
          </div>
        </div>
        <div style="
          background: ${emailColors.white};
          padding: 15px;
          border-radius: 8px;
          border: 1px solid ${emailColors.border};
          color: ${emailColors.text};
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
        ">
          ${displayMessage}
        </div>
        ${message.length > 300 ? `
          <p style="font-size: 12px; color: ${emailColors.textLight}; margin: 10px 0 0 0; font-style: italic;">
            Message truncated. Click below to read the full message.
          </p>
        ` : ''}
      `)}

      <div style="text-align: center; margin: 30px 0;">
        ${getButton('Reply to Message', messageUrl)}
      </div>

      <hr class="divider" />

      <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 20px 0 15px 0;">
        Quick Reply Tips:
      </h3>
      <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8; color: ${emailColors.textLight}; font-size: 14px;">
        <li>Respond within 24 hours to maintain good communication</li>
        <li>Be professional and courteous in your messages</li>
        <li>Keep all communication on the platform for your protection</li>
        <li>Ask clarifying questions if you need more details</li>
      </ul>

      <p style="margin-top: 30px;">
        Best regards,<br/>
        <strong style="color: ${emailColors.primary};">The Bella Wedding AI Team</strong>
      </p>
    </div>
    ${getEmailFooter()}
  `;

  return getBaseEmailTemplate(content);
};
