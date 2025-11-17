'use client';

import { useState, useEffect, useRef } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { MessageCircle, Send, User, Clock } from 'lucide-react';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'bride' | 'vendor';
  message_text: string;
  read: boolean;
  created_at: string;
}

interface Conversation {
  id: string;
  bride_id: string;
  vendor_id: string;
  bride_name: string;
  vendor_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

interface Props {
  userId: string;
  userType: 'bride' | 'vendor';
}

export function MessagingInbox({ userId, userType }: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchConversations();

    // Subscribe to real-time message updates
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMsg = payload.new as Message;

          // If message is for current conversation, add it to messages
          if (selectedConversation && newMsg.conversation_id === selectedConversation) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();

            // Mark as read if we're the recipient
            if (newMsg.sender_type !== userType) {
              markAsRead(newMsg.id);
            }
          }

          // Update conversations list
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversation, userType]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch(`/api/messages/conversations?user_id=${userId}&user_type=${userType}`);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data || []);
    } catch (err) {
      console.error('Conversations fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages?conversation_id=${conversationId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data || []);

      // Mark unread messages as read
      data.forEach((msg: Message) => {
        if (!msg.read && msg.sender_type !== userType) {
          markAsRead(msg.id);
        }
      });
    } catch (err) {
      console.error('Messages fetch error:', err);
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await fetch('/api/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId }),
      });
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: selectedConversation,
          sender_id: userId,
          sender_type: userType,
          message_text: newMessage.trim(),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const sentMessage = await response.json();
      setMessages((prev) => [...prev, sentMessage]);
      setNewMessage('');
      fetchConversations(); // Update last message in conversations
    } catch (err) {
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md h-[600px] flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Messages
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv.id)}
                className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                  selectedConversation === conv.id ? 'bg-champagne-50 border-l-4 border-l-champagne-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <div className="font-medium text-gray-900 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {userType === 'bride' ? conv.vendor_name : conv.bride_name}
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">{conv.last_message}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(conv.last_message_time).toLocaleString()}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <h4 className="font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                {userType === 'bride' ? selectedConv.vendor_name : selectedConv.bride_name}
              </h4>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => {
                const isMine = msg.sender_type === userType;
                return (
                  <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        isMine
                          ? 'bg-champagne-500 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.message_text}</p>
                      <p className={`text-xs mt-1 ${isMine ? 'text-champagne-100' : 'text-gray-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-champagne-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className="px-6 py-2 bg-champagne-600 hover:bg-champagne-700 disabled:bg-gray-300 text-white rounded-lg transition flex items-center gap-2 font-medium"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
