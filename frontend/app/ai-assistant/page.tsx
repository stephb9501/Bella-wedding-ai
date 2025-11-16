'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import { Heart, Send, Sparkles, MessageCircle, Lightbulb, Calendar, DollarSign, Users } from 'lucide-react';

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

export default function AIAssistantPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [weddingContext, setWeddingContext] = useState<WeddingContext>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load wedding context
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadWeddingContext();
      // Add welcome message
      if (messages.length === 0) {
        addAssistantMessage(
          "Hi! I'm your AI wedding planning assistant. I can help you with timeline planning, budget suggestions, vendor recommendations, and answer any wedding planning questions. What would you like help with today?"
        );
      }
    }
  }, [isAuthenticated, user]);

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
    if (msg.includes('stress') || msg.includes('overwhelm') || msg.includes('help') || msg.includes('confused')) {
      return "Take a deep breath! Wedding planning can feel overwhelming, but you've got this. 💕\n\nLet's break it down:\n\n1. **Start with the big 3:** Venue, date, budget\n2. **Use the checklist:** One task at a time\n3. **Delegate:** You don't have to do everything yourself\n4. **Take breaks:** Planning should be fun!\n\nWhat's stressing you most right now? I can help you tackle it step by step.";
    }

    // Default helpful response
    return "I'm here to help with:\n\n• **Budget planning** - Get cost breakdowns and saving tips\n• **Timeline creation** - Know what to do and when\n• **Vendor recommendations** - Find the perfect pros\n• **Décor ideas** - Style suggestions and planning\n• **Guest management** - List building and RSVPs\n• **Checklist guidance** - Stay organized and on track\n\nWhat would you like help with? Just ask me anything about wedding planning!";
  };

  const handleSend = async () => {
    if (!input.trim()) return;

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
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-champagne-600" />
            <h1 className="text-4xl font-serif text-champagne-900">AI Planning Assistant</h1>
          </div>
          <p className="text-champagne-700">Your personal wedding planning expert, available 24/7</p>
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
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
      </div>
    </div>
  );
}
