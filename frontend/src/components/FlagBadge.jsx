export default function FlagBadge({ flagged }) {
  if (!flagged) return null;
  return <span className="flag-badge">Flagged</span>;
}
