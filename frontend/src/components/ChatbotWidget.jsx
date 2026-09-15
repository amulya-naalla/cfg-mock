import { useEffect, useRef, useState } from 'react';
import { LocalStore } from '../data/mockData.js';
import client from '../api/client.js';

const QUICK_PROMPTS = [
  '❓ How to solve carry-over addition?',
  '📚 Can I get more Marathi reading stories?',
  '🗓️ When is the next cluster interactive class?',
];

export default function ChatbotWidget({ activeRole = 'student', student, activeLang = 'en' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const studentId = student?._id || 'stu-101';
  const studentName = student?.name || 'Aarav Patil';

  // Load message thread
  function loadMessages() {
    client
      .get(`/api/messages?student_id=${studentId}`)
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setMessages(res.data);
        } else {
          setMessages(LocalStore.getMessages(studentId));
        }
      })
      .catch(() => {
        setMessages(LocalStore.getMessages(studentId));
      });
  }

  useEffect(() => {
    loadMessages();
    const unsub = LocalStore.subscribe(loadMessages);
    return unsub;
  }, [studentId]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  function handleSend(textToSend) {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setInputText('');
    setIsTyping(true);

    const payload = {
      student_id: studentId,
      sender: activeRole === 'educator' ? 'educator' : 'student',
      sender_name: activeRole === 'educator' ? 'Rohan Sharma (Teacher)' : studentName,
      text,
      language: activeLang,
    };

    client
      .post('/api/messages', payload)
      .then((res) => {
        setIsTyping(false);
        if (Array.isArray(res.data)) {
          setMessages(res.data);
        } else {
          loadMessages();
        }
      })
      .catch(() => {
        // Fallback to LocalStore
        LocalStore.sendMessage(payload);
        setIsTyping(false);
        loadMessages();
      });
  }

  return (
    <div className="chatbot-widget-root">
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          className="chatbot-trigger-btn"
          onClick={() => setIsOpen(true)}
          title="Open 2-Way Student-Teacher Chat"
        >
          <span className="chatbot-icon">💬</span>
          <span className="chatbot-trigger-label">Teacher Chat</span>
          <span className="chatbot-unread-dot" />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">🧑‍🏫</div>
              <div>
                <h4 className="chatbot-title">Rohan Sharma</h4>
                <span className="chatbot-subtitle">
                  🟢 Field Educator • 2-Way Chat ({activeLang.toUpperCase()})
                </span>
              </div>
            </div>
            <button
              type="button"
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          {/* Quick Prompt Pills */}
          <div className="chatbot-quick-prompts">
            {QUICK_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                className="chatbot-prompt-pill"
                onClick={() => handleSend(p)}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="chatbot-messages-body">
            {messages.map((m, idx) => {
              const isMine =
                (activeRole === 'student' && m.sender === 'student') ||
                (activeRole === 'educator' && m.sender === 'educator');
              return (
                <div
                  key={m._id || idx}
                  className={`chat-bubble-row ${isMine ? 'mine' : 'other'}`}
                >
                  <div className="chat-bubble-content">
                    <span className="chat-sender-name">{m.sender_name}</span>
                    <p className="chat-text">{m.text}</p>
                    <span className="chat-time">
                      {new Date(m.timestamp || Date.now()).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      ✓✓
                    </span>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="chat-bubble-row other">
                <div className="chat-bubble-content typing">
                  <span className="typing-dots">Teacher is typing... 💬</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer */}
          <form
            className="chatbot-footer"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              className="chatbot-input"
              placeholder="Ask your teacher a question..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="chatbot-send-btn" disabled={!inputText.trim()}>
              🚀
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
