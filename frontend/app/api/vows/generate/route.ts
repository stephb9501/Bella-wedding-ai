import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth-helpers';

// OpenAI GPT-4 Vow Generation
export async function POST(request: NextRequest) {
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const {
      partnerName,
      howMet,
      favoriteMemory,
      loveMost,
      promises,
      tone,
      length,
    } = await request.json();

    // Validate required fields
    if (!partnerName || !tone || !length) {
      return NextResponse.json(
        { error: 'Partner name, tone, and length are required' },
        { status: 400 }
      );
    }

    // Check OpenAI API key
    const openaiApiKey = process.env.OPENAI_API_KEY;
    if (!openaiApiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to your environment variables.',
        },
        { status: 500 }
      );
    }

    // Determine token count based on length
    const maxTokens = {
      short: 300,   // 1-2 min read
      medium: 500,  // 3-4 min read
      long: 800,    // 5+ min read
    }[length] || 500;

    // Build context for the AI
    const context = [];
    if (howMet) context.push(`How we met: ${howMet}`);
    if (favoriteMemory) context.push(`Favorite memory: ${favoriteMemory}`);
    if (loveMost) context.push(`What I love most: ${loveMost}`);
    if (promises) context.push(`Promises I want to make: ${promises}`);

    const contextString = context.length > 0 ? context.join('\n') : 'No additional context provided.';

    // Tone descriptions
    const toneDescriptions = {
      romantic: 'deeply romantic and poetic, using beautiful imagery and heartfelt expressions of love',
      funny: 'warm and humorous, balancing genuine emotion with light-hearted moments and jokes',
      traditional: 'classic and timeless, following traditional vow structures with elegant language',
      modern: 'contemporary and personal, using modern language while being authentic and sincere',
    };

    const toneDescription = toneDescriptions[tone as keyof typeof toneDescriptions] || toneDescriptions.romantic;

    // Call OpenAI API to generate 3 versions
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a professional wedding vow writer with years of experience crafting personalized, heartfelt wedding vows. Create heartfelt, personalized wedding vows based on the couple's story.

Your task is to generate THREE different versions of wedding vows, each unique but maintaining the same tone and length requirements.

Each version should:
- Be ${toneDescription}
- Be approximately ${length === 'short' ? '1-2 minutes' : length === 'medium' ? '3-4 minutes' : '5+ minutes'} when spoken aloud
- Include personal details from the couple's story
- Feel authentic and genuine
- Have a clear structure (opening, personal stories/promises, closing)
- Be memorable and meaningful

Format your response as JSON with this exact structure:
{
  "vows": [
    "First version of the vows...",
    "Second version of the vows...",
    "Third version of the vows..."
  ]
}

Important: Return ONLY the JSON object, no other text.`,
          },
          {
            role: 'user',
            content: `Create 3 unique versions of wedding vows for ${partnerName} with the following details:

${contextString}

Tone: ${tone}
Length: ${length}

Remember to return ONLY a JSON object with the three vow versions in the "vows" array.`,
          },
        ],
        max_tokens: maxTokens * 3, // 3 versions
        temperature: 0.8, // Higher creativity for varied versions
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '';

    // Parse the JSON response
    let vows: string[];
    try {
      const parsed = JSON.parse(aiResponse);
      vows = parsed.vows;

      if (!Array.isArray(vows) || vows.length !== 3) {
        throw new Error('Invalid response format');
      }
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', aiResponse);
      // Fallback: create a single version
      vows = [aiResponse, aiResponse, aiResponse];
    }

    return NextResponse.json({
      vows,
      success: true
    });

  } catch (error: any) {
    console.error('Vow generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate vows' },
      { status: 500 }
    );
  }
}
