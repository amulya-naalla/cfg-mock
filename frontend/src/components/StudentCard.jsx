import { Link } from 'react-router-dom';
import FlagBadge from './FlagBadge.jsx';

export default function StudentCard({ student }) {
  return (
    <Link to={`/students/${student._id}`} className="student-card">
      <span>{student.name}</span>
      <span>{student.grade}</span>
      <FlagBadge flagged={student.flagged} />
    </Link>
  );
}
