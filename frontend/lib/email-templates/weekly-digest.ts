import { getEmailHeader, getEmailFooter, getButton, getInfoBox, getBaseEmailTemplate, emailColors } from './components';

export interface WeeklyDigestEmailData {
  brideName: string;
  weddingDate: string;
  daysUntilWedding: number;
  completedTasks: number;
  totalTasks: number;
  upcomingTasks: Array<{
    title: string;
    dueDate?: string;
  }>;
  recentActivity?: Array<{
    type: string;
    description: string;
    date: string;
  }>;
  newMessages?: number;
  budgetSpent?: number;
  budgetTotal?: number;
  tips?: string[];
}

export const getWeeklyDigestEmail = (data: WeeklyDigestEmailData): string => {
  const {
    brideName,
    weddingDate,
    daysUntilWedding,
    completedTasks,
    totalTasks,
    upcomingTasks,
    recentActivity = [],
    newMessages = 0,
    budgetSpent,
    budgetTotal,
    tips = [],
  } = data;

  const firstName = brideName.split(' ')[0];
  const formattedWeddingDate = new Date(weddingDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const budgetPercentage = budgetTotal && budgetSpent
    ? Math.round((budgetSpent / budgetTotal) * 100)
    : null;

  const content = `
    ${getEmailHeader('Your Weekly Planning Digest')}
    <div class="content">
      <h2>Weekly Planning Update</h2>
      <p>Hi ${firstName},</p>
      <p>
        Here's your weekly wedding planning summary. You're doing great!
      </p>

      ${getInfoBox(`
        <div style="text-align: center; margin-bottom: 15px;">
          <div style="font-size: 42px; font-weight: 700; color: ${emailColors.primary}; margin-bottom: 5px;">
            ${daysUntilWedding}
          </div>
          <div style="font-size: 14px; color: ${emailColors.textLight}; text-transform: uppercase; letter-spacing: 1px;">
            DAYS UNTIL YOUR WEDDING
          </div>
          <div style="font-size: 16px; color: ${emailColors.text}; margin-top: 10px;">
            ${formattedWeddingDate}
          </div>
        </div>
      `, 'default')}

      <h3 style="color: ${emailColors.text}; font-size: 20px; margin: 30px 0 15px 0;">
        Planning Progress
      </h3>

      <div style="margin-bottom: 25px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="font-weight: 600; color: ${emailColors.text};">Tasks Completed</span>
          <span style="font-weight: 600; color: ${emailColors.primary};">${completedTasks} of ${totalTasks}</span>
        </div>
        <div style="background: ${emailColors.secondary}; height: 20px; border-radius: 10px; overflow: hidden;">
          <div style="
            background: linear-gradient(90deg, ${emailColors.primary} 0%, #F43F5E 100%);
            height: 100%;
            width: ${progressPercentage}%;
            border-radius: 10px;
            transition: width 0.3s ease;
          "></div>
        </div>
        <div style="text-align: center; margin-top: 8px; color: ${emailColors.textLight}; font-size: 14px;">
          ${progressPercentage}% Complete
        </div>
      </div>

      ${budgetPercentage !== null ? `
        <div style="margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="font-weight: 600; color: ${emailColors.text};">Budget Used</span>
            <span style="font-weight: 600; color: ${emailColors.primary};">$${budgetSpent?.toLocaleString()} of $${budgetTotal?.toLocaleString()}</span>
          </div>
          <div style="background: ${emailColors.secondary}; height: 20px; border-radius: 10px; overflow: hidden;">
            <div style="
              background: ${budgetPercentage > 90 ? emailColors.warning : emailColors.success};
              height: 100%;
              width: ${budgetPercentage}%;
              border-radius: 10px;
            "></div>
          </div>
          <div style="text-align: center; margin-top: 8px; color: ${emailColors.textLight}; font-size: 14px;">
            ${budgetPercentage}% of Budget
          </div>
        </div>
      ` : ''}

      ${upcomingTasks.length > 0 ? `
        <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
          Upcoming Tasks
        </h3>
        <div style="background: ${emailColors.secondary}; padding: 20px; border-radius: 8px;">
          ${upcomingTasks.slice(0, 5).map((task, index) => `
            <div style="
              padding: 12px 0;
              ${index < upcomingTasks.length - 1 ? `border-bottom: 1px solid ${emailColors.border};` : ''}
            ">
              <div style="font-weight: 600; color: ${emailColors.text}; margin-bottom: 4px;">
                ${task.title}
              </div>
              ${task.dueDate ? `
                <div style="font-size: 13px; color: ${emailColors.textLight};">
                  Due: ${new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${newMessages > 0 ? `
        <div style="
          background: ${emailColors.secondary};
          border-left: 4px solid ${emailColors.primary};
          padding: 15px 20px;
          margin: 25px 0;
          border-radius: 6px;
        ">
          <div style="font-weight: 600; color: ${emailColors.text}; margin-bottom: 5px;">
            You have ${newMessages} unread ${newMessages === 1 ? 'message' : 'messages'}
          </div>
          <div style="font-size: 14px; color: ${emailColors.textLight};">
            Stay in touch with your vendors for the best results
          </div>
        </div>
      ` : ''}

      ${recentActivity.length > 0 ? `
        <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
          Recent Activity
        </h3>
        <div style="background: ${emailColors.secondary}; padding: 20px; border-radius: 8px;">
          ${recentActivity.slice(0, 3).map((activity, index) => `
            <div style="
              padding: 12px 0;
              ${index < recentActivity.length - 1 ? `border-bottom: 1px solid ${emailColors.border};` : ''}
            ">
              <div style="font-weight: 600; color: ${emailColors.text}; margin-bottom: 4px;">
                ${activity.description}
              </div>
              <div style="font-size: 13px; color: ${emailColors.textLight};">
                ${new Date(activity.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      ${tips.length > 0 ? `
        <h3 style="color: ${emailColors.text}; font-size: 18px; margin: 30px 0 15px 0;">
          This Week's Planning Tips
        </h3>
        <div style="background: linear-gradient(135deg, #FFF1F2 0%, #FFE4E6 100%); padding: 20px; border-radius: 8px;">
          ${tips.map(tip => `
            <div style="margin-bottom: 12px; padding-left: 15px; position: relative;">
              <div style="
                position: absolute;
                left: 0;
                top: 8px;
                width: 6px;
                height: 6px;
                background: ${emailColors.primary};
                border-radius: 50%;
              "></div>
              <div style="color: ${emailColors.text}; line-height: 1.6;">
                ${tip}
              </div>
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div style="text-align: center; margin: 35px 0;">
        ${getButton('View Full Dashboard', 'https://bellaweddingai.com/dashboard')}
      </div>

      <p style="margin-top: 30px; color: ${emailColors.textLight}; text-align: center; font-size: 14px;">
        You're making great progress! Keep up the momentum.
      </p>

      <p style="margin-top: 30px;">
        Happy planning,<br/>
        <strong style="color: ${emailColors.primary};">The Bella Wedding AI Team</strong>
      </p>
    </div>
    ${getEmailFooter()}
  `;

  return getBaseEmailTemplate(content);
};
