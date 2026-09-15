import { useState } from 'react';

export default function ParentSummaryModal({ summary, studentName, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!summary) return null;

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(summary).then(() => {
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
            Localized message for {studentName || 'student'}'s parents (ready for WhatsApp / SMS):
          </p>

          <div className="whatsapp-box">
            <div className="whatsapp-header-badge">🟢 WhatsApp Message Preview</div>
            <div className="whatsapp-text">{summary}</div>
            <div className="whatsapp-time">
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="btn-primary" onClick={handleCopy}>
            {copied ? '✓ Copied!' : '📋 Copy Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
