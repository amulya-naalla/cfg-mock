import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import client from '../api/client.js';

// Hackathon stopgap, NOT real auth: students just pick their own name from a list.
// A real deployment needs actual student login here.
export default function StudentPortal() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    client
      .get('/api/students')
      .then((res) => setStudents(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Could not load the student list.'));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return students;
    return students.filter((s) => s.name?.toLowerCase().includes(q));
  }, [students, search]);

  return (
    <div className="par-identity-gate">
      <div className="card par-identity-card">
        <Link to="/" className="back-link" style={{ marginBottom: 12, display: 'inline-flex' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Home
        </Link>
        <h1 className="par-greeting">Hi there! 👋</h1>
        <p className="par-subtitle">Find your name to see your lesson.</p>

        <div className="par-identity-form">
          <input
            type="text"
            placeholder="Type your name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {error && <p className="par-identity-hint">⚠️ {error}</p>}

        <div style={{ textAlign: 'left', marginTop: 8, maxHeight: 260, overflowY: 'auto' }}>
          {filtered.map((s) => (
            <button
              key={s._id}
              type="button"
              className="quiz-option-btn"
              style={{ width: '100%', marginBottom: 8 }}
              onClick={() => navigate(`/student/${s._id}`)}
            >
              {s.name}
            </button>
          ))}
          {filtered.length === 0 && !error && (
            <p className="par-identity-hint">No names match &ldquo;{search}&rdquo;.</p>
          )}
        </div>
      </div>
    </div>
  );
}
