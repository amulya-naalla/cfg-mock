import { useState } from 'react';

const LANGUAGE_NAMES = {
  ta: 'Tamil',
  hi: 'Hindi',
  te: 'Telugu',
  kn: 'Kannada',
  en: 'English',
};

export default function ParentSummaryModal({ summary, studentName, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const { en, localized, language } = summary;
  const hasLocalized = localized && language && language !== 'en';

  const handleCopy = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <span>💬</span> Share Progress with Parent
          </div>
          <button className="modal-close-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            Message for {studentName || 'student'}&rsquo;s parents (ready for WhatsApp / SMS):
          </p>

          {hasLocalized && (
            <div className="whatsapp-box">
              <div className="whatsapp-header-badge">🟢 {LANGUAGE_NAMES[language] || language}</div>
              <div className="whatsapp-text">{localized}</div>
            </div>
          )}

          <div className="whatsapp-box">
            <div className="whatsapp-header-badge">🟢 English</div>
            <div className="whatsapp-text">{en}</div>
            <div className="whatsapp-time">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={() => handleCopy(hasLocalized ? localized : en)}>
            {copied ? '✓ Copied!' : '📋 Copy Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
