import React, { useState, useEffect, useContext } from 'react';
import axios from '../utils/axiosConfig';
import { AuthContext } from '../context/AuthContext';
import Card from './Card';
import Skeleton from './Skeleton';

const Chat = ({ projectId }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef(null);

  useEffect(() => {
    fetchMessages();
    // Refresh messages every 3 seconds for real-time effect
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [projectId]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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

    const optimisticMessage = {
      _id: Date.now(),
      userId: { _id: user?.id, name: user?.name },
      message: newMessage,
      createdAt: new Date().toISOString()
    };
    
    setMessages([...messages, optimisticMessage]);
    setNewMessage('');

    try {
      await axios.post('/api/chat', {
        projectId,
        message: newMessage
      });
      fetchMessages();
    } catch (err) {
      console.error('Failed to send message');
    }
  };

  return (
    <Card className="bg-white/60 dark:bg-slate-800/60 p-0 overflow-hidden flex flex-col h-96">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200/50 dark:border-slate-700/50 bg-gradient-to-r from-slate-50/50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
          Project Chat
        </h3>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-slate-50/50 dark:to-slate-800/50">
        {loading ? (
          <Skeleton count={3} height="h-16" className="mb-3" />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg._id}
              className={`flex ${msg.userId._id === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`
                  max-w-xs px-4 py-3 rounded-2xl
                  ${msg.userId._id === user?.id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white rounded-br-none'
                    : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 text-slate-900 dark:text-white rounded-bl-none'
                  }
                  shadow-sm
                `}
              >
                {msg.userId._id !== user?.id && (
                  <p className="text-xs font-bold opacity-75 mb-1">
                    {msg.userId.name}
                  </p>
                )}
                <p className="text-sm">{msg.message}</p>
                <p className={`text-xs mt-1 ${
                  msg.userId._id === user?.id
                    ? 'text-blue-100'
                    : 'text-slate-600 dark:text-slate-400'
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="px-6 py-4 border-t border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            type="text"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            maxLength={1000}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-50/50 dark:bg-slate-700/50 border-2 border-slate-200 dark:border-slate-600 focus:border-cyan-400 dark:focus:border-cyan-400 focus:outline-none text-sm focus:ring-2 focus:ring-cyan-200/50 dark:focus:ring-cyan-600/30 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold text-sm hover:shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
          >
            Send
          </button>
        </form>
      </div>
    </Card>
  );
};

export default Chat;
