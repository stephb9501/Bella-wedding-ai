'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, CheckCheck, MessageCircle, Calendar, DollarSign, Users, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: string;
  type: 'rsvp' | 'task' | 'message' | 'budget' | 'vendor';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  action_url?: string;
}

interface Props {
  userId: string;
  compact?: boolean;
}

export function NotificationCenter({ userId, compact = false }: Props) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [showUnreadOnly]);

  const loadNotifications = async () => {
    try {
      const url = `/api/notifications?user_id=${userId}${showUnreadOnly ? '&unread_only=true' : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load notifications');
      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification_id: notificationId, read: true }),
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);

      await Promise.all(
        unreadIds.map(id =>
          fetch('/api/notifications', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notification_id: id, read: true }),
          })
        )
      );

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.action_url) {
      router.push(notification.action_url);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'rsvp':
        return Users;
      case 'task':
        return Calendar;
      case 'message':
        return MessageCircle;
      case 'budget':
        return DollarSign;
      default:
        return Bell;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'rsvp':
        return 'bg-purple-100 text-purple-600';
      case 'task':
        return 'bg-blue-100 text-blue-600';
      case 'message':
        return 'bg-green-100 text-green-600';
      case 'budget':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const timeAgo = (dateString: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        Loading notifications...
      </div>
    );
  }

  if (compact) {
    // Compact view for dropdown/popup
    return (
      <div className="w-80">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-champagne-600 hover:text-champagne-700 font-medium"
            >
              Mark all read
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No notifications yet
            </div>
          ) : (
            notifications.slice(0, 5).map((notification) => {
              const Icon = getIcon(notification.type);
              return (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition ${
                    !notification.read ? 'bg-champagne-50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900 mb-1`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-1">{notification.message}</p>
                      <p className="text-xs text-gray-400">{timeAgo(notification.created_at)}</p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-champagne-600 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {notifications.length > 5 && (
          <div className="p-3 border-t border-gray-200 text-center">
            <button
              onClick={() => router.push('/notifications')}
              className="text-sm text-champagne-600 hover:text-champagne-700 font-medium"
            >
              View all notifications
            </button>
          </div>
        )}
      </div>
    );
  }

  // Full page view
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
          {unreadCount > 0 && (
            <span className="bg-champagne-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="w-4 h-4 text-champagne-600 rounded"
            />
            Unread only
          </label>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-champagne-600 hover:bg-champagne-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
          )}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
          <p className="text-gray-600">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => {
            const Icon = getIcon(notification.type);
            return (
              <button
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`w-full bg-white rounded-lg p-4 text-left hover:shadow-md transition border ${
                  !notification.read ? 'border-champagne-200 bg-champagne-50' : 'border-gray-200'
                }`}
              >
                <div className="flex gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${getIconColor(notification.type)}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className={`${!notification.read ? 'font-bold' : 'font-semibold'} text-gray-900`}>
                        {notification.title}
                      </p>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {timeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    {notification.action_url && (
                      <span className="text-sm text-champagne-600 font-medium">
                        View details →
                      </span>
                    )}
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Mark as read"
                      >
                        <Check className="w-5 h-5 text-gray-400" />
                      </button>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
