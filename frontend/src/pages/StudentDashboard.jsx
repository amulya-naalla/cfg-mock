import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  LocalStore,
  LANG_LABELS,
} from '../data/mockData.js';
import {
  deriveStudentDashboard,
} from '../utils/student.js';
import StudentActivityModal from '../components/StudentActivityModal.jsx';

function ProgressRing({ pct }) {
  // Simple SVG ring, no animation
  const r = 30;
  const c = 2 * Math.PI * r;
  const filled = (Math.min(100, Math.max(0, pct)) / 100) * c;
  return (
    <svg className="student-progress-ring" viewBox="0 0 80 80" aria-hidden="true">
      <circle className="student-progress-ring-track" cx="40" cy="40" r={r} />
      <circle
        className="student-progress-ring-fill"
        cx="40"
        cy="40"
        r={r}
        strokeDasharray={`${filled} ${c - filled}`}
        strokeDashoffset={c * 0.25}
      />
    </svg>
  );
}

function ContinueCard({ row, onStart }) {
  const c = row.content;
  return (
    <div className="student-continue-card">
      <div className="student-continue-main">
        <span className="content-type-chip">{c.type}</span>
        <h3 className="student-continue-title">{c.title}</h3>
        <div className="content-meta">
          <span className="meta-tag">{c.subject}</span>
          <span className="meta-tag">{LANG_LABELS[c.language] || c.language}</span>
          <span className="meta-tag">⏱ {c.duration_min || 20} min</span>
        </div>
        <div className="student-continue-progress-row">
          <div className="student-continue-track">
            <div
              className="student-continue-fill"
              style={{ width: `${row.progress_pct || 0}%` }}
            />
          </div>
          <span className="student-continue-pct">{row.progress_pct || 0}% done</span>
        </div>
      </div>
      <button className="btn-primary student-continue-btn" onClick={() => onStart(row.content)}>
        ▶ Continue Learning
      </button>
    </div>
  );
}

function RecommendationCard({ rec, onStart }) {
  const c = rec.content;
  return (
    <article className="content-card student-rec-card">
      <div className="content-card-top">
        <span className="content-type-chip">{c.type}</span>
        <span className={`difficulty-chip diff-${c.difficulty.toLowerCase()}`}>{c.difficulty}</span>
      </div>
      <h3 className="content-title">{c.title}</h3>
      <p className="content-desc">{c.description}</p>
      <div className="content-meta">
        <span className="meta-tag">{c.subject}</span>
        <span className="meta-tag">{LANG_LABELS[c.language] || c.language}</span>
        <span className="meta-tag">Age {c.age_min}–{c.age_max}</span>
        <span className="meta-tag">⏱ {c.duration_min || 20} min</span>
      </div>
      {rec.reasons?.length > 0 && (
        <div className="student-recommend-why">✨ {rec.reasons.slice(0, 2).join(' • ')}</div>
      )}
      <div className="content-actions">
        <button className="btn-primary" onClick={() => onStart(c)}>Start Learning</button>
      </div>
    </article>
  );
}

