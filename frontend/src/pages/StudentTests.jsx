/**
 * Student Tests page.
 * Shows available, recommended (same adaptive model as content), and
 * completed tests. Starting a test opens the TestRunnerModal.
 *
 * Follows the structure/styling conventions of StudentLearn.jsx.
 */

import { useEffect, useMemo, useState } from 'react';
import { LANG_LABELS, LocalStore } from '../data/mockData.js';
import { getCurrentStudent, getMyTests, getRecommendedTests } from '../utils/student.js';
import TestRunnerModal from '../components/TestRunnerModal.jsx';
import TestResultsModal from '../components/TestResultsModal.jsx';

function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

/** Card shown in Available / Recommended sections (not yet attempted). */
function TestCard({ entry, onStart }) {
  const t = entry.test;
  const lastPct = entry.attempts.length
    ? entry.attempts[entry.attempts.length - 1].pct
    : null;

  return (
    <article className="content-card test-card">
      <div className="content-card-top">
        <span className="content-type-chip">{t.subject}</span>
        <span className={`difficulty-chip diff-${t.difficulty.toLowerCase()}`}>{t.difficulty}</span>
      </div>
      <h3 className="content-title">{t.title}</h3>
      <div className="content-meta">
        <span className="meta-tag">📝 {t.questions.length} questions</span>
        <span className="meta-tag">⏱ ~{t.time_limit_min} min</span>
        <span className="meta-tag">{LANG_LABELS[t.language] || t.language}</span>
        <span className="meta-tag">Grade {t.grade}</span>
      </div>
      {entry.reasons?.length > 0 && (
        <div className="student-recommend-why">✨ {entry.reasons.slice(0, 2).join(' • ')}</div>
      )}
      {lastPct != null && (
        <div className="test-card-last">Last attempt: <strong>{lastPct}%</strong></div>
      )}
      <div className="content-actions">
        <button className="btn-primary" onClick={() => onStart(t)}>
          {lastPct != null ? '🔄 Retake Test' : '🚀 Start Test'}
        </button>
      </div>
    </article>
  );
}

/** Compact row shown in the Completed section. */
function CompletedTestRow({ entry, onView }) {
  const t = entry.test;
  const a = entry.attempts[entry.attempts.length - 1];
  const best = Math.max(...entry.attempts.map((x) => x.pct));
  const tone = a.pct >= 80 ? 'great' : a.pct >= 50 ? 'ok' : 'rough';

  return (
    <button className={`test-history-row test-history-${tone}`} onClick={() => onView(a)}>
      <div className="test-history-main">
        <span className="test-history-title">{t.title}</span>
        <span className="test-history-meta">
          {t.subject} • {a.score}/{a.total} • ⏱ {fmtTime(a.time_taken_sec)} • {fmtDate(a.completed_at)}
        </span>
      </div>
      <div className="test-history-side">
        <span className={`test-history-pct ${tone === 'rough' ? 'is-danger' : ''}`}>{a.pct}%</span>
        {best > a.pct && <span className="test-history-best">best {best}%</span>}
      </div>
      <span className="test-history-arrow">→</span>
    </button>
  );
}

export default function StudentTests() {
  const [student, setStudent] = useState(() => getCurrentStudent());
  const [tests, setTests] = useState(() => getMyTests());
  const [activeTest, setActiveTest] = useState(null);
  const [viewAttempt, setViewAttempt] = useState(null); // { test, attempt }

  function refresh() {
    setStudent(getCurrentStudent());
    setTests(getMyTests());
  }

  // Re-derive whenever LocalStore changes (attempt saved, badge unlocked…)
  useEffect(() => LocalStore.subscribe(refresh), []);

  const { recommended, completed, available } = useMemo(() => {
    const recommended = getRecommendedTests(3);
    const completedEntries = tests
      .filter((t) => t.attempts.length > 0)
      .sort(
        (a, b) =>
          new Date(b.attempts[b.attempts.length - 1].completed_at) -
          new Date(a.attempts[a.attempts.length - 1].completed_at)
      );
    // "Available" lists the whole catalog; attempted ones offer a retake.
    return { recommended, completed: completedEntries, available: tests };
  }, [tests]);

  const avgPct = useMemo(() => {
    const all = tests.flatMap((t) => t.attempts);
    if (!all.length) return null;
    return Math.round(all.reduce((s, a) => s + a.pct, 0) / all.length);
  }, [tests]);

  const myLangLabel = student ? LANG_LABELS[student.language] || student.language : '';

  return (
    <div className="page-content student-page">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Tests</h1>
          <p className="page-subtitle">
            Check your skills with short quizzes{student ? ` • ${myLangLabel} learner` : ''}
          </p>
        </div>
        {avgPct != null && (
          <div className="test-avg-pill" title="Average across all your test attempts">
            <span className="test-avg-label">📊 Avg score</span>
            <span className="test-avg-value">{avgPct}%</span>
          </div>
        )}
      </div>

      {/* Recommended tests */}
      {recommended.length > 0 && (
        <section className="panel panel-recommended student-rec-panel">
          <div className="panel-header">
            <h2>🌟 Recommended Tests</h2>
            <span className="benchmark-note">age/grade + level + gap + language</span>
          </div>
          <div className="content-grid student-rec-grid">
            {recommended.map((entry) => (
              <TestCard key={entry.test._id} entry={entry} onStart={setActiveTest} />
            ))}
          </div>
        </section>
      )}

      {/* Available tests */}
      <section className="panel">
        <div className="panel-header">
          <h2>📋 Available Tests</h2>
          <span className="panel-count">{available.length}</span>
        </div>
        {available.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-title">You've started every test!</div>
            <div className="empty-state-desc">Retake any completed test below to beat your score.</div>
          </div>
        ) : (
          <div className="content-grid">
            {available.map((entry) => (
              <TestCard key={entry.test._id} entry={entry} onStart={setActiveTest} />
            ))}
          </div>
        )}
      </section>

      {/* Completed tests */}
      <section className="panel">
        <div className="panel-header">
          <h2>✅ Completed Tests</h2>
          <span className="panel-count">{completed.length}</span>
        </div>
        {completed.length === 0 ? (
          <p className="student-continue-empty">
            No tests yet — take your first test above and your results will appear here.
          </p>
        ) : (
          <div className="test-history-list">
            {completed.map((entry) => (
              <CompletedTestRow
                key={entry.test._id}
                entry={entry}
                onView={(attempt) => setViewAttempt({ test: entry.test, attempt })}
              />
            ))}
            <p className="test-history-hint">Tap a test to review your answers.</p>
          </div>
        )}
      </section>

      {/* Test runner / result viewer */}
      {activeTest && (
        <TestRunnerModal test={activeTest} onClose={() => { setActiveTest(null); refresh(); }} />
      )}
      {viewAttempt && (
        <TestResultsModal
          test={viewAttempt.test}
          attempt={viewAttempt.attempt}
          onClose={() => { setViewAttempt(null); refresh(); }}
          onRetry={() => {
            const t = viewAttempt.test;
            setViewAttempt(null);
            setActiveTest(t);
          }}
        />
      )}
    </div>
  );
}
