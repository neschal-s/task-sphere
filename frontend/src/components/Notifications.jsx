import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Button from './Button';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/api/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Failed to load notifications');
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await axios.get('/api/notifications/count/unread');
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error('Failed to load unread count');
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.patch(`/api/notifications/${notificationId}/read`);
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.patch('/api/notifications/read-all');
      fetchNotifications();
      fetchUnreadCount();
    } catch (err) {
      console.error('Failed to mark all as read');
    }
  };

  const getNotificationStyles = (type) => {
    const styles = {
      added_to_project: { icon: '👥', bg: 'from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20', border: 'border-blue-200/50 dark:border-blue-800/30' },
      new_task: { icon: '✅', bg: 'from-emerald-50/50 to-cyan-50/50 dark:from-emerald-900/20 dark:to-cyan-900/20', border: 'border-emerald-200/50 dark:border-emerald-800/30' },
      task_updated: { icon: '📝', bg: 'from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20', border: 'border-orange-200/50 dark:border-orange-800/30' },
      status_change_request: { icon: '⏳', bg: 'from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20', border: 'border-amber-200/50 dark:border-amber-800/30' },
      status_change_approved: { icon: '✓', bg: 'from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20', border: 'border-emerald-200/50 dark:border-emerald-800/30' },
      status_change_rejected: { icon: '✗', bg: 'from-rose-50/50 to-red-50/50 dark:from-rose-900/20 dark:to-red-900/20', border: 'border-rose-200/50 dark:border-rose-800/30' }
    };
    return styles[type] || styles.new_task;
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
        title="Notifications"
      >
        <span className="text-2xl">🔔</span>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-6 h-6 flex items-center justify-center bg-gradient-to-r from-rose-400 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-96 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-2xl z-50 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="sticky top-0 px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm flex justify-between items-center">
            <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm text-slate-600 dark:text-slate-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const style = getNotificationStyles(notif.type);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleMarkAsRead(notif._id)}
                    className={`
                      px-6 py-4 border-b border-slate-100/50 dark:border-slate-700/30 cursor-pointer
                      transition-all duration-200 hover:bg-slate-50/50 dark:hover:bg-slate-700/50
                      ${!notif.read ? 'bg-gradient-to-r ' + style.bg : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-2xl">{style.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'} text-slate-900 dark:text-white`}>
                          {notif.message}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {new Date(notif.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="flex-shrink-0 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-lg mt-1.5"></div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
