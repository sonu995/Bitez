import React, { useState, useEffect } from 'react';
import { X, Bell, Clock, Package, Wallet, Star } from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'wallet' | 'subscription' | 'general';
  title: string;
  message: string;
  time: string;
  read: boolean;
  icon?: React.ReactNode;
}

const NotificationSystem: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Order Delivered',
      message: 'Your order #ORD001 from Bitez Kitchen has been delivered successfully.',
      time: '2 mins ago',
      read: false,
      icon: <Package className="w-5 h-5 text-emerald-600" />
    },
    {
      id: '2',
      type: 'subscription',
      title: 'Meal Plan Expiring Soon',
      message: 'Your Monthly Standard plan will expire in 3 days. Renew to continue uninterrupted meals.',
      time: '1 hour ago',
      read: false,
      icon: <Clock className="w-5 h-5 text-amber-600" />
    },
    {
      id: '3',
      type: 'wallet',
      title: 'Low Wallet Balance',
      message: 'Your wallet balance is ₹50. Recharge to avoid order checkout interruptions.',
      time: '3 hours ago',
      read: true,
      icon: <Wallet className="w-5 h-5 text-rose-600" />
    },
    {
      id: '4',
      type: 'general',
      title: 'Rate Your Recent Order',
      message: 'How was your experience with Bitez? Share your feedback to help us serve better.',
      time: '1 day ago',
      read: true,
      icon: <Star className="w-5 h-5 text-orange-600" />
    }
  ]);

  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.notifications-panel') && !target.closest('.notifications-trigger')) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="notifications-trigger p-2 text-slate-600 hover:text-slate-900 relative rounded-xl hover:bg-slate-100 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="notifications-panel absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-orange-600 hover:text-orange-700 font-bold"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-sm font-medium">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-orange-50/40 border-l-4 border-l-orange-500' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 mt-0.5 p-2 rounded-xl ${
                        notification.type === 'order' ? 'bg-emerald-50' :
                        notification.type === 'subscription' ? 'bg-amber-50' :
                        notification.type === 'wallet' ? 'bg-rose-50' :
                        'bg-orange-50'
                      }`}>
                        {notification.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {notification.title}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNotification(notification.id);
                            }}
                            className="ml-2 text-slate-400 hover:text-slate-600 p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                          {notification.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-slate-200 bg-slate-50 text-center">
              <button className="text-xs text-orange-600 hover:text-orange-700 font-bold">
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationSystem;