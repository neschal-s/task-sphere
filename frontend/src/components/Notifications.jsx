import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';

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

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: '#e74c3c',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 'bold'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          background: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          minWidth: '350px',
          maxHeight: '500px',
          overflowY: 'auto',
          zIndex: 1000,
          marginTop: '0.5rem'
        }}>
          <div style={{
            padding: '1rem',
            borderBottom: '1px solid #ddd',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <strong>Notifications</strong>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#2196F3',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div style={{ padding: '1rem', textAlign: 'center', color: '#999' }}>
              No notifications yet
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif._id}
                onClick={() => handleMarkAsRead(notif._id)}
                style={{
                  padding: '1rem',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  background: notif.read ? 'white' : '#f0f7ff',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => e.target.style.background = notif.read ? '#f9f9f9' : '#e8f4ff'}
                onMouseLeave={(e) => e.target.style.background = notif.read ? 'white' : '#f0f7ff'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontWeight: notif.read ? 'normal' : 'bold',
                      marginBottom: '0.25rem'
                    }}>
                      {notif.type === 'added_to_project' && '👥'}
                      {notif.type === 'new_task' && '✅'}
                      {notif.type === 'task_updated' && '📝'}
                      {' ' + notif.message}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#999' }}>
                      {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {!notif.read && (
                    <div style={{
                      width: '8px',
                      height: '8px',
                      background: '#2196F3',
                      borderRadius: '50%',
                      marginLeft: '0.5rem',
                      marginTop: '0.25rem'
                    }}></div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;
