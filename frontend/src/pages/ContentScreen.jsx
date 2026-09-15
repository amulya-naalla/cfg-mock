import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client.js';
import {
  LocalStore,
  SKILL_AREAS,
  SKILL_LABELS,
  LANGUAGES,
  LANG_LABELS,
  SUBJECTS,
  DIFFICULTIES,
  GRADES,
} from '../data/mockData.js';
import { getRecommendations } from '../utils/adaptive.js';
import { PreviewModal, AssignModal, CreateContentModal } from '../components/ContentModals.jsx';

const EMPTY_FILTERS = {
  q: '',
  subject: '',
  ageGroup: '',
  grade: '',
  language: '',
  difficulty: '',
  skill: '',
};

const AGE_GROUPS = [
  { key: '5-7', label: 'Age 5–7', min: 5, max: 7 },
  { key: '8-10', label: 'Age 8–10', min: 8, max: 10 },
  { key: '11-13', label: 'Age 11–13', min: 11, max: 13 },
  { key: '14+', label: 'Age 14+', min: 14, max: 18 },
];

function matchesAgeGroup(item, groupKey) {
  if (!groupKey) return true;
  const g = AGE_GROUPS.find((a) => a.key === groupKey);
  if (!g) return true;
  return item.age_min <= g.max && item.age_max >= g.min;
}

function studentMetaShort(student) {
  const bits = [];
  if (student.grade) bits.push(`Grade ${student.grade}`);
  if (student.age) bits.push(`age ${student.age}`);
  return bits.join(' · ');
}

