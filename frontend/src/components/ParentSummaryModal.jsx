import { useEffect, useState } from 'react';
import client from '../api/client.js';

export default function ParentSummaryModal({ studentId, onClose }) {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!studentId) return;
    setSummary(null);
    setError(null);
    client
      .post(`/api/students/${studentId}/parent-summary`)
      .then((res) => setSummary(res.data))
      .catch(() => setError('Could not generate a summary right now.'));
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </span>
          <h2>Share with parent</h2>
        </div>

        {error && (
          <div className="error-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v5M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        {!error && !summary && (
          <div className="modal-loading">
            <span className="spinner" />
            Generating summary...
          </div>
        )}

        {summary && (
          <div className="modal-summary">
            <p>{summary.summary_en}</p>
            {summary.summary_localized && <p className="modal-summary-localized">{summary.summary_localized}</p>}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-secondary" disabled title="Not wired up for the demo">
            Send via SMS
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
