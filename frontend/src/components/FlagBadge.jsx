export default function FlagBadge({ flagged, showOnTrack = false }) {
  if (flagged) {
    return (
      <span className="flag-badge flag-badge-danger" title="Scored below grade benchmark">
        🚩 Needs Attention
      </span>
    );
  }
  
  if (showOnTrack) {
    return (
      <span className="flag-badge flag-badge-success" title="Meeting grade benchmarks">
        ✓ On Track
      </span>
    );
  }

  return null;
}
