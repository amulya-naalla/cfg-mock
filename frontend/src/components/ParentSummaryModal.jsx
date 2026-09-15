export default function ParentSummaryModal({ summary, onClose }) {
  if (!summary) return null;
  return (
    <div className="modal-overlay">
      <div className="modal">
        <p>{summary}</p>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
