import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client.js';

function BackLink() {
  return (
    <div className="topbar">
      <Link to="/leadership" className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        Dashboard
      </Link>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: '55%', height: 36, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: '30%', height: 18, marginBottom: 28 }} />
      <div className="content-columns">
        <div className="skeleton" style={{ height: 140 }} />
        <div className="skeleton" style={{ height: 140 }} />
      </div>
    </div>
  );
}

export default function ContentScreen() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setContent(null);
    setError(null);
    client
      .get(`/api/content/${id}`)
      .then((res) => setContent(res.data))
      .catch(() => setError('Could not load this lesson.'));
  }, [id]);

  if (error) {
    return (
      <div>
        <BackLink />
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div>
        <BackLink />
        <ContentSkeleton />
      </div>
    );
  }

  const tamil = content.localized_text?.ta;

  return (
    <div>
      <BackLink />
      <div className="page-header">
        <h1>{content.title}</h1>
        <div className="content-meta-row">
          <span className="badge">{content.subject}</span>
          <span className="badge">Grade {content.grade_level}</span>
        </div>
      </div>

      <div className="content-columns">
        <div className="card lang-card">
          <div className="lang-card-header">
            <span className="lang-flag">EN</span>
            English
          </div>
          <p className="lang-card-body">{content.original_text}</p>
        </div>

        <div className={`card lang-card lang-card-ta ${!tamil ? 'lang-card-pending' : ''}`}>
          <div className="lang-card-header">
            <span className="lang-flag">TA</span>
            Tamil
          </div>
          {tamil ? (
            <p className="lang-card-body">{tamil}</p>
          ) : (
            <p className="content-pending">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              Translation pending
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
