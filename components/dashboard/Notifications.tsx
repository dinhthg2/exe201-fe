'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Bell, Heart, DollarSign, TrendingUp, MessageCircle, Check, X, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Notification {
  id: number;
  type: 'match' | 'payment' | 'progress' | 'message' | 'system';
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

interface NotificationsProps {
  limit?: number;
}

const Notifications: React.FC<NotificationsProps> = ({ limit }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'match' | 'payment' | 'progress' | 'message'>('all');
  const [markingAsRead, setMarkingAsRead] = useState<number | null>(null);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const queryParams = new URLSearchParams();
      if (filter !== 'all') queryParams.append('type', filter);
      if (limit) queryParams.append('limit', limit.toString());

      const response = await fetch(`/api/dashboard/notifications?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const result = await response.json();
      if (result.success) {
        setNotifications(result.data);
      } else {
        throw new Error(result.message || 'Failed to load notifications');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [router, filter, limit]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (notificationId: number) => {
    try {
      setMarkingAsRead(notificationId);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/dashboard/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setNotifications(prev =>
          prev.map(notification =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      } else {
        throw new Error(result.message || 'Failed to mark as read');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    } finally {
      setMarkingAsRead(null);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      
      await Promise.all(
        unreadNotifications.map(notification => markAsRead(notification.id))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'match':
        return <Heart className="h-5 w-5 text-red-500" />;
      case 'payment':
        return <DollarSign className="h-5 w-5 text-green-500" />;
      case 'progress':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <MessageCircle className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'match':
        return 'bg-red-50 border-red-200';
      case 'payment':
        return 'bg-green-50 border-green-200';
      case 'progress':
        return 'bg-blue-50 border-blue-200';
      case 'message':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = (now.getTime() - date.getTime()) / (1000 * 60);

    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${Math.floor(diffInMinutes)} phút trước`;
    } else if (diffInMinutes < 1440) { // 24 hours
      return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getFilterCounts = () => {
    const all = notifications.length;
    const match = notifications.filter(n => n.type === 'match').length;
    const payment = notifications.filter(n => n.type === 'payment').length;
    const progress = notifications.filter(n => n.type === 'progress').length;
    const message = notifications.filter(n => n.type === 'message').length;
    
    return { all, match, payment, progress, message };
  };

  const counts = getFilterCounts();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Lỗi: {error}</p>
          <button
            onClick={fetchNotifications}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
              {unreadCount} mới
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      {!limit && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Tất cả ({counts.all})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter('match')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'match'
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Heart className="h-4 w-4" />
              <span>Match ({counts.match})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter('payment')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'payment'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <span>Thanh toán ({counts.payment})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter('progress')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'progress'
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Tiến độ ({counts.progress})</span>
            </div>
          </button>
          <button
            onClick={() => setFilter('message')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === 'message'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Tin nhắn ({counts.message})</span>
            </div>
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                notification.read
                  ? 'bg-white border-gray-200 hover:bg-gray-50'
                  : `${getNotificationColor(notification.type)} hover:opacity-75`
              }`}
              onClick={() => !notification.read && markAsRead(notification.id)}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${
                    notification.read ? 'text-gray-600' : 'text-gray-900 font-medium'
                  }`}>
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">
                      {formatTime(notification.created_at)}
                    </p>
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        disabled={markingAsRead === notification.id}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 flex items-center space-x-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>Đánh dấu đã đọc</span>
                      </button>
                    )}
                  </div>
                </div>
                {!notification.read && (
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'Chưa có thông báo nào' : `Không có thông báo ${filter}`}
            </h3>
            <p className="text-gray-500">
              {filter === 'all' 
                ? 'Khi có hoạt động mới, thông báo sẽ xuất hiện ở đây'
                : `Chưa có thông báo loại ${filter} nào`
              }
            </p>
          </div>
        )}
      </div>

      {/* Load More (if not using limit) */}
      {!limit && filteredNotifications.length >= 20 && (
        <div className="text-center mt-6">
          <button
            onClick={fetchNotifications}
            className="px-6 py-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            Tải thêm
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;