// Single lesson view if :id parameter is present
function SingleLessonView({ id }) {
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
      <div className="page-content">
        <Link to="/content" className="back-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
          ← Back to Resources
        </Link>
        <div className="error-banner" style={{ padding: '16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px' }}>
          {error}
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="page-content">
        <Link to="/content" className="back-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
          ← Back to Resources
        </Link>
        <div className="skeleton" style={{ width: '55%', height: 36, marginBottom: 10 }} />
        <div className="skeleton" style={{ width: '30%', height: 18, marginBottom: 28 }} />
      </div>
    );
  }

  const tamil = content.localized_text?.ta;

  return (
    <div className="page-content">
      <Link to="/content" className="back-link" style={{ display: 'inline-block', marginBottom: '16px' }}>
        ← Back to Resources
      </Link>
      <div className="page-header">
        <h1>{content.title}</h1>
        <div className="content-meta-row" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <span className="badge">{content.subject}</span>
          <span className="badge">Grade {content.grade_level}</span>
        </div>
      </div>

      <div className="content-columns" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="card lang-card" style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div className="lang-card-header" style={{ fontWeight: 700, marginBottom: '12px' }}>
            🇬🇧 English (Original)
          </div>
          <p className="lang-card-body">{content.original_text}</p>
        </div>

        <div className="card lang-card" style={{ padding: '20px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
          <div className="lang-card-header" style={{ fontWeight: 700, marginBottom: '12px' }}>
            🇮🇳 Tamil (Localized)
          </div>
          {tamil ? (
            <p className="lang-card-body">{tamil}</p>
          ) : (
            <p className="content-pending" style={{ color: '#64748b' }}>
              Translation pending
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ContentScreen() {
  const { id } = useParams();
  const [content, setContent] = useState(() => LocalStore.getContent());
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);

  if (id) {
    return <SingleLessonView id={id} />;
  }

  function refresh() {
    setContent(LocalStore.getContent());
  }

  useEffect(() => LocalStore.subscribe(refresh), []);

  const recommendations = useMemo(
    () => getRecommendations(LocalStore.getStudents(), content, 3),
    [content]
  );

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return content.filter((c) => {
      if (q && !(`${c.title} ${c.description} ${c.topic || ''}`.toLowerCase().includes(q))) return false;
      if (filters.subject && c.subject !== filters.subject) return false;
      if (!matchesAgeGroup(c, filters.ageGroup)) return false;
      if (filters.grade && !(Array.isArray(c.grades) && c.grades.includes(filters.grade))) return false;
      if (filters.language && c.language !== filters.language) return false;
      if (filters.difficulty && c.difficulty !== filters.difficulty) return false;
      if (filters.skill && c.skill !== filters.skill) return false;
      return true;
    });
  }, [content, filters]);

  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  function setFilter(key) {
    return (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Learning Resources</h1>
          <p className="page-subtitle">Find, preview and assign content matched to each student&rsquo;s needs.</p>
        </div>
        <div className="quick-actions">
          <button className="quick-btn quick-btn-primary" onClick={() => setModal({ type: 'create' })}>
            <span aria-hidden="true">✨</span> Create Content
          </button>
        </div>
      </div>

      {/* Recommended for students */}
      {recommendations.length > 0 && (
        <section className="panel educator-rec-panel">
          <div className="panel-header">
            <h2>🎯 Recommended for Students</h2>
            <span className="benchmark-note">age/grade + level + gap + language</span>
          </div>
          <div className="educator-rec-grid">
            {recommendations.map(({ student, content: c, score, reasons }) => {
              const initials = student.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
              const matchPct = Math.min(99, Math.round(score));
              return (
                <div key={student._id} className="educator-rec-card">
                  <div className="educator-rec-student-col">
                    <div className="educator-rec-avatar">{initials}</div>
                    <div className="educator-rec-student-info">
                      <span className="educator-rec-student-name">{student.name}</span>
                      <span className="educator-rec-student-meta">
                        Grade {student.grade} • Age {student.age || '?'}
                      </span>
                      <span className="educator-rec-gap-tag">
                        Struggling: {SKILL_LABELS[student.primary_gap] || 'General'}
                      </span>
                    </div>
                  </div>

                  <div className="educator-rec-arrow">➔</div>

                  <div className="educator-rec-content-col">
                    <div className="educator-rec-content-head">
                      <h4 className="educator-rec-content-title">{c.title}</h4>
                      <div className="educator-rec-tags">
                        <span className="meta-tag">{c.subject}</span>
                        <span className="meta-tag">{LANG_LABELS[c.language] || c.language}</span>
                        <span className={`difficulty-chip diff-${c.difficulty.toLowerCase()}`}>{c.difficulty}</span>
                      </div>
                    </div>
                    <div className="educator-rec-reasons">
                      ✨ {reasons.slice(0, 3).join(' • ')}
                    </div>
                  </div>

                  <div className="educator-rec-action-col">
                    <div className="educator-rec-match-badge">
                      <span className="match-pct">{matchPct}%</span> Match
                    </div>
                    <button
                      type="button"
                      className="btn-primary educator-rec-assign-btn"
                      onClick={() => setModal({ type: 'assign', content: c })}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="filter-panel">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            className="search-input"
            placeholder="Search by title, topic or description…"
            value={filters.q}
            onChange={setFilter('q')}
          />
        </div>
        <div className="filter-controls-row">
          <select className="select-control" value={filters.subject} onChange={setFilter('subject')} aria-label="Subject filter">
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select-control" value={filters.ageGroup} onChange={setFilter('ageGroup')} aria-label="Age group filter">
            <option value="">All Ages</option>
            {AGE_GROUPS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
          <select className="select-control" value={filters.grade} onChange={setFilter('grade')} aria-label="Grade filter">
            <option value="">All Grades</option>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select className="select-control" value={filters.language} onChange={setFilter('language')} aria-label="Language filter">
            <option value="">All Languages</option>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>
          <select className="select-control" value={filters.difficulty} onChange={setFilter('difficulty')} aria-label="Difficulty filter">
            <option value="">All Levels</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="select-control" value={filters.skill} onChange={setFilter('skill')} aria-label="Skill filter">
            <option value="">All Skills</option>
            {SKILL_AREAS.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          {activeFilterCount > 0 && (
            <button className="flagged-toggle-btn" onClick={() => setFilters(EMPTY_FILTERS)}>
              ✕ Clear filters ({activeFilterCount})
            </button>
          )}
        </div>
      </div>

      <div className="list-meta-bar">
        <span>
          Showing <strong>{filtered.length}</strong> of {content.length} resources
        </span>
      </div>

      {/* Content cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔎</div>
          <div className="empty-state-title">No resources match your filters</div>
          <div className="empty-state-desc">Try clearing a filter or two, or create new content.</div>
        </div>
      ) : (
        <div className="content-grid">
          {filtered.map((c) => (
            <article key={c._id} className="content-card">
              <div className="content-card-top">
                <span className="content-type-chip">{c.type}</span>
                <span className={`difficulty-chip diff-${c.difficulty?.toLowerCase()}`}>{c.difficulty}</span>
              </div>
              <h3 className="content-title">{c.title}</h3>
              <p className="content-desc">{c.description || c.topic || 'No description yet.'}</p>
              <div className="content-meta">
                <span className="meta-tag">{c.subject}</span>
                <span className="meta-tag">{LANG_LABELS[c.language] || c.language}</span>
                <span className="meta-tag">Age {c.age_min}–{c.age_max}</span>
                <span className="meta-tag">Grade {(c.grades || []).join('–')}</span>
                <span className="meta-tag">⏱ {c.duration_min || 20} min</span>
              </div>
              <div className="content-skill-row">
                <span className="skill-chip">Skill: {SKILL_LABELS[c.skill] || c.skill}</span>
              </div>
              <div className="content-actions">
                <button className="btn-secondary" onClick={() => setModal({ type: 'preview', content: c })}>
                  👁️ Preview
                </button>
                <button className="btn-primary" onClick={() => setModal({ type: 'assign', content: c })}>
                  Assign
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast" role="status">{toast}</div>}

      {/* Modals */}
      {modal?.type === 'preview' && (
        <PreviewModal
          content={modal.content}
          onClose={() => setModal(null)}
          onAssign={() => setModal({ type: 'assign', content: modal.content })}
        />
      )}
      {modal?.type === 'assign' && (
        <AssignModal
          content={modal.content}
          onClose={() => setModal(null)}
          onAssigned={(student, c) =>
            showToast(`✅ Assigned "${c.title}" to ${student.name}.`)
          }
        />
      )}
      {modal?.type === 'create' && (
        <CreateContentModal
          onClose={() => setModal(null)}
          onCreated={(item) => showToast(`✅ Saved "${item.title}" to your library.`)}
        />
      )}
    </div>
  );
}
