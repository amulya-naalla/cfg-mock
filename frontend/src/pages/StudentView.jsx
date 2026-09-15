import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client.js';
import ContentScreen from './LessonView.jsx';

export default function StudentView() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [contentId, setContentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only pull name/grade — never render assessments, scoreTrend, or flagged status here.
    client
      .get(`/api/students/${id}`)
      .then((res) => setStudent({ name: res.data.name, grade: res.data.grade }))
      .catch(() => setError('Could not find that student.'));

    // There's no lesson-assignment relationship in the data model yet, so this shows
    // the first available lesson rather than a specifically "assigned" one — a
    // deliberate simplification for this MVP, flagged here rather than guessed silently.
    client
      .get('/api/content')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        if (list.length > 0) setContentId(list[0]._id);
      })
      .catch(() => {});
  }, [id]);

  if (error) {
    return (
      <div className="page-content">
        <div className="topbar">
          <Link to="/student" className="back-link">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
            Find my name
          </Link>
        </div>
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="topbar">
        <Link to="/student" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Not you?
        </Link>
      </div>

      {student && (
        <div className="page-head">
          <div>
            <h1 className="page-title">Hi, {student.name}! 👋</h1>
            <p className="page-subtitle">Grade {student.grade} — here&rsquo;s your lesson today.</p>
          </div>
        </div>
      )}

      {contentId ? (
        <ContentScreen contentId={contentId} studentId={id} backLink={false} />
      ) : (
        <p className="page-subtitle">No lessons available yet.</p>
      )}
    </div>
  );
}
