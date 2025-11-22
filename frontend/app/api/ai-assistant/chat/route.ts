import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

const TIER_LIMITS: Record<string, number> = {
  free: 0,
  premium: 50,
  featured: 150,
  elite: 300,
};

// Simple AI response generator (in production, integrate with OpenAI, Claude, etc.)
function generateAIResponse(message: string, context?: any): string {
  const lowerMessage = message.toLowerCase();

  // Wedding planning responses
  if (lowerMessage.includes('timeline') || lowerMessage.includes('schedule')) {
    return `Creating a wedding timeline is crucial! Here's a recommended approach:

1. **12-18 Months Before:**
   - Set your budget
   - Create guest list
   - Book venue and key vendors

2. **6-12 Months Before:**
   - Send save-the-dates
   - Order invitations
   - Book remaining vendors

3. **3-6 Months Before:**
   - Finalize menu
   - Order wedding attire
   - Plan honeymoon

4. **1-3 Months Before:**
   - Send invitations
   - Finalize seating chart
   - Confirm all vendors

5. **Final Month:**
   - Final dress fitting
   - Create day-of timeline
   - Confirm final headcount

Would you like more details on any specific phase?`;
  }

  if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('money')) {
    return `Wedding budget tips:

**Budget Allocation Guidelines:**
- Venue & Catering: 40-50%
- Photography/Video: 10-15%
- Music/Entertainment: 8-10%
- Flowers & Decor: 8-10%
- Attire: 8-10%
- Miscellaneous: 8-10%

**Money-Saving Tips:**
1. Get married off-season (November-March)
2. Consider a Friday/Sunday wedding
3. DIY decorations where possible
4. Limit the guest list
5. Choose seasonal flowers
6. Skip expensive favors
7. Use digital invitations

What specific budget area would you like help with?`;
  }

  if (lowerMessage.includes('vendor') || lowerMessage.includes('photographer') || lowerMessage.includes('florist')) {
    return `When selecting vendors:

**Key Questions to Ask:**
1. Are you available on my wedding date?
2. What packages do you offer?
3. Can I see a full portfolio?
4. What's included in your pricing?
5. Do you have backup equipment/staff?
6. What's your cancellation policy?
7. Can you provide references?

**Red Flags:**
- No contract or vague terms
- Unwilling to show full portfolio
- Pressure to book immediately
- No insurance or backup plan

**Priority Vendors to Book First:**
1. Venue
2. Photographer/Videographer
3. Caterer
4. Band/DJ
5. Florist

Need help with a specific vendor type?`;
  }

  if (lowerMessage.includes('guest') || lowerMessage.includes('invite') || lowerMessage.includes('rsvp')) {
    return `Guest list and RSVP management tips:

**Creating Your Guest List:**
1. Start with your "must-have" guests
2. Consider venue capacity
3. Factor in your budget (cost per guest)
4. Include plus-ones thoughtfully
5. Create A and B lists if needed

**RSVP Best Practices:**
- Set RSVP deadline 3-4 weeks before wedding
- Include meal choices if applicable
- Provide multiple response methods (online, mail, phone)
- Follow up with non-responders 1 week after deadline
- Track dietary restrictions

**Seating Chart Tips:**
- Group guests with common interests
- Seat singles together
- Keep family dynamics in mind
- Place elderly guests away from speakers
- Create a kids table if needed

What aspect of guest management can I help with?`;
  }

  if (lowerMessage.includes('checklist') || lowerMessage.includes('tasks') || lowerMessage.includes('to do') || lowerMessage.includes('todo')) {
    return `Wedding planning checklist by timeline:

**12+ Months Before:**
✓ Announce engagement
✓ Set budget
✓ Choose wedding party
✓ Start guest list
✓ Book venue

**9-11 Months:**
✓ Book key vendors
✓ Start dress shopping
✓ Send save-the-dates
✓ Register for gifts

**6-8 Months:**
✓ Order invitations
✓ Book hotel blocks
✓ Plan honeymoon
✓ Order wedding attire

**3-5 Months:**
✓ Send invitations
✓ Order wedding cake
✓ Book rentals
✓ Plan rehearsal dinner

**1-2 Months:**
✓ Finalize seating chart
✓ Final dress fitting
✓ Get marriage license
✓ Confirm all vendors

**Final Week:**
✓ Pack for honeymoon
✓ Assign day-of duties
✓ Confirm final headcount
✓ Relax and enjoy!

Which phase are you currently in?`;
  }

  if (lowerMessage.includes('stress') || lowerMessage.includes('overwhelmed') || lowerMessage.includes('anxious')) {
    return `Wedding planning stress is completely normal! Here's how to manage it:

**Stress-Reduction Strategies:**
1. **Delegate tasks** - You don't have to do everything yourself
2. **Set boundaries** - It's okay to say no to unwanted advice
3. **Take breaks** - Schedule regular wedding-free time
4. **Stay organized** - Use planning tools and checklists
5. **Communicate** - Talk openly with your partner
6. **Remember the purpose** - Focus on the marriage, not just the wedding

**When to Get Help:**
- Consider a wedding planner or day-of coordinator
- Ask wedding party to take on specific tasks
- Hire professionals for complex DIY projects

**Self-Care Tips:**
- Maintain exercise routine
- Get enough sleep
- Practice mindfulness/meditation
- Spend quality time with your partner
- Celebrate small milestones

You're doing great! What specific aspect is causing the most stress?`;
  }

  // Default response
  return `I'm here to help with your wedding planning! I can assist with:

• Timeline and schedule planning
• Budget management and cost-saving tips
• Vendor selection and questions to ask
• Guest list and RSVP management
• Wedding day checklists
• Stress management and tips
• Seating chart strategies
• And much more!

What would you like to know more about?`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Authentication check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { wedding_id, message } = body;

    if (!message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // SERVER-SIDE tier validation - CRITICAL FIX
    const { data: vendorProfile, error: profileError } = await supabase
      .from('vendor_profiles')
      .select('tier')
      .eq('user_id', session.user.id)
      .single();

    // Default to free if no vendor profile found
    const actualTier = vendorProfile?.tier || 'free';

    // Check tier access
    if (actualTier === 'free') {
      return NextResponse.json(
        { error: 'AI Assistant is not available for free tier. Please upgrade to Premium, Featured, or Elite.' },
        { status: 403 }
      );
    }

    // Check monthly usage limit using ACTUAL tier from database
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: usageData, error: usageError } = await supabase
      .from('ai_usage_tracking')
      .select('id')
      .eq('user_id', session.user.id)
      .gte('created_at', firstDayOfMonth.toISOString())
      .lte('created_at', lastDayOfMonth.toISOString());

    if (usageError) {
      console.error('Usage tracking error:', usageError);
      return NextResponse.json({ error: 'Failed to check usage limits' }, { status: 500 });
    }

    const currentUsage = usageData?.length || 0;
    const monthlyLimit = TIER_LIMITS[actualTier] || 0;

    if (currentUsage >= monthlyLimit) {
      return NextResponse.json(
        { error: `You've reached your monthly limit of ${monthlyLimit} messages. Please upgrade your plan for more access.` },
        { status: 429 }
      );
    }

    // Generate AI response (in production, call OpenAI/Claude API)
    const aiResponse = generateAIResponse(message);

    // Track usage
    const { error: trackError } = await supabase
      .from('ai_usage_tracking')
      .insert({
        user_id: session.user.id,
        wedding_id: wedding_id || null,
        prompt: message,
        response: aiResponse,
        tokens_used: message.length + aiResponse.length, // Simplified token counting
      });

    if (trackError) {
      console.error('Tracking error:', trackError);
      // Don't fail the request if tracking fails
    }

    return NextResponse.json({
      response: aiResponse,
      usage: {
        current: currentUsage + 1,
        limit: monthlyLimit,
      },
    });
  } catch (error: any) {
    console.error('AI chat POST error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
