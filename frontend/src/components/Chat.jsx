import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';

const Chat = ({ projectId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
    // Refresh messages every 3 seconds for real-time effect
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/chat/${projectId}`);
      setMessages(res.data.messages);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load messages');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await axios.post('/api/chat', {
        projectId,
        message: newMessage
      });
      setNewMessage('');
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  return (
    <section style={{
      marginTop: '2rem',
      padding: '1rem',
      background: '#f9f9f9',
      borderRadius: '8px',
      border: '1px solid #ddd'
    }}>
      <h2>💬 Project Chat</h2>
      
      {loading ? (
        <div>Loading messages...</div>
      ) : (
        <>
          <div style={{
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            padding: '1rem',
            height: '300px',
            overflowY: 'auto',
            marginBottom: '1rem'
          }}>
            {messages.length === 0 ? (
              <div style={{ color: '#999', textAlign: 'center' }}>No messages yet. Start the conversation!</div>
            ) : (
              messages.map(msg => (
                <div key={msg._id} style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  background: msg.userId._id === user?.id ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${msg.userId._id === user?.id ? '#2196F3' : '#999'}`
                }}>
                  <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                    {msg.userId.name}
                  </div>
                  <div style={{ fontSize: '0.9rem' }}>
                    {msg.message}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#999', marginTop: '0.25rem' }}>
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} style={{
            display: 'flex',
            gap: '0.5rem'
          }}>
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              style={{
                flex: 1,
                padding: '0.75rem',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
              maxLength={1000}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                background: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Send
            </button>
          </form>
        </>
      )}
    </section>
  );
};

export default Chat;
