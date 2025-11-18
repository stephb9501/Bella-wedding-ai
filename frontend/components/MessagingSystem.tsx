'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2 } from 'lucide-react';

interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  sender_type: 'bride' | 'vendor';
  message: string;
  read: boolean;
  created_at: string;
}

interface MessagingSystemProps {
  bookingId: string;
  currentUserId: string;
  currentUserType: 'bride' | 'vendor';
  recipientName: string;
  recipientType: 'bride' | 'vendor';
  onClose?: () => void;
  minimizable?: boolean;
}

export function MessagingSystem({
  bookingId,
  currentUserId,
  currentUserType,
  recipientName,
  recipientType,
  onClose,
  minimizable = false,
}: MessagingSystemProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [bookingId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?booking_id=${bookingId}&user_id=${currentUserId}`);
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_id: bookingId,
          sender_id: currentUserId,
          sender_type: currentUserType,
          message: newMessage.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send message');
      }

      setNewMessage('');
      await fetchMessages();
    } catch (error: any) {
      alert(error.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const unreadCount = messages.filter(
    m => m.sender_type !== currentUserType && !m.read
  ).length;

  if (minimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setMinimized(false)}
          className="bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 text-white rounded-full p-4 shadow-2xl flex items-center gap-3 transition"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-bold">Chat with {recipientName}</span>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-champagne-400 to-rose-400 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">{recipientName}</h3>
            <p className="text-xs text-champagne-50 capitalize">{recipientType}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {minimizable && (
            <button
              onClick={() => setMinimized(true)}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <Minimize2 className="w-4 h-4 text-white" />
            </button>
          )}
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {loading ? (
          <div className="text-center py-12">
            <MessageCircle className="w-8 h-8 text-champagne-600 animate-pulse mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No messages yet</p>
            <p className="text-gray-400 text-sm mt-1">Start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map(msg => {
              const isCurrentUser = msg.sender_type === currentUserType;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-champagne-400 to-rose-400 text-white'
                        : 'bg-white text-gray-900 border border-gray-200'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-champagne-50' : 'text-gray-500'
                      }`}
                    >
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
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-champagne-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-5 py-3 bg-gradient-to-r from-champagne-400 to-rose-400 hover:from-champagne-500 hover:to-rose-500 disabled:from-gray-300 disabled:to-gray-300 text-white rounded-xl transition flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}

export function MessagingButton({
  onClick,
  unreadCount = 0,
}: {
  onClick: () => void;
  unreadCount?: number;
}) {
  return (
    <button
      onClick={onClick}
      className="relative px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white font-medium rounded-lg transition flex items-center gap-2"
    >
      <MessageCircle className="w-5 h-5" />
      <span>Messages</span>
      {unreadCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  );
}
