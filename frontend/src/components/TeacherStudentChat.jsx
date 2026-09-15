/**
 * Teacher-Student Real-time Chatbot & Direct Messaging Widget.
 * Enables direct communication between Educators, Students, and Parents.
 * Features message persistence, quick prompts, and intelligent educator assistant stubs.
 */

import { useState, useEffect, useRef } from 'react';
import { LocalStore, LANG_LABELS } from '../data/mockData.js';
import { getCurrentStudent } from '../utils/student.js';
import { EDUCATOR_PROFILE } from '../config.js';

const QUICK_PROMPTS = [
  '💡 Sir, can you help me with Math carry-over problems?',
  '📅 When is our next learning session?',
  '📚 Can you assign more Marathi storybooks?',
  '🌟 I completed my daily weekly goal!',
];

export default function TeacherStudentChat({ activeRole = 'student', studentOverride = null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const activeStudent = studentOverride || getCurrentStudent();
  const studentId = activeStudent?._id || 'stu-101';
  
  const [messages, setMessages] = useState(() => LocalStore.getChatMessages(studentId));
  const messagesEndRef = useRef(null);

  // Sync messages with LocalStore events
  function refreshMessages() {
    setMessages(LocalStore.getChatMessages(studentId));
  }

  useEffect(() => {
    refreshMessages();
    const unsub = LocalStore.subscribe(() => refreshMessages());
    return unsub;
  }, [studentId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const senderRole = activeRole === 'educator' ? 'educator' : 'student';

  function sendMessage(textToSend) {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    LocalStore.sendChatMessage({
      student_id: studentId,
      sender: senderRole,
      text,
    });
    setInputText('');

    // If sent by student, simulate automated encouraging teacher response
    if (senderRole === 'student') {
      setTimeout(() => {
        let replyText = `Great question ${activeStudent?.name?.split(' ')[0] || ''}! I've logged your message and will review your practice scores shortly. Keep up the awesome work! 🌟`;
        
        if (text.toLowerCase().includes('math')) {
          replyText = `I noticed your message about Math! Practice pack "Addition & Subtraction" is open for you. Try Question 2 again! 👍`;
        } else if (text.toLowerCase().includes('session') || text.toLowerCase().includes('when')) {
          replyText = `Our next interactive cluster session is scheduled for Thursday at 4:00 PM at Cluster Center North-2. 📅`;
        } else if (text.toLowerCase().includes('story') || text.toLowerCase().includes('marathi') || text.toLowerCase().includes('tamil')) {
          replyText = `I've just added 2 new bilingual reading stories to your library! Check your "Recommended For You" section. 📖`;
        }

        LocalStore.sendChatMessage({
          student_id: studentId,
          sender: 'educator',
          text: replyText,
        });
      }, 1200);
    }
  }

  return (
    <div className="teacher-chat-widget">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          type="button"
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          title="Open Teacher & Student Chat"
        >
          <span className="chat-toggle-icon">💬</span>
          <span className="chat-toggle-text">
            {activeRole === 'educator' ? 'Student Chat' : 'Teacher Chat'}
          </span>
          <span className="chat-unread-dot" />
        </button>
      )}

      {/* Floating Chat Drawer Window */}
      {isOpen && (
        <div className="chat-drawer-container">
          {/* Header */}
          <div className="chat-drawer-header">
            <div className="chat-header-user">
              <div className="chat-avatar">
                {activeRole === 'educator' ? 'AP' : 'RS'}
              </div>
              <div className="chat-header-info">
                <span className="chat-user-name">
                  {activeRole === 'educator' ? activeStudent?.name : EDUCATOR_PROFILE.name}
                </span>
                <span className="chat-user-status">
                  🟢 {activeRole === 'educator' ? `Student • Grade ${activeStudent?.grade || 3}` : 'Community Field Educator'}
                </span>
              </div>
            </div>
            <button
              type="button"
              className="chat-close-btn"
              onClick={() => setIsOpen(false)}
              title="Close chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Container */}
          <div className="chat-messages-box" ref={messagesEndRef}>
            <div className="chat-welcome-banner">
              🔒 Direct & Encrypted Channel between <strong>{EDUCATOR_PROFILE.name}</strong> and <strong>{activeStudent?.name}</strong>.
            </div>

            {messages.map((m) => {
              const isMe = m.sender === senderRole;
              return (
                <div
                  key={m._id}
                  className={`chat-bubble-row ${isMe ? 'is-me' : 'is-other'}`}
                >
                  <div className="chat-bubble">
                    <div className="chat-sender-label">
                      {m.sender === 'educator' ? `🧑‍🏫 ${EDUCATOR_PROFILE.name}` : `🎒 ${activeStudent?.name?.split(' ')[0] || 'Student'}`}
                    </div>
                    <div className="chat-bubble-text">{m.text}</div>
                    <div className="chat-bubble-time">{m.timestamp}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Prompts for Student */}
          {activeRole === 'student' && (
            <div className="chat-quick-prompts">
              {QUICK_PROMPTS.map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  className="quick-prompt-chip"
                  onClick={() => sendMessage(prompt.replace(/^[^a-zA-Z0-9]+/, ''))}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            className="chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              className="chat-input"
              placeholder={activeRole === 'educator' ? `Message ${activeStudent?.name}...` : 'Ask your teacher a question...'}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              className="btn-primary chat-send-btn"
              disabled={!inputText.trim()}
            >
              Send 🚀
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
