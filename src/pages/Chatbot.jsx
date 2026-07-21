import React, { useState, useContext, useRef, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import api from '../api/axios';
import './Chatbot.css';

const suggestedQuestions = [
  'How do I submit a proposal?',
  'What does the similarity score mean?',
  'How do I choose a supervisor?',
  'What is the Project Repository?',
];

export default function Chatbot() {
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const sidebarLinks = getSidebarLinks(user?.role);

  // Auto-scroll to the latest message whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMessage = { role: 'user', text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: messageText });
      const botMessage = { role: 'bot', text: res.data.reply, source: res.data.source };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', text: "Sorry, I couldn't process that. Please try again.", source: 'error' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar links={sidebarLinks} />

      <div className="chat-content">
        <div className="chat-header">
          <h1>🤖 FYP Assistant</h1>
          <p>Ask me anything about proposals, supervisors, or the system</p>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              <h2>Hi {user?.name?.split(' ')[0]}, how can I help?</h2>
              <p>Try one of these, or type your own question below</p>
              <div className="suggested-questions">
                {suggestedQuestions.map((q) => (
                  <div key={q} className="suggested-question" onClick={() => sendMessage(q)}>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble-row ${msg.role}`}>
                  <div className={`chat-avatar ${msg.role}`}>
                    {msg.role === 'user' ? '🧑' : '🤖'}
                  </div>
                  <div>
                    <div className="chat-bubble">{msg.text}</div>
                    {msg.role === 'bot' && msg.source === 'faq' && (
                      <div className="chat-source-tag">📚 From knowledge base</div>
                    )}
                    {msg.role === 'bot' && msg.source === 'ai' && (
                      <div className="chat-source-tag">✨ AI generated</div>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="chat-bubble-row bot">
                  <div className="chat-avatar bot">🤖</div>
                  <div className="chat-bubble chat-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input-bar">
          <div className="chat-input-wrap">
            <input
              type="text"
              placeholder="Type your question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button className="chat-send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSidebarLinks(role) {
  const dashboardPath =
    role === 'student'
      ? '/student-dashboard'
      : role === 'supervisor'
      ? '/supervisor-dashboard'
      : '/admin-dashboard';

  return [
    { path: dashboardPath, label: 'Dashboard', icon: '📊' },
    { path: '/repository', label: 'Repository', icon: '📁' },
    { path: '/chatbot', label: 'Assistant', icon: '🤖' },
  ];
}