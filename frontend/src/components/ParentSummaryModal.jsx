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
    <div className="modal-overlay">
      <div className="modal">
        <h2>Share with parent</h2>

        {error && <p className="content-pending">{error}</p>}
        {!error && !summary && <p>Generating summary...</p>}
        {summary && (
          <>
            <p>{summary.summary_en}</p>
            {summary.summary_localized && <p>{summary.summary_localized}</p>}
          </>
        )}

        <div className="modal-actions">
          <button disabled title="Not wired up for the demo">
            Send via SMS
          </button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
