'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import AuthWall from '@/components/AuthWall';
import {
  Heart, Search, Send, MoreVertical, Phone, Mail, Star, MapPin,
  CheckCheck, Check, Clock, MessageCircle, ArrowLeft
} from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  sender_type: 'bride' | 'vendor';
  message_text: string;
  sent_at: string;
  read: boolean;
}

interface Conversation {
  id: string;
  vendor_id: string;
  vendor_name: string;
  vendor_category: string;
  vendor_city: string;
  vendor_rating: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  vendor_online: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedConversation?.messages]);

  const loadConversations = () => {
    // Mock conversations for demo
    const mockConversations: Conversation[] = [
      {
        id: '1',
        vendor_id: 'v1',
        vendor_name: "Sarah's Photography Studio",
        vendor_category: 'Photography',
        vendor_city: 'Los Angeles, CA',
        vendor_rating: 4.8,
        last_message: "I'd love to chat more about your wedding vision!",
        last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
        unread_count: 2,
        vendor_online: true,
        messages: [
          {
            id: 'm1',
            sender_type: 'bride',
            message_text: "Hi Sarah! I'm interested in your photography services for my wedding on June 15th, 2025.",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            read: true
          },
          {
            id: 'm2',
            sender_type: 'vendor',
            message_text: "Hi! Thank you so much for reaching out! Congratulations on your upcoming wedding! I'd love to hear more about your vision and what you're looking for in a photographer.",
            sent_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), // 1.5 hours ago
            read: true
          },
          {
            id: 'm3',
            sender_type: 'bride',
            message_text: "We're planning a garden ceremony at the Grand Estate Gardens. We love your natural, candid style! Do you have availability for that date?",
            sent_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
            read: true
          },
          {
            id: 'm4',
            sender_type: 'vendor',
            message_text: "Wonderful! The Grand Estate Gardens is absolutely beautiful. Yes, June 15th is available! I'd love to set up a call to discuss your package options and answer any questions. What times work best for you this week?",
            sent_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 min ago
            read: true
          },
          {
            id: 'm5',
            sender_type: 'vendor',
            message_text: "I'd love to chat more about your wedding vision!",
            sent_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
            read: false
          }
        ]
      },
      {
        id: '2',
        vendor_id: 'v2',
        vendor_name: 'Elegant Blooms Floristry',
        vendor_category: 'Florist',
        vendor_city: 'Pasadena, CA',
        vendor_rating: 4.9,
        last_message: "Here are some bouquet ideas for your garden theme!",
        last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        unread_count: 0,
        vendor_online: false,
        messages: [
          {
            id: 'm6',
            sender_type: 'bride',
            message_text: "Hi! I saw your beautiful work and I'm interested in floral arrangements for my June wedding.",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true
          },
          {
            id: 'm7',
            sender_type: 'vendor',
            message_text: "Thank you for reaching out! I'd love to help make your day beautiful. What's your color palette and overall theme?",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
            read: true
          },
          {
            id: 'm8',
            sender_type: 'bride',
            message_text: "We're going with blush pink, ivory, and gold for a romantic garden theme.",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
            read: true
          },
          {
            id: 'm9',
            sender_type: 'vendor',
            message_text: "Here are some bouquet ideas for your garden theme!",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
            read: true
          }
        ]
      },
      {
        id: '3',
        vendor_id: 'v3',
        vendor_name: 'Sweet Celebrations Cakes',
        vendor_category: 'Cake',
        vendor_city: 'Santa Monica, CA',
        vendor_rating: 5.0,
        last_message: "Can you send me a photo of your venue?",
        last_message_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        unread_count: 1,
        vendor_online: false,
        messages: [
          {
            id: 'm10',
            sender_type: 'bride',
            message_text: "Hello! I'm looking for a 3-tier wedding cake for about 150 guests.",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            read: true
          },
          {
            id: 'm11',
            sender_type: 'vendor',
            message_text: "Wonderful! I have lots of beautiful designs for 3-tier cakes. Do you have any flavor preferences or design inspiration?",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2.5).toISOString(),
            read: true
          },
          {
            id: 'm12',
            sender_type: 'vendor',
            message_text: "Can you send me a photo of your venue?",
            sent_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            read: false
          }
        ]
      }
    ];

    setConversations(mockConversations);
    if (!selectedConversation && mockConversations.length > 0) {
      setSelectedConversation(mockConversations[0]);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: `m${Date.now()}`,
      sender_type: 'bride',
      message_text: messageInput,
      sent_at: new Date().toISOString(),
      read: false
    };

    setConversations(conversations.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          last_message: messageInput,
          last_message_at: new Date().toISOString()
        };
      }
      return conv;
    }));

    setSelectedConversation({
      ...selectedConversation,
      messages: [...selectedConversation.messages, newMessage],
      last_message: messageInput,
      last_message_at: new Date().toISOString()
    });

    setMessageInput('');

    // Mock vendor response after 2 seconds
    setTimeout(() => {
      const vendorResponse: Message = {
        id: `m${Date.now()}`,
        sender_type: 'vendor',
        message_text: "Thanks for your message! I'll get back to you shortly with more details.",
        sent_at: new Date().toISOString(),
        read: false
      };

      setConversations(conversations.map(conv => {
        if (conv.id === selectedConversation.id) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage, vendorResponse],
            last_message: vendorResponse.message_text,
            last_message_at: new Date().toISOString(),
            unread_count: conv.unread_count + 1
          };
        }
        return conv;
      }));

      if (selectedConversation) {
        setSelectedConversation({
          ...selectedConversation,
          messages: [...selectedConversation.messages, newMessage, vendorResponse],
          last_message: vendorResponse.message_text,
          last_message_at: new Date().toISOString()
        });
      }
    }, 2000);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv =>
    searchQuery === '' ||
    conv.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.vendor_category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50 flex items-center justify-center">
        <Heart className="w-12 h-12 text-champagne-600 animate-pulse" />
      </div>
    );
  }

  // Show AuthWall if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthWall
        featureName="Vendor Messaging"
        previewContent={
          <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="text-center mb-12">
              <MessageCircle className="w-16 h-16 text-champagne-600 mx-auto mb-4" />
              <h2 className="text-3xl font-serif text-champagne-900 mb-4">Message Vendors Directly</h2>
              <p className="text-champagne-700 max-w-2xl mx-auto">
                Connect with wedding vendors through our secure messaging system. Ask questions, share details, and book your perfect team.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Send className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Direct Communication</h3>
                <p className="text-sm text-champagne-600">Message vendors instantly</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <CheckCheck className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Read Receipts</h3>
                <p className="text-sm text-champagne-600">See when vendors read your messages</p>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <Clock className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                <h3 className="font-semibold text-champagne-900 mb-2">Message History</h3>
                <p className="text-sm text-champagne-600">All conversations in one place</p>
              </div>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-champagne-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8 text-champagne-600" />
            <h1 className="text-4xl font-serif text-champagne-900">Messages</h1>
          </div>
          <p className="text-champagne-700">Connect with your wedding vendors</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '75vh' }}>
              {/* Search */}
              <div className="p-4 border-b border-champagne-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-champagne-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search conversations..."
                    className="w-full pl-10 pr-4 py-2 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                  />
                </div>
              </div>

              {/* Conversation List */}
              <div className="overflow-y-auto" style={{ height: 'calc(75vh - 80px)' }}>
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center text-champagne-600">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-champagne-400" />
                    <p>No conversations yet</p>
                    <p className="text-sm mt-2">Browse vendors and send a message!</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 border-b border-champagne-200 hover:bg-champagne-50 transition-colors text-left ${
                        selectedConversation?.id === conv.id ? 'bg-champagne-100' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-champagne-900">{conv.vendor_name}</h3>
                            {conv.vendor_online && (
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            )}
                          </div>
                          <div className="text-xs text-champagne-600 flex items-center gap-2">
                            <span>{conv.vendor_category}</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{conv.vendor_rating}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-xs text-champagne-500">{getTimeAgo(conv.last_message_at)}</span>
                          {conv.unread_count > 0 && (
                            <div className="mt-1 w-5 h-5 bg-champagne-600 text-white text-xs rounded-full flex items-center justify-center">
                              {conv.unread_count}
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-champagne-700 line-clamp-2">{conv.last_message}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col" style={{ height: '75vh' }}>
                {/* Chat Header */}
                <div className="p-4 border-b border-champagne-200 bg-champagne-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedConversation(null)}
                        className="lg:hidden"
                      >
                        <ArrowLeft className="w-5 h-5 text-champagne-700" />
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-semibold text-champagne-900">{selectedConversation.vendor_name}</h2>
                          {selectedConversation.vendor_online && (
                            <div className="flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                              Online
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-champagne-600">
                          <span>{selectedConversation.vendor_category}</span>
                          <span>•</span>
                          <MapPin className="w-3 h-3" />
                          <span>{selectedConversation.vendor_city}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/vendors/${selectedConversation.vendor_id}`)}
                        className="px-3 py-1.5 border border-champagne-300 text-champagne-700 rounded-lg text-sm font-medium hover:bg-champagne-50"
                      >
                        View Profile
                      </button>
                      <button className="p-2 hover:bg-champagne-100 rounded-lg">
                        <MoreVertical className="w-5 h-5 text-champagne-600" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'bride' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                          message.sender_type === 'bride'
                            ? 'bg-champagne-600 text-white'
                            : 'bg-gray-100 text-champagne-900'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          message.sender_type === 'bride' ? 'text-champagne-200 justify-end' : 'text-champagne-500'
                        }`}>
                          <span>{getTimeAgo(message.sent_at)}</span>
                          {message.sender_type === 'bride' && (
                            message.read ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-champagne-200 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-champagne-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim()}
                      className="px-6 py-3 bg-champagne-600 text-white rounded-lg hover:bg-champagne-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg flex items-center justify-center" style={{ height: '75vh' }}>
                <div className="text-center text-champagne-600">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-champagne-400" />
                  <p className="text-lg">Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
