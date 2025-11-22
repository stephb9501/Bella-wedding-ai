'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, AlertCircle, Crown, Star, Zap, Lock } from 'lucide-react';

interface Message {
  id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface UsageStats {
  current_usage: number;
  monthly_limit: number;
  reset_date: string;
  tier: 'free' | 'premium' | 'featured' | 'elite';
}

interface VendorAIAssistantProps {
  userId: string;
  userTier: 'free' | 'premium' | 'featured' | 'elite';
  weddingId?: string;
}

const TIER_LIMITS = {
  free: 0,
  premium: 50,
  featured: 150,
  elite: 300,
};

const TIER_INFO = {
  free: {
    name: 'Free',
    icon: Lock,
    color: 'text-gray-500',
    bg: 'bg-gray-100',
    limit: 0,
  },
  premium: {
    name: 'Premium',
    icon: Crown,
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    limit: 50,
  },
  featured: {
    name: 'Featured',
    icon: Star,
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    limit: 150,
  },
  elite: {
    name: 'Elite',
    icon: Zap,
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    limit: 300,
  },
};

export function VendorAIAssistant({ userId, userTier, weddingId }: VendorAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const tierInfo = TIER_INFO[userTier];
  const hasAccess = userTier !== 'free';
  const monthlyLimit = TIER_LIMITS[userTier];

  useEffect(() => {
    if (hasAccess) {
      fetchUsageStats();
      fetchMessageHistory();
    }
  }, [userId, hasAccess]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsageStats = async () => {
    try {
      const response = await fetch(`/api/ai-assistant/usage?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch usage stats');
      const data = await response.json();
      setUsageStats(data);
    } catch (err) {
      console.error('Error fetching usage stats:', err);
    }
  };

  const fetchMessageHistory = async () => {
    try {
      const response = await fetch(`/api/ai-assistant/messages?user_id=${userId}`);
      if (!response.ok) throw new Error('Failed to fetch message history');
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error fetching message history:', err);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    // Check if user has access
    if (!hasAccess) {
      setShowUpgradeModal(true);
      return;
    }

    // Check usage limits
    if (usageStats && usageStats.current_usage >= monthlyLimit) {
      setError(`You've reached your monthly limit of ${monthlyLimit} messages. Upgrade your plan for more access.`);
      setShowUpgradeModal(true);
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    const messageToSend = inputMessage;

    // Add user message to state using functional update
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          wedding_id: weddingId,
          message: messageToSend,
          tier: userTier,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        created_at: new Date().toISOString(),
      };

      // Add assistant message using functional update
      setMessages(prev => [...prev, assistantMessage]);

      // Update usage stats
      await fetchUsageStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Remove the user message if there was an error using functional update
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!hasAccess) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-8">
        <div className="text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Assistant Unavailable</h2>
          <p className="text-gray-600 mb-6">
            AI Assistant access is only available for Premium, Featured, and Elite vendors.
            Upgrade your plan to unlock this powerful feature.
          </p>
          <div className="space-y-3 text-left mb-6">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <Crown className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-bold text-blue-900">Premium</div>
                <div className="text-sm text-blue-700">50 AI messages/month</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <Star className="w-6 h-6 text-purple-600" />
              <div>
                <div className="font-bold text-purple-900">Featured</div>
                <div className="text-sm text-purple-700">150 AI messages/month</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
              <Zap className="w-6 h-6 text-amber-600" />
              <div>
                <div className="font-bold text-amber-900">Elite</div>
                <div className="text-sm text-amber-700">300 AI messages/month</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowUpgradeModal(true)}
            className="w-full px-6 py-3 bg-champagne-600 hover:bg-champagne-700 text-white font-bold rounded-lg transition"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  const usagePercentage = usageStats
    ? (usageStats.current_usage / monthlyLimit) * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-md flex flex-col h-[700px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-champagne-100 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-champagne-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Assistant</h2>
              <p className="text-sm text-gray-600">Your wedding planning helper</p>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${tierInfo.bg}`}>
            <tierInfo.icon className={`w-4 h-4 ${tierInfo.color}`} />
            <span className={`text-sm font-bold ${tierInfo.color}`}>{tierInfo.name}</span>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Messages this month</span>
            <span className={`font-bold ${
              usagePercentage >= 90 ? 'text-red-600' :
              usagePercentage >= 70 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {usageStats?.current_usage || 0} / {monthlyLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                usagePercentage >= 90 ? 'bg-red-600' :
                usagePercentage >= 70 ? 'bg-orange-600' :
                'bg-green-600'
              }`}
              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
            />
          </div>
          {usageStats && (
            <div className="text-xs text-gray-500">
              Resets on {new Date(usageStats.reset_date).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">Start a Conversation</h3>
            <p className="text-gray-600 mb-4">Ask me anything about wedding planning!</p>
            <div className="grid grid-cols-1 gap-2 max-w-md mx-auto">
              <button
                onClick={() => setInputMessage('What are the most important tasks to complete 3 months before the wedding?')}
                className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition"
              >
                💍 What tasks should I prioritize 3 months out?
              </button>
              <button
                onClick={() => setInputMessage('How do I create an effective wedding timeline?')}
                className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition"
              >
                📅 Help me create a wedding timeline
              </button>
              <button
                onClick={() => setInputMessage('What are some budget-saving tips for weddings?')}
                className="p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg text-sm transition"
              >
                💰 Budget-saving tips for weddings
              </button>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-champagne-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-champagne-600" />
                </div>
              )}
              <div
                className={`max-w-[70%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-champagne-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.created_at && (
                  <div className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-champagne-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.created_at).toLocaleTimeString()}
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-champagne-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-champagne-600" />
            </div>
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-6 py-3 bg-red-50 border-t border-red-200">
          <div className="flex items-center gap-2 text-red-700 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 border-t border-gray-200">
        {usageStats && usageStats.current_usage >= monthlyLimit ? (
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <p className="text-red-700 font-medium mb-2">
              You've reached your monthly limit of {monthlyLimit} messages
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
            >
              Upgrade Plan
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about wedding planning..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 disabled:bg-gray-100"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !inputMessage.trim()}
              className="px-6 py-3 bg-champagne-600 hover:bg-champagne-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        )}
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h3>
            <p className="text-gray-600 mb-6">
              Get more AI assistance and unlock premium features
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 border-2 border-blue-500 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-6 h-6 text-blue-600" />
                  <h4 className="font-bold text-blue-900">Premium</h4>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$49<span className="text-base text-gray-500">/mo</span></div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ 50 AI messages/month</li>
                  <li>✓ Priority support</li>
                  <li>✓ All basic features</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-purple-500 rounded-lg bg-purple-50">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-6 h-6 text-purple-600" />
                  <h4 className="font-bold text-purple-900">Featured</h4>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$99<span className="text-base text-gray-500">/mo</span></div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ 150 AI messages/month</li>
                  <li>✓ Featured listing</li>
                  <li>✓ Advanced analytics</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-amber-500 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-6 h-6 text-amber-600" />
                  <h4 className="font-bold text-amber-900">Elite</h4>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">$199<span className="text-base text-gray-500">/mo</span></div>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>✓ 300 AI messages/month</li>
                  <li>✓ Top placement</li>
                  <li>✓ White-glove service</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // In production, redirect to payment/upgrade page
                  alert('Upgrade functionality would redirect to payment page');
                  setShowUpgradeModal(false);
                }}
                className="flex-1 px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition"
              >
                Choose Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