function FocusAreaCard({ area }) {
  return (
    <div className="student-focus-card">
      <div className="student-focus-head">
        <span className="student-focus-label">{area.label}</span>
        {area.pct != null && (
          <span className={`student-focus-pct ${area.pct < 40 ? 'is-danger' : ''}`}>{area.pct}/100</span>
        )}
      </div>
      <div className="student-focus-track">
        <div
          className={`student-focus-fill ${area.pct != null && area.pct < 40 ? 'is-danger' : ''}`}
          style={{ width: `${area.pct != null ? Math.max(8, area.pct) : 35}%` }}
        />
      </div>
      <p className="student-focus-hint">{area.hint}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(() => deriveStudentDashboard());
  const [activeContent, setActiveContent] = useState(null);

  function refresh() {
    setData(deriveStudentDashboard());
  }

  // Re-derive whenever LocalStore changes (progress saves, badges unlock…)
  useEffect(() => LocalStore.subscribe(refresh), []);

  if (!data || !data.student) {
    return (
      <div className="page-content">
        <div className="empty-state">
          <div className="empty-state-icon">🎒</div>
          <div className="empty-state-title">No student profile found</div>
          <div className="empty-state-desc">
            Add a student from the educator app first, then sign in as that student.
          </div>
        </div>
        <div className="student-profile-cta-row">
          <Link className="btn-secondary" to="/students">Go to educator app</Link>
        </div>
      </div>
      );
  }

  const { student, continueItem, recommended, focusAreas, achievements, metrics, streak, weeklyMinutes } = data;

  function openContent(content) {
    setActiveContent(content);
  }

  return (
    <div className="page-dashboard student-page">
      {/* Welcome */}
      <div className="student-welcome">
        <div className="student-welcome-text">
          <h1 className="page-title">Hello, {student.name.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">
            Grade {student.grade} • Age {student.age} • {LANG_LABELS[student.language] || student.language}
          </p>
        </div>
        <button className="quick-btn quick-btn-primary" onClick={() => navigate('/student/learn')}>
          🚀 Practice Now
        </button>
      </div>

      {/* Metrics */}
      <div className="metrics-row student-metrics-row">
        <div className="metric-card student-metric-card">
          <div className="student-metric-main">
            <span className="metric-label">Overall Progress</span>
            <span className="metric-val">{metrics.overallPct}%</span>
          </div>
          <ProgressRing pct={metrics.overallPct} />
        </div>
        <div className="metric-card student-metric-card">
          <span className="metric-icon">🔥</span>
          <span className="metric-val">{streak} {streak === 1 ? 'day' : 'days'}</span>
          <span className="metric-label">Learning Streak</span>
          <span className="student-metric-sub">{weeklyMinutes} min this week</span>
        </div>
        <div className="metric-card student-metric-card">
          <span className="metric-icon">✅</span>
          <span className="metric-val">{metrics.completedCount}</span>
          <span className="metric-label">Completed</span>
          <span className="student-metric-sub">{metrics.inProgressCount} in progress</span>
        </div>
        <div className="metric-card student-metric-card">
          <span className="metric-icon">🏅</span>
          <span className="metric-val">{achievements.filter((a) => a.earned_at).length}</span>
          <span className="metric-label">Achievements</span>
          <span className="student-metric-sub">
            {achievements.filter((a) => !a.earned_at).length} to unlock
          </span>
        </div>
        <div className="metric-card student-metric-card student-metric-action">
          <span className="metric-icon">🎯</span>
          <span className="metric-val">Practice</span>
          <span className="metric-label">Quick Link</span>
          <Link className="btn-secondary student-metric-btn" to="/student/learn">
            Go to Practice →
          </Link>
        </div>
      </div>

      {/* Continue Learning */}
      {continueItem ? (
        <section className="panel student-continue-panel">
          <div className="panel-header">
            <h2>▶ Continue Learning</h2>
            <span className="benchmark-note">pick up where you left off</span>
          </div>
          <ContinueCard row={continueItem} onStart={openContent} />
        </section>
      ) : (
        <section className="panel student-continue-panel">
          <div className="panel-header">
            <h2>▶ Start Something New</h2>
            <span className="benchmark-note">picked for your level & language</span>
          </div>
          <p className="student-continue-empty">
            Nothing in progress right now. <Link to="/student/learn">Browse your learning library →</Link>
          </p>
        </section>
      )}

      <div className="dashboard-grid student-dashboard-grid">
        {/* Left column */}
        <div className="dashboard-col">
          {/* Recommended */}
          <section className="panel panel-recommended">
            <div className="panel-header">
              <h2>🎯 Recommended For You</h2>
              <span className="benchmark-note">age/grade + level + gap + language</span>
            </div>
            {recommended.length === 0 ? (
              <p className="student-continue-empty">Check back soon — more content is coming.</p>
            ) : (
              <div className="content-grid student-rec-grid">
                {recommended.map((rec) => (
                  <RecommendationCard key={rec.content._id} rec={rec} onStart={openContent} />
                ))}
              </div>
            )}
          </section>

          {/* Focus areas */}
          <section className="panel">
            <div className="panel-header">
              <h2>🧩 Your Focus Areas</h2>
              <span className="benchmark-note">skills that need more practice</span>
            </div>
            {focusAreas.length === 0 ? (
              <p className="student-continue-empty">No weak spots detected — keep it up! 💪</p>
            ) : (
              <div className="student-focus-list">
                {focusAreas.map((area) => (
                  <FocusAreaCard key={area.key} area={area} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="dashboard-col">
          {/* Recent achievements */}
          <section className="panel">
            <div className="panel-header">
              <h2>🏅 Recent Achievements</h2>
              <span className="panel-count">
                {achievements.filter((a) => a.earned_at).length}/{achievements.length}
              </span>
            </div>
            <div className="student-achievement-list">
              {achievements.map((a) => (
                <div
                  key={a._id}
                  className={`student-achievement-row ${a.earned_at ? '' : 'is-locked'}`}
                >
                  <span className="student-achievement-icon" aria-hidden="true">
                    {a.earned_at ? a.icon : '🔒'}
                  </span>
                  <div className="student-achievement-text">
                    <span className="student-achievement-title">{a.title}</span>
                    <span className="student-achievement-desc">{a.description}</span>
                  </div>
                  <span className="student-achievement-date">
                    {a.earned_at ? a.earned_at : 'Locked'}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Streak panel */}
          <section className="panel panel-tip">
            <h2 className="panel-tip-title">🔥 Keep your streak going!</h2>
            <p className="panel-tip-text">
              You&rsquo;ve learned {streak === 1 ? 'day after day' : `${streak} days in a row`} for{' '}
              {weeklyMinutes} minutes this week. Open any activity from{' '}
              <Link to="/student/learn">Practice</Link> today to keep the flame alive.
            </p>
          </section>
        </div>
      </div>

      {/* Activity modal */}
      {activeContent && (
        <StudentActivityModal
          content={activeContent}
          onClose={() => {
            setActiveContent(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
