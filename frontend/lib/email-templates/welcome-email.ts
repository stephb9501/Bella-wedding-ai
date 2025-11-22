import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface WelcomeEmailData {
  fullName: string;
  email: string;
  userType: 'bride' | 'vendor';
  weddingDate?: string;
  vendorCategory?: string;
}

export const getWelcomeEmail = (data: WelcomeEmailData): string => {
  const { fullName, userType, weddingDate, vendorCategory } = data;

  const firstName = fullName.split(' ')[0];

  const brideContent = `
    <h2>Welcome to Your Wedding Planning Journey!</h2>
    <p>Hi ${firstName},</p>
    <p>
      Congratulations on your upcoming wedding! We're absolutely thrilled to have you join
      Bella Wedding AI, your intelligent companion for planning the perfect wedding.
    </p>

    ${weddingDate ? `
      <p>
        We see your big day is on <strong>${new Date(weddingDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</strong>.
        Let's make it absolutely magical!
      </p>
    ` : ''}

    ${getInfoBox(`
      <h3 style="margin: 0 0 10px 0; color: ${emailColors.text}; font-size: 18px;">Get Started in 3 Easy Steps:</h3>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">
          <strong>Set up your wedding details</strong> - Date, venue, guest count
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Create your checklist</strong> - Our AI will generate a personalized timeline
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Find your dream vendors</strong> - Browse and book from our curated marketplace
        </li>
      </ol>
    `, 'success')}

    <h3 style="color: ${emailColors.text}; font-size: 20px; margin: 30px 0 15px 0;">
      What You Can Do with Bella Wedding AI:
    </h3>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
      <li>Smart budget tracking with AI recommendations</li>
      <li>Personalized vendor recommendations</li>
      <li>Guest list management and RSVP tracking</li>
      <li>Beautiful wedding website builder</li>
      <li>AI-powered timeline and checklist</li>
      <li>Mood boards and inspiration galleries</li>
      <li>Seating chart designer</li>
      <li>And so much more!</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      ${getButton('Start Planning Now', 'https://bellaweddingai.com/dashboard')}
    </div>

    <hr class="divider" />

    <p style="color: ${emailColors.textLight}; font-size: 14px;">
      <strong>Need help getting started?</strong><br/>
      Check out our <a href="https://bellaweddingai.com/help" style="color: ${emailColors.primary};">Help Center</a>
      or reply to this email - our team is here to help!
    </p>
  `;

  const vendorContent = `
    <h2>Welcome to Bella Wedding AI!</h2>
    <p>Hi ${firstName},</p>
    <p>
      Welcome to Bella Wedding AI's vendor network! We're excited to help you connect with
      couples planning their dream weddings and grow your business.
    </p>

    ${vendorCategory ? `
      <p>
        We've set up your profile in the <strong>${vendorCategory}</strong> category.
        Let's get you ready to receive bookings!
      </p>
    ` : ''}

    ${getInfoBox(`
      <h3 style="margin: 0 0 10px 0; color: ${emailColors.text}; font-size: 18px;">Complete Your Profile:</h3>
      <ol style="margin: 10px 0; padding-left: 20px;">
        <li style="margin-bottom: 10px;">
          <strong>Add your business details</strong> - Description, pricing, services
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Upload your portfolio</strong> - Showcase your best work
        </li>
        <li style="margin-bottom: 10px;">
          <strong>Set your availability</strong> - Let couples know when you're free
        </li>
      </ol>
    `, 'success')}

    <h3 style="color: ${emailColors.text}; font-size: 20px; margin: 30px 0 15px 0;">
      Grow Your Wedding Business:
    </h3>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; line-height: 1.8;">
      <li>Get matched with couples planning their perfect day</li>
      <li>Manage booking requests and availability</li>
      <li>Collect reviews and build your reputation</li>
      <li>Direct messaging with potential clients</li>
      <li>Analytics and insights on your profile performance</li>
      <li>Premium visibility options to stand out</li>
    </ul>

    <div style="text-align: center; margin: 30px 0;">
      ${getButton('Complete Your Profile', 'https://bellaweddingai.com/vendor/profile')}
    </div>

    <hr class="divider" />

    <p style="color: ${emailColors.textLight}; font-size: 14px;">
      <strong>Want to boost your visibility?</strong><br/>
      Explore our <a href="https://bellaweddingai.com/vendor/pricing" style="color: ${emailColors.primary};">premium plans</a>
      to get more bookings and grow your business.
    </p>
  `;

  const content = `
    ${getEmailHeader(userType === 'bride' ? 'Welcome to Your Big Day!' : 'Welcome to Our Vendor Network!')}
    <div class="content">
      ${userType === 'bride' ? brideContent : vendorContent}

      <p style="margin-top: 30px;">
        Warmest regards,<br/>
        <strong style="color: ${emailColors.primary};">The Bella Wedding AI Team</strong>
      </p>
    </div>
    ${getEmailFooter()}
  `;

  return getBaseEmailTemplate(content);
};
