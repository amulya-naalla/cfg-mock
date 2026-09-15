import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client.js';
import ContentScreen from './LessonView.jsx';

// Read-only student view: their own name/grade, the list of lessons they can open,
// and the lesson itself with its quiz. No assessments, no scoreTrend, no flagged
// status, no dashboard, and no access to any other student's data.
export default function StudentView() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [contentId, setContentId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only pull name/grade — never render assessments, scoreTrend, or flagged status here.
    client
      .get(`/api/students/${id}`)
      .then((res) => setStudent({ name: res.data.name, grade: res.data.grade }))
      .catch(() => setError('Could not find that student.'));

    // There's no lesson-assignment relationship in the data model yet, so every
    // lesson is offered rather than a specifically "assigned" subset.
    client
      .get('/api/content')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setLessons(list);
        if (list.length > 0) setContentId((prev) => prev ?? list[0]._id);
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
            <p className="page-subtitle">Grade {student.grade} — pick a lesson to learn.</p>
          </div>
        </div>
      )}

      {lessons.length > 1 && (
        <div className="stu-lesson-picker" role="group" aria-label="Choose a lesson">
          {lessons.map((l) => (
            <button
              key={l._id}
              type="button"
              className={`stu-lesson-btn ${contentId === l._id ? 'is-active' : ''}`}
              onClick={() => setContentId(l._id)}
            >
              <span className="stu-lesson-icon" aria-hidden="true">
                {l.subject === 'Math' ? '🔢' : '📖'}
              </span>
              <span className="stu-lesson-text">
                <span className="stu-lesson-title">{l.title}</span>
                <span className="stu-lesson-sub">{l.subject}</span>
              </span>
            </button>
          ))}
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
