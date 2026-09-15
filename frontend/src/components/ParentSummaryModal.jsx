import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function ParentSummaryModal({ studentId, studentName, summary: propSummary, onClose }) {
  const [summaryText, setSummaryText] = useState(propSummary || null);
  const [localizedText, setLocalizedText] = useState(null);
  const [loading, setLoading] = useState(!propSummary && Boolean(studentId));
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (propSummary) {
      setSummaryText(propSummary);
      setLoading(false);
      return;
    }
    if (!studentId) return;

    setLoading(true);
    setError(null);
    client
      .post(`/api/students/${studentId}/parent-summary`)
      .then((res) => {
        setSummaryText(res.data.summary_en || res.data.summary || '');
        setLocalizedText(res.data.summary_localized || null);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not generate parent summary right now.');
        setLoading(false);
      });
  }, [studentId, propSummary]);

  // Don't render modal if no active summary or student ID
  if (!propSummary && !studentId) {
    return null;
  }

  const handleCopy = () => {
    const textToCopy = localizedText || summaryText || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
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
          <button type="button" className="modal-close-icon" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="modal-subtitle">
            Localized message for {studentName || 'student'}&apos;s parents (ready for WhatsApp / SMS):
          </p>

          {loading && (
            <div className="modal-loading" style={{ padding: '20px', textAlign: 'center' }}>
              <span className="spinner" /> Generating localized summary...
            </div>
          )}

          {error && (
            <div className="error-banner" style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
              {error}
            </div>
          )}

          {!loading && !error && summaryText && (
            <div className="whatsapp-box">
              <div className="whatsapp-header-badge">🟢 WhatsApp Message Preview</div>
              <div className="whatsapp-text">
                <p>{summaryText}</p>
                {localizedText && <p style={{ marginTop: '8px', fontWeight: 600 }}>{localizedText}</p>}
              </div>
              <div className="whatsapp-time">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ✓✓
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary" onClick={handleCopy} disabled={!summaryText}>
            {copied ? '✓ Copied!' : '📋 Copy Message'}
          </button>
        </div>
      </div>
    </div>
  );
}
