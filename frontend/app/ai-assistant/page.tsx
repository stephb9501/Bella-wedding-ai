'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import { Heart, Send, Sparkles, MessageCircle, Lightbulb, Calendar, DollarSign, Users, MapPin, Lock } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WeddingContext {
  weddingDate?: string;
  budget?: number;
  guestCount?: number;
  location?: string;
  theme?: string;
}

interface UserTier {
  tier: 'free' | 'standard' | 'premium';
  messagesLimit: number;
  messagesUsed: number;
}

interface GuidedQuestionsData {
  weddingDate: string;
  budget: string;
  guestCount: string;
  location: string;
  venueType: string;
  theme: string;
  topPriorities: string;
  biggestConcerns: string;
  vendorsNeeded: string;
  additionalNotes: string;
}

export default function AIAssistantPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [weddingContext, setWeddingContext] = useState<WeddingContext>({});
  const [userTier, setUserTier] = useState<UserTier>({ tier: 'standard', messagesLimit: 60, messagesUsed: 0 });
  const [showGuidedQuestions, setShowGuidedQuestions] = useState(false);
  const [guidedAnswers, setGuidedAnswers] = useState<GuidedQuestionsData>({
    weddingDate: '',
    budget: '',
    guestCount: '',
    location: '',
    venueType: '',
    theme: '',
    topPriorities: '',
    biggestConcerns: '',
    vendorsNeeded: '',
    additionalNotes: '',
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load wedding context and user tier
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadWeddingContext();
      loadUserTier();
      // Add welcome message
      if (messages.length === 0) {
        addAssistantMessage(
          "Hi! I'm your AI wedding planning assistant. I can help you with timeline planning, budget suggestions, vendor recommendations, and answer any wedding planning questions. What would you like help with today?"
        );
      }
    }
  }, [isAuthenticated, user]);

  const loadUserTier = () => {
    if (!user?.id) return;

    // In real app, fetch from API
    // For now, mock Standard tier with message tracking
    const storageKey = `bella_ai_messages_${user.id}`;
    const stored = localStorage.getItem(storageKey);

    if (stored) {
      const data = JSON.parse(stored);
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

      // Reset count if new month
      if (data.month !== currentMonth) {
        const tier = { tier: 'standard', messagesLimit: 60, messagesUsed: 0 };
        setUserTier(tier);
        localStorage.setItem(storageKey, JSON.stringify({ ...tier, month: currentMonth }));
      } else {
        setUserTier({ tier: data.tier, messagesLimit: data.messagesLimit, messagesUsed: data.messagesUsed });
      }
    } else {
      // New user - set initial tier
      const tier = { tier: 'standard', messagesLimit: 60, messagesUsed: 0 };
      const currentMonth = new Date().toISOString().slice(0, 7);
      setUserTier(tier);
      localStorage.setItem(storageKey, JSON.stringify({ ...tier, month: currentMonth }));
    }
  };

  const loadWeddingContext = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/settings/profile?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setWeddingContext({
            weddingDate: data.profile.wedding_date,
            budget: data.profile.budget_total,
            guestCount: data.profile.guest_count,
            location: data.profile.wedding_location,
            theme: data.profile.wedding_theme
          });
        }
      }
    } catch (error) {
      console.error('Error loading context:', error);
    }
  };

  const addAssistantMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, message]);
  };

  const generateResponse = (userMessage: string): string => {
    const msg = userMessage.toLowerCase();

    // Budget questions
    if (msg.includes('budget') || msg.includes('cost') || msg.includes('expensive')) {
      const budgetAdvice = weddingContext.budget
        ? `Based on your budget of $${weddingContext.budget?.toLocaleString()}, here's a typical breakdown:\n\n• Venue & Catering: 40-50% ($${Math.round(weddingContext.budget * 0.45).toLocaleString()})\n• Photography/Video: 10-15% ($${Math.round(weddingContext.budget * 0.12).toLocaleString()})\n• Flowers & Décor: 8-10% ($${Math.round(weddingContext.budget * 0.09).toLocaleString()})\n• Music/DJ: 8-10% ($${Math.round(weddingContext.budget * 0.09).toLocaleString()})\n• Dress & Attire: 8-10% ($${Math.round(weddingContext.budget * 0.09).toLocaleString()})\n• Remaining: 12-16% (rings, invites, favors, misc)\n\nWould you like help with any specific category?`
        : "I'd be happy to help with budget planning! First, what's your total wedding budget? You can update this in Settings, or just tell me and I can give you a breakdown.";
      return budgetAdvice;
    }

    // Timeline questions
    if (msg.includes('timeline') || msg.includes('when') || msg.includes('schedule')) {
      if (weddingContext.weddingDate) {
        const weddingDate = new Date(weddingContext.weddingDate);
        const today = new Date();
        const monthsAway = Math.round((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30));

        return `Your wedding is ${monthsAway} months away! Here's your priority timeline:\n\n**Right Now:**\n• Book venue and caterer\n• Hire photographer\n• Start dress shopping\n\n**${monthsAway - 3} months before:**\n• Send save-the-dates\n• Book florist and DJ\n• Order invitations\n\n**3 months before:**\n• Finalize guest list\n• Plan ceremony details\n• Order wedding cake\n\n**1 month before:**\n• Final vendor confirmations\n• Create seating chart\n• Finalize timeline\n\nNeed help with any of these tasks?`;
      }
      return "I can help you create a timeline! First, when is your wedding date? You can set it in Settings or tell me here.";
    }

    // Vendor questions
    if (msg.includes('vendor') || msg.includes('photographer') || msg.includes('florist') || msg.includes('caterer') || msg.includes('dj')) {
      return "I can help you find vendors! Check out our Vendor Directory where you can:\n\n• Browse vetted wedding vendors\n• Filter by location and budget\n• Read reviews from real couples\n• Message vendors directly\n• Compare packages and pricing\n\nWhat type of vendor are you looking for? (photographer, florist, caterer, DJ, etc.)";
    }

    // Décor questions
    if (msg.includes('decor') || msg.includes('decoration') || msg.includes('flowers') || msg.includes('theme')) {
      const themeAdvice = weddingContext.theme
        ? `I see you're going with a ${weddingContext.theme} theme! Head to the Décor & Setup page to:\n\n• Plan your event zones\n• Get style-specific suggestions\n• Create packing lists\n• Track setup assignments\n\nWould you like specific décor ideas for ${weddingContext.theme} weddings?`
        : "Let me help with décor! First, have you chosen a wedding theme? Popular options include:\n\n• Modern Minimalist\n• Rustic Charm\n• Boho Chic\n• Glamorous\n• Garden Romance\n• Vintage Elegance\n\nYou can set your theme in Settings, or check out the Décor & Setup page for inspiration!";
      return themeAdvice;
    }

    // Guest list questions
    if (msg.includes('guest') || msg.includes('invitation') || msg.includes('rsvp')) {
      const guestAdvice = weddingContext.guestCount
        ? `For ${weddingContext.guestCount} guests, here are key considerations:\n\n• Venue capacity: Need space for ${Math.round(weddingContext.guestCount * 1.1)} (10% buffer)\n• Seating: ${Math.round(weddingContext.guestCount / 8)} tables of 8\n• Catering: Budget $75-150 per person\n• Invitations: Order ${Math.round(weddingContext.guestCount * 0.6)} (assuming couples)\n\nNeed help with seating arrangements or managing RSVPs?`
        : "I can help with guest planning! How many guests are you expecting? This helps me give you better advice on venues, catering, and budgeting.";
      return guestAdvice;
    }

    // Checklist questions
    if (msg.includes('checklist') || msg.includes('task') || msg.includes('to do') || msg.includes('what should')) {
      return "Great question! I recommend using our 90+ Task Checklist to stay organized. It includes:\n\n• Tasks organized by timeline (12mo, 9mo, 6mo, etc.)\n• Priority levels\n• Completion tracking\n• Deadline reminders\n\nHead to the Checklist page to get started, or ask me about specific tasks you need help with!";
    }

    // Stress/overwhelmed
    if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('help') || msg.includes('confused') || msg.includes('anxious')) {
      return "Take a deep breath! Wedding planning can feel overwhelming, but you've got this. 💕\n\nLet's break it down:\n\n1. **Start with the big 3:** Venue, date, budget\n2. **Use the checklist:** One task at a time\n3. **Delegate:** You don't have to do everything yourself\n4. **Take breaks:** Planning should be fun!\n\nWhat's stressing you most right now? I can help you tackle it step by step.";
    }

    // Dress shopping
    if (msg.includes('dress') || msg.includes('gown') || msg.includes('attire') || msg.includes('what to wear')) {
      return "Let's talk wedding attire! 👗\n\n**Dress Shopping Tips:**\n• Start 9-12 months before your wedding\n• Budget: $1,000-$5,000 (average $1,800)\n• Bring only 2-3 trusted people\n• Try different silhouettes (A-line, ballgown, mermaid, sheath)\n• Consider your venue & theme\n\n**Timeline:**\n• Order: 6-9 months before\n• Alterations: 2-3 months before\n• Final fitting: 2-4 weeks before\n\nNeed recommendations for bridal shops in your area? I can help you find them in our vendor directory!";
    }

    // Photography
    if (msg.includes('photo') && !msg.includes('vendor')) {
      return "Photography is one of the most important investments! 📸\n\n**Popular Photography Styles:**\n• Traditional/Posed - Classic formal shots\n• Photojournalistic - Candid, documentary style\n• Fine Art - Artistic, editorial aesthetic\n• Dark & Moody - Dramatic lighting\n• Bright & Airy - Light, ethereal feel\n\n**Budget:** $2,500-$10,000 (10-15% of total budget)\n\n**Questions to Ask:**\n• How many hours of coverage?\n• Second shooter included?\n• Digital files included?\n• Turnaround time for photos?\n• Experience with your venue?\n\nBrowse photographers in our vendor directory and message them directly!";
    }

    // Music/Entertainment
    if (msg.includes('music') || msg.includes('band') || msg.includes('entertainment')) {
      return "Music sets the mood for your entire celebration! 🎵\n\n**DJ vs Live Band:**\n\n**DJ ($1,000-$3,000)**\n✓ More song variety\n✓ Takes up less space\n✓ More affordable\n✗ Less interactive energy\n\n**Live Band ($3,000-$10,000)**\n✓ Unique energy & experience\n✓ Can personalize songs\n✓ Wow factor for guests\n✗ More expensive\n✗ Limited song selection\n\n**Key Considerations:**\n• Match your venue size\n• Guest demographics\n• Music preferences\n• Budget constraints\n\nWant to browse DJs and bands? Check our vendor directory!";
    }

    // Venue selection
    if (msg.includes('venue') && !msg.includes('vendor')) {
      return "Choosing your venue is one of the first big decisions! 🏛️\n\n**Venue Types:**\n• Ballroom/Hotel - Classic, all-inclusive\n• Barn/Rustic - Trendy, DIY-friendly\n• Garden/Outdoor - Natural, romantic\n• Museum/Gallery - Unique, artistic\n• Restaurant/Brewery - Intimate, casual\n• Beach/Destination - Scenic, adventurous\n\n**Questions to Ask:**\n• What's included? (tables, chairs, linens?)\n• Guest capacity?\n• Indoor backup if outdoor?\n• Catering flexibility?\n• Parking availability?\n• Setup/teardown time?\n\n**Budget:** 40-50% of total wedding budget\n\nReady to search? Browse venues in our vendor directory!";
    }

    // Catering/Food
    if (msg.includes('food') || msg.includes('cater') || msg.includes('menu') || msg.includes('meal')) {
      return "Food is a major highlight for your guests! 🍽️\n\n**Catering Styles:**\n• Plated Dinner - Formal, sit-down service ($75-150/person)\n• Buffet - Variety, interactive ($50-100/person)\n• Family Style - Shareable, communal ($60-120/person)\n• Food Stations - Trendy, interactive ($60-130/person)\n• Cocktail Reception - Casual, mingling ($40-80/person)\n\n**Menu Planning Tips:**\n• Offer 2-3 entrée choices\n• Accommodate dietary restrictions\n• Include vegetarian options\n• Consider cultural significance\n• Seasonal ingredients save money\n\n**Budget:** Plan $75-150 per guest (including drinks)\n\nBrowse caterers and get quotes in our vendor directory!";
    }

    // Flowers/Florist
    if (msg.includes('flower') && !msg.includes('vendor')) {
      return "Flowers add beauty and fragrance to your day! 🌸\n\n**Floral Needs:**\n• Bridal bouquet ($150-$350)\n• Bridesmaids bouquets ($50-$100 each)\n• Boutonnieres ($15-$30 each)\n• Centerpieces ($75-$200 each)\n• Ceremony arrangements ($200-$500)\n• Arch/altar florals ($300-$1,000)\n\n**Money-Saving Tips:**\n• Choose seasonal flowers\n• Use greenery as filler\n• Repurpose ceremony flowers at reception\n• Consider potted plants\n• Mix in non-floral elements\n\n**Budget:** 8-10% of total budget ($1,500-$5,000)\n\n**Popular Flowers by Season:**\n• Spring: Tulips, peonies, ranunculus\n• Summer: Roses, hydrangeas, dahlias\n• Fall: Chrysanthemums, dahlias, amaranthus\n• Winter: Amaryllis, holly, evergreens\n\nFind florists in our vendor directory!";
    }

    // Invitations
    if (msg.includes('invite') || msg.includes('save the date') || msg.includes('stationery')) {
      return "Your invitations set the tone for your wedding! 💌\n\n**Stationery Timeline:**\n• Save-the-Dates: 6-8 months before (for destination weddings: 9-12 months)\n• Invitations: Mail 6-8 weeks before\n• RSVP deadline: 3-4 weeks before wedding\n\n**What to Include:**\n✓ Couple's names\n✓ Date, time, location\n✓ Dress code\n✓ RSVP card & deadline\n✓ Wedding website URL\n✓ Registry information (optional)\n✓ Hotel block details\n\n**Budget:** $1.50-$8 per invitation\n\n**Options:**\n• Digital invites ($0-$50 total)\n• DIY templates ($50-$200)\n• Semi-custom ($300-$800)\n• Custom/letterpress ($1,000-$3,000)\n\nUse our website builder to create a wedding website and share with your invites!";
    }

    // Honeymoon
    if (msg.includes('honeymoon') || msg.includes('travel') || msg.includes('trip')) {
      return "Time to plan your dream honeymoon! ✈️\n\n**Honeymoon Timing:**\n• Right after wedding (traditional)\n• A few weeks later (less stressful)\n• 'Minimoon' now + big trip later\n\n**Popular Destinations:**\n• Beach: Maldives, Bora Bora, Hawaii\n• European: Italy, Greece, France\n• Adventure: New Zealand, Iceland, Costa Rica\n• Cultural: Japan, Morocco, Peru\n• All-Inclusive: Mexico, Caribbean resorts\n\n**Budget:** 5-10% of wedding budget ($3,000-$10,000)\n\n**Planning Tips:**\n• Book 6-8 months in advance\n• Use wedding registry for honeymoon fund\n• Consider off-season for savings\n• Apply for travel rewards credit card\n• Purchase travel insurance\n\nMany couples use honeymoon funds on their registry - add yours in the Registry section!";
    }

    // Seating chart
    if (msg.includes('seating') || msg.includes('table assignment') || msg.includes('where to sit')) {
      return "Seating arrangements can be tricky! 🪑\n\n**Seating Tips:**\n• Start with VIPs (parents, grandparents, wedding party)\n• Group friends who know each other\n• Mix tables so guests can meet new people\n• Separate feuding family members 😅\n• Seat quiet guests with chatty ones\n• Put kids near parents\n\n**Table Sizes:**\n• Round: 8-10 guests\n• Rectangle: 6-8 guests\n• King's table (head table): Wedding party\n\n**Seating Styles:**\n• Assigned tables + open seating\n• Fully assigned with place cards\n• Complete open seating (casual only)\n\n**Timeline:** Finalize 2 weeks before wedding\n\nPremium subscribers can use our Seating Chart Designer tool! (Coming soon)";
    }

    // Default helpful response
    return "I'm here to help with:\n\n• **Budget planning** - Get cost breakdowns and saving tips\n• **Timeline creation** - Know what to do and when\n• **Vendor recommendations** - Find the perfect pros\n• **Décor ideas** - Style suggestions and planning\n• **Guest management** - List building and RSVPs\n• **Checklist guidance** - Stay organized and on track\n• **Photography advice** - Styles, pricing, what to ask\n• **Dress shopping** - Timeline, budget, tips\n• **Catering options** - Menu styles, pricing, planning\n• **Music & entertainment** - DJ vs band, budgeting\n• **Invitations** - Timeline, wording, what to include\n• **Honeymoon planning** - Destinations, budgeting, timing\n\nWhat would you like help with? Just ask me anything about wedding planning!";
  };

  const handleGuidedQuestionsSubmit = () => {
    // Validate required fields
    if (!guidedAnswers.weddingDate || !guidedAnswers.budget || !guidedAnswers.guestCount) {
      alert('Please fill in at least the wedding date, budget, and guest count.');
      return;
    }

    // Save to wedding context
    const newContext: WeddingContext = {
      weddingDate: guidedAnswers.weddingDate,
      budget: parseInt(guidedAnswers.budget.replace(/[^0-9]/g, '')) || 0,
      guestCount: parseInt(guidedAnswers.guestCount) || 0,
      location: guidedAnswers.location,
      theme: guidedAnswers.theme,
    };
    setWeddingContext(newContext);

    // Save all guided answers to localStorage for AI reference
    if (user?.id) {
      localStorage.setItem(`bella_wedding_profile_${user.id}`, JSON.stringify(guidedAnswers));
      localStorage.setItem('bella_wedding_details', JSON.stringify(newContext));
    }

    // Close modal
    setShowGuidedQuestions(false);

    // Generate comprehensive AI response based on all their answers
    const comprehensiveResponse = `Perfect! I've saved all your wedding details. Here's a personalized summary based on what you shared:\n\n**Your Wedding Overview:**\n📅 Date: ${new Date(guidedAnswers.weddingDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}\n💰 Budget: $${parseInt(guidedAnswers.budget.replace(/[^0-9]/g, '')).toLocaleString()}\n👥 Guests: ${guidedAnswers.guestCount}\n📍 Location: ${guidedAnswers.location || 'Not specified'}\n🎨 Theme: ${guidedAnswers.theme || 'Not specified'}\n\n**Your Top Priorities:** ${guidedAnswers.topPriorities || 'Not specified'}\n\n**Your Biggest Concerns:** ${guidedAnswers.biggestConcerns || 'Not specified'}\n\n**Vendors You Need:** ${guidedAnswers.vendorsNeeded || 'Not specified'}\n\n${guidedAnswers.additionalNotes ? `**Additional Notes:** ${guidedAnswers.additionalNotes}\n\n` : ''}I'm now customizing all my responses based on your specific wedding details. You saved several messages by filling this out upfront! 🎉\n\nWhat would you like help with first? I can help you:\n• Create a detailed timeline\n• Break down your budget by category\n• Find vendors that match your needs and budget\n• Suggest ideas for your ${guidedAnswers.theme || 'chosen'} theme\n• Address your specific concerns`;

    addAssistantMessage(comprehensiveResponse);
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check message limit
    if (userTier.messagesUsed >= userTier.messagesLimit) {
      addAssistantMessage(
        `⚠️ You've reached your monthly message limit (${userTier.messagesLimit} messages).\n\n` +
        (userTier.tier === 'standard'
          ? "Upgrade to Premium for 120 messages/month! Visit the Pricing page to upgrade."
          : "Upgrade your plan for more AI assistant messages! Visit the Pricing page.")
      );
      return;
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Increment message count
    const newMessagesUsed = userTier.messagesUsed + 1;
    const updatedTier = { ...userTier, messagesUsed: newMessagesUsed };
    setUserTier(updatedTier);

    // Save to localStorage
    if (user?.id) {
      const storageKey = `bella_ai_messages_${user.id}`;
      const currentMonth = new Date().toISOString().slice(0, 7);
      localStorage.setItem(storageKey, JSON.stringify({ ...updatedTier, month: currentMonth }));
    }

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate and add AI response
    const response = generateResponse(input);
    addAssistantMessage(response);
    setIsTyping(false);
  };

  const QuickQuestion = ({ icon: Icon, text, onClick }: any) => (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-champagne-300 rounded-lg hover:bg-champagne-50 hover:border-champagne-400 transition-colors text-sm"
    >
      <Icon className="w-4 h-4 text-champagne-600" />
      <span className="text-champagne-700">{text}</span>
    </button>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="AI Planning Assistant"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <Sparkles className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Your Personal AI Wedding Planner</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Get instant answers to your wedding planning questions. Budget advice, timeline help, vendor recommendations, and more.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <MessageCircle className="w-8 h-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-champagne-900 mb-2">24/7 Planning Support</h3>
                <p className="text-sm text-champagne-600">Ask questions anytime and get instant, personalized advice</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <DollarSign className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="font-semibold text-champagne-900 mb-2">Budget Breakdowns</h3>
                <p className="text-sm text-champagne-600">Get detailed cost estimates and money-saving tips</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <Calendar className="w-8 h-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-champagne-900 mb-2">Timeline Guidance</h3>
                <p className="text-sm text-champagne-600">Know exactly what to do and when to do it</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6">
                <Lightbulb className="w-8 h-8 text-orange-600 mb-3" />
                <h3 className="font-semibold text-champagne-900 mb-2">Smart Suggestions</h3>
                <p className="text-sm text-champagne-600">Personalized recommendations based on your wedding details</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-champagne-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-champagne-600" />
                <h1 className="text-4xl font-serif text-champagne-900">AI Planning Assistant</h1>
              </div>
              <p className="text-champagne-700">Your personal wedding planning expert, available 24/7</p>
            </div>

            {/* Message Counter */}
            <div className="px-4 py-2 bg-white rounded-lg shadow-sm border border-champagne-200">
              <div className="text-xs text-champagne-600">AI Messages This Month</div>
              <div className="font-semibold text-champagne-900">
                {userTier.messagesUsed} / {userTier.messagesLimit}
                {userTier.messagesUsed >= userTier.messagesLimit && (
                  <Lock className="w-4 h-4 inline ml-2 text-red-500" />
                )}
              </div>
              {userTier.tier === 'standard' && userTier.messagesUsed > 50 && (
                <button
                  onClick={() => router.push('/pricing')}
                  className="mt-1 text-xs text-purple-600 hover:text-purple-800 font-medium"
                >
                  Upgrade for 120 →
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: '70vh' }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-champagne-600 text-white'
                          : 'bg-champagne-100 text-champagne-900'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-line">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-champagne-200' : 'text-champagne-500'}`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-champagne-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-champagne-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-champagne-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-champagne-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-champagne-200 p-4">
                {userTier.messagesUsed >= userTier.messagesLimit ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <Lock className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-800 mb-3">
                      You've used all {userTier.messagesLimit} AI messages this month.
                    </p>
                    <button
                      onClick={() => router.push('/pricing')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
                    >
                      {userTier.tier === 'standard' ? 'Upgrade to Premium (120 messages/mo)' : 'Upgrade Your Plan'}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything about wedding planning..."
                      className="flex-1 px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="px-6 py-3 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Guided Setup */}
            <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-lg p-6 border-2 border-purple-300">
              <h3 className="font-bold text-champagne-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Wedding Profile
              </h3>
              <p className="text-sm text-champagne-700 mb-4">
                Complete your wedding profile to get personalized AI responses and save message credits!
              </p>
              <button
                onClick={() => setShowGuidedQuestions(true)}
                className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium text-sm"
              >
                Complete Wedding Profile
              </button>
            </div>

            {/* Quick Questions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-champagne-900 mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-orange-500" />
                Quick Questions
              </h3>
              <div className="space-y-2">
                <QuickQuestion
                  icon={DollarSign}
                  text="Budget breakdown"
                  onClick={() => setInput("How should I budget my wedding?")}
                />
                <QuickQuestion
                  icon={Calendar}
                  text="Timeline help"
                  onClick={() => setInput("What's my wedding planning timeline?")}
                />
                <QuickQuestion
                  icon={MapPin}
                  text="Find vendors"
                  onClick={() => setInput("How do I find good vendors?")}
                />
                <QuickQuestion
                  icon={Users}
                  text="Guest list tips"
                  onClick={() => setInput("Help with my guest list")}
                />
              </div>
            </div>

            {/* Your Wedding */}
            {weddingContext.weddingDate && (
              <div className="bg-champagne-50 rounded-2xl border border-champagne-200 p-6">
                <h3 className="font-semibold text-champagne-900 mb-4">Your Wedding</h3>
                <div className="space-y-3 text-sm">
                  {weddingContext.weddingDate && (
                    <div>
                      <div className="text-champagne-600 text-xs">Date</div>
                      <div className="text-champagne-900 font-medium">
                        {new Date(weddingContext.weddingDate).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                  )}
                  {weddingContext.location && (
                    <div>
                      <div className="text-champagne-600 text-xs">Location</div>
                      <div className="text-champagne-900 font-medium">{weddingContext.location}</div>
                    </div>
                  )}
                  {weddingContext.budget && (
                    <div>
                      <div className="text-champagne-600 text-xs">Budget</div>
                      <div className="text-champagne-900 font-medium">${weddingContext.budget.toLocaleString()}</div>
                    </div>
                  )}
                  {weddingContext.guestCount && (
                    <div>
                      <div className="text-champagne-600 text-xs">Guests</div>
                      <div className="text-champagne-900 font-medium">{weddingContext.guestCount}</div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => router.push('/settings')}
                  className="mt-4 w-full text-center text-xs text-champagne-600 hover:text-champagne-800"
                >
                  Update in Settings →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Guided Questions Modal */}
        {showGuidedQuestions && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">Complete Your Wedding Profile</h2>
                    <p className="text-purple-100 text-sm">
                      Answer these questions once to save message credits and get personalized AI responses!
                    </p>
                  </div>
                  <button
                    onClick={() => setShowGuidedQuestions(false)}
                    className="text-white/80 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                  <strong>💡 Pro Tip:</strong> Write detailed paragraph responses! This helps the AI understand your needs better and saves you from having to explain things multiple times.
                </div>

                {/* Wedding Date */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Wedding Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={guidedAnswers.weddingDate}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, weddingDate: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Total Wedding Budget <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $25,000"
                    value={guidedAnswers.budget}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, budget: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Guest Count */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Expected Guest Count <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 150"
                    value={guidedAnswers.guestCount}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, guestCount: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Wedding Location (City/State)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Austin, TX or Napa Valley, CA"
                    value={guidedAnswers.location}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, location: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none"
                  />
                </div>

                {/* Venue Type */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Venue Type or Preferences
                  </label>
                  <textarea
                    placeholder="e.g., Outdoor garden venue, rustic barn, elegant ballroom, beachfront resort, etc. Describe your ideal venue setting."
                    value={guidedAnswers.venueType}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, venueType: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Wedding Theme or Style
                  </label>
                  <textarea
                    placeholder="e.g., Romantic garden with soft blush and gold colors, modern minimalist black and white, vintage rustic with wildflowers, etc."
                    value={guidedAnswers.theme}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, theme: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Top Priorities */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Your Top 3 Priorities
                  </label>
                  <textarea
                    placeholder="e.g., Amazing food and drinks, stunning photography to capture every moment, creating a fun dance party atmosphere. Be specific about what matters most to you!"
                    value={guidedAnswers.topPriorities}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, topPriorities: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Biggest Concerns */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Your Biggest Concerns or Questions
                  </label>
                  <textarea
                    placeholder="e.g., Worried about staying within budget, not sure how to find reliable vendors, concerned about timeline and getting everything done, anxious about coordinating family drama, etc."
                    value={guidedAnswers.biggestConcerns}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, biggestConcerns: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Vendors Needed */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Which Vendors Do You Still Need to Book?
                  </label>
                  <textarea
                    placeholder="e.g., Still need to book: photographer, florist, and DJ. Already have venue and caterer locked in. Looking for someone who can do both hair and makeup."
                    value={guidedAnswers.vendorsNeeded}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, vendorsNeeded: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-bold text-champagne-900 mb-2">
                    Any Other Important Details?
                  </label>
                  <textarea
                    placeholder="e.g., This is a second wedding for both of us so we want a smaller, intimate celebration. We're having a destination wedding so logistics are tricky. We want to incorporate cultural traditions from both families. Etc."
                    value={guidedAnswers.additionalNotes}
                    onChange={(e) => setGuidedAnswers({ ...guidedAnswers, additionalNotes: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-champagne-200 rounded-lg focus:border-purple-400 focus:outline-none resize-none"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-champagne-200 flex gap-3">
                <button
                  onClick={() => setShowGuidedQuestions(false)}
                  className="flex-1 px-6 py-3 border-2 border-champagne-300 text-champagne-700 rounded-lg hover:bg-champagne-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGuidedQuestionsSubmit}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium"
                >
                  Save Wedding Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
