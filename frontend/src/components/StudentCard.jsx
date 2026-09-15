import { Link } from 'react-router-dom';
import FlagBadge from './FlagBadge.jsx';

export default function StudentCard({ student }) {
  const id = student._id || student.id;
  const isFlagged = Boolean(student.flagged);

  return (
    <Link to={`/students/${id}`} className={`student-card ${isFlagged ? 'is-flagged' : ''}`}>
      <div className="student-card-info">
        <div className="student-name-row">
          <span className="student-name">{student.name}</span>
          <FlagBadge flagged={isFlagged} showOnTrack={true} />
        </div>
        <div className="student-meta-row">
          <span className="meta-tag">Grade {student.grade}</span>
          {student.cluster && <span className="meta-tag">Cluster: {student.cluster}</span>}
          <span className="meta-tag">🗣️ {student.language || 'en'}</span>
          {student.last_score !== null && student.last_score !== undefined && (
            <span className="recent-score-hint">
              Recent: {student.last_subject || 'Assessment'} • <strong>{student.last_score} pts</strong>
            </span>
          )}
        </div>
      </div>
      <div className="student-card-arrow">›</div>
    </Link>
  );
}
