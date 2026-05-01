import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import Button from './Button';

const Notifications = () => {
  const { user } = useContext(AuthContext);
  const { isDark } = useContext(ThemeContext);
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
      added_to_project: { icon: '+', bg: 'from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20', border: 'border-blue-200/50 dark:border-blue-800/30' },
      new_task: { icon: '✓', bg: 'from-emerald-50/50 to-cyan-50/50 dark:from-emerald-900/20 dark:to-cyan-900/20', border: 'border-emerald-200/50 dark:border-emerald-800/30' },
      task_updated: { icon: '•', bg: 'from-orange-50/50 to-amber-50/50 dark:from-orange-900/20 dark:to-amber-900/20', border: 'border-orange-200/50 dark:border-orange-800/30' },
      status_change_request: { icon: '↻', bg: 'from-amber-50/50 to-orange-50/50 dark:from-amber-900/20 dark:to-orange-900/20', border: 'border-amber-200/50 dark:border-amber-800/30' },
      status_change_approved: { icon: '✓', bg: 'from-emerald-50/50 to-green-50/50 dark:from-emerald-900/20 dark:to-green-900/20', border: 'border-emerald-200/50 dark:border-emerald-800/30' },
      status_change_rejected: { icon: '✕', bg: 'from-rose-50/50 to-red-50/50 dark:from-rose-900/20 dark:to-red-900/20', border: 'border-rose-200/50 dark:border-rose-800/30' }
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
        <svg className={`w-6 h-6 ${isDark ? 'text-slate-200' : 'text-slate-700'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5" />
          <path d="M10 17a2 2 0 0 0 4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 min-w-6 h-6 flex items-center justify-center bg-linear-to-r from-rose-400 to-red-500 text-white text-xs font-bold rounded-full shadow-lg animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className={`absolute top-full right-0 mt-2 w-96 max-h-96 backdrop-blur-md rounded-2xl border shadow-2xl z-50 overflow-hidden flex flex-col ${isDark ? 'bg-slate-800/95 border-slate-700/30' : 'bg-white/95 border-slate-200/60'}`}>
          {/* Header */}
          <div className={`sticky top-0 px-6 py-4 border-b backdrop-blur-sm flex justify-between items-center ${isDark ? 'border-slate-700/50 bg-slate-800/50' : 'border-slate-200/70 bg-white/70'}`}>
            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className={`text-xs font-semibold transition-colors ${isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-cyan-700 hover:text-cyan-800'}`}
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>No notifications yet</p>
              </div>
            ) : (
              notifications.map(notif => {
                const style = getNotificationStyles(notif.type);
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleMarkAsRead(notif._id)}
                    className={`
                      px-6 py-4 border-b cursor-pointer
                      transition-all duration-200
                      ${isDark ? 'border-slate-700/30 hover:bg-slate-700/50' : 'border-slate-100/70 hover:bg-slate-50/80'}
                      ${!notif.read ? 'bg-linear-to-r ' + style.bg : ''}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${isDark ? 'bg-slate-700 text-slate-100' : 'bg-slate-100 text-slate-700'}`}>{style.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notif.read ? 'font-bold' : 'font-medium'} ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {notif.message}
                        </p>
                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                          {new Date(notif.createdAt).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {!notif.read && (
                        <div className="shrink-0 w-2.5 h-2.5 rounded-full bg-linear-to-r from-cyan-400 to-blue-500 shadow-lg mt-1.5"></div>
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
