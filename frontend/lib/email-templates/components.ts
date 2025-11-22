/**
 * Reusable email template components
 * These components provide consistent branding across all email templates
 */

export const emailColors = {
  primary: '#E11D48', // Rose pink
  secondary: '#F9FAFB',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  white: '#FFFFFF',
  success: '#10B981',
  warning: '#F59E0B',
};

export const getEmailHeader = (title?: string) => `
  <div style="background: ${emailColors.primary}; padding: 30px 20px; text-align: center;">
    <h1 style="color: ${emailColors.white}; margin: 0; font-size: 28px; font-weight: 700;">
      Bella Wedding AI
    </h1>
    ${title ? `<p style="color: ${emailColors.white}; margin: 10px 0 0 0; font-size: 16px; opacity: 0.95;">${title}</p>` : ''}
  </div>
`;

export const getEmailFooter = () => `
  <div style="background: ${emailColors.secondary}; padding: 30px 20px; text-align: center; margin-top: 40px;">
    <p style="color: ${emailColors.textLight}; font-size: 14px; margin: 0 0 10px 0;">
      Made with love by Bella Wedding AI
    </p>
    <p style="color: ${emailColors.textLight}; font-size: 12px; margin: 0 0 15px 0;">
      Your AI-powered wedding planning companion
    </p>
    <div style="margin: 15px 0;">
      <a href="https://bellaweddingai.com" style="color: ${emailColors.primary}; text-decoration: none; margin: 0 10px; font-size: 14px;">
        Visit Website
      </a>
      <span style="color: ${emailColors.border};">|</span>
      <a href="https://bellaweddingai.com/settings/preferences" style="color: ${emailColors.primary}; text-decoration: none; margin: 0 10px; font-size: 14px;">
        Email Preferences
      </a>
      <span style="color: ${emailColors.border};">|</span>
      <a href="https://bellaweddingai.com/help" style="color: ${emailColors.primary}; text-decoration: none; margin: 0 10px; font-size: 14px;">
        Help Center
      </a>
    </div>
    <p style="color: ${emailColors.textLight}; font-size: 11px; margin: 15px 0 0 0; line-height: 1.5;">
      This email was sent to you because you have an account with Bella Wedding AI.<br/>
      To manage your email preferences, visit your account settings.
    </p>
  </div>
`;

export const getButton = (text: string, url: string, color: string = emailColors.primary) => `
  <a href="${url}" style="
    display: inline-block;
    background: ${color};
    color: ${emailColors.white};
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    margin: 10px 0;
  ">${text}</a>
`;

export const getInfoBox = (content: string, style: 'default' | 'success' | 'warning' = 'default') => {
  const bgColor = style === 'success' ? '#ECFDF5' : style === 'warning' ? '#FFFBEB' : emailColors.secondary;
  const borderColor = style === 'success' ? emailColors.success : style === 'warning' ? emailColors.warning : emailColors.border;

  return `
    <div style="
      background: ${bgColor};
      border-left: 4px solid ${borderColor};
      padding: 20px;
      border-radius: 6px;
      margin: 20px 0;
    ">
      ${content}
    </div>
  `;
};

export const getBaseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Bella Wedding AI</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: ${emailColors.text};
      background-color: #F3F4F6;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: ${emailColors.white};
    }
    .content {
      padding: 30px 20px;
    }
    h2 {
      color: ${emailColors.text};
      font-size: 24px;
      margin: 0 0 20px 0;
    }
    p {
      margin: 0 0 15px 0;
      line-height: 1.6;
    }
    a {
      color: ${emailColors.primary};
      text-decoration: none;
    }
    .divider {
      border: 0;
      border-top: 1px solid ${emailColors.border};
      margin: 30px 0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    ${content}
  </div>
</body>
</html>
`;
