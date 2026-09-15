import { useEffect, useMemo, useState } from 'react';
import {
  LocalStore,
  LANGUAGES,
  LANG_LABELS,
  SUBJECTS,
  DIFFICULTIES,
  SKILL_AREAS,
  GRADES,
} from '../data/mockData.js';
import {
  getCurrentStudent,
  getMyRecommendations,
  getMyProgress,
  QUICK_LANGUAGES,
} from '../utils/student.js';
import StudentActivityModal from '../components/StudentActivityModal.jsx';

const AGE_GROUPS = [
  { key: '5-7', label: 'Age 5–7', min: 5, max: 7 },
  { key: '8-10', label: 'Age 8–10', min: 8, max: 10 },
  { key: '11-13', label: 'Age 11–13', min: 11, max: 13 },
  { key: '14+', label: 'Age 14+', min: 14, max: 18 },
];

const EMPTY_FILTERS = {
  q: '',
  subject: '',
  ageGroup: '',
  grade: '',
  language: '',
  difficulty: '',
  skill: '',
};

function matchesAgeGroup(item, groupKey) {
  if (!groupKey) return true;
  const g = AGE_GROUPS.find((a) => a.key === groupKey);
  if (!g) return true;
  return item.age_min <= g.max && item.age_max >= g.min;
}

function ContentCard({ item, progress, onStart }) {
  const started = Boolean(progress);
  return (
    <article className="content-card">
      <div className="content-card-top">
        <span className="content-type-chip">{item.type}</span>
        <span className={`difficulty-chip diff-${item.difficulty.toLowerCase()}`}>
          {item.difficulty}
        </span>
      </div>
      <h3 className="content-title">{item.title}</h3>
      <p className="content-desc">{item.description}</p>
      <div className="content-meta">
        <span className="meta-tag">{item.subject}</span>
        <span className="meta-tag">{LANG_LABELS[item.language] || item.language}</span>
        <span className="meta-tag">Age {item.age_min}–{item.age_max}</span>
        <span className="meta-tag">Grade {(item.grades || []).join('–')}</span>
        <span className="meta-tag">⏱ {item.duration_min || 20} min</span>
      </div>
      {started && (
        <div className="student-card-progress-row">
          <div className="student-continue-track">
            <div
              className="student-continue-fill"
              style={{ width: `${progress.progress_pct || 0}%` }}
            />
          </div>
          <span className="student-continue-pct">
            {progress.status === 'completed' ? '✓ Completed' : `${progress.progress_pct || 0}%`}
          </span>
        </div>
      )}
      <div className="content-actions">
        <button className="btn-primary" onClick={() => onStart(item)}>
          {started && progress.status !== 'completed' ? '▶ Continue' : 'Start Learning'}
        </button>
      </div>
    </article>
  );
}

export default function StudentLearn() {
  const [student, setStudent] = useState(() => getCurrentStudent());
  const [content, setContent] = useState(() => LocalStore.getContent());
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [activeContent, setActiveContent] = useState(null);

  function refresh() {
    setStudent(getCurrentStudent());
    setContent(LocalStore.getContent());
  }

  useEffect(() => LocalStore.subscribe(refresh), []);

  const progressByContent = useMemo(() => {
    const map = {};
    getMyProgress().forEach((p) => {
      map[p.content_id] = p;
    });
    return map;
    // Re-derive when content/store changes
  }, [content]);

  const recommended = useMemo(() => getMyRecommendations(content, 3), [content]);

  const filtered = useMemo(() => {
    const q = filters.q.trim().toLowerCase();
    return content.filter((c) => {
      if (q && !`${c.title} ${c.description} ${c.topic || ''}`.toLowerCase().includes(q)) return false;
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

  const setFilter = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const myLangLabel = student ? LANG_LABELS[student.language] || student.language : '';

  return (
    <div className="page-content student-page">
      {/* Header + language selector */}
      <div className="page-head">
        <div>
          <h1 className="page-title">Learn</h1>
          <p className="page-subtitle">
            Activities picked for your level{student ? ` • ${myLangLabel} learner` : ''}
          </p>
        </div>
        <div className="student-lang-selector" role="group" aria-label="Preferred language">
          <span className="student-lang-label">🌐 Language</span>
          {QUICK_LANGUAGES.map((l) => (
            <button
              key={l.code}
              className={`student-lang-btn ${filters.language === l.code ? 'is-active' : ''}`}
              onClick={() =>
                setFilters((f) => ({
                  ...f,
                  language: f.language === l.code ? '' : l.code,
                }))
              }
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended for You */}
      {recommended.length > 0 && (
        <section className="panel panel-recommended student-rec-panel">
          <div className="panel-header">
            <h2>🌟 Recommended for You</h2>
            <span className="benchmark-note">
              {student ? `for ${student.name.split(' ')[0]} • ` : ''}
              age/grade + level + performance + gap + language
            </span>
          </div>
          <div className="content-grid student-rec-grid">
            {recommended.map((rec) => (
              <article key={rec.content._id} className="content-card student-rec-card">
                <div className="content-card-top">
                  <span className="content-type-chip">{rec.content.type}</span>
                  <span className={`difficulty-chip diff-${rec.content.difficulty.toLowerCase()}`}>
                    {rec.content.difficulty}
                  </span>
                </div>
                <h3 className="content-title">{rec.content.title}</h3>
                <p className="content-desc">{rec.content.description}</p>
                <div className="content-meta">
                  <span className="meta-tag">{rec.content.subject}</span>
                  <span className="meta-tag">{LANG_LABELS[rec.content.language] || rec.content.language}</span>
                  <span className="meta-tag">⏱ {rec.content.duration_min || 20} min</span>
                </div>
                {rec.reasons?.length > 0 && (
                  <div className="student-recommend-why">✨ {rec.reasons.slice(0, 2).join(' • ')}</div>
                )}
                <div className="content-actions">
                  <button className="btn-primary" onClick={() => setActiveContent(rec.content)}>
                    Start Learning
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* Search + filters */}
      <div className="filter-panel">
        <div className="search-wrapper">
          <span className="search-icon" aria-hidden="true">🔍</span>
          <input
            className="search-input"
            placeholder="Search activities…"
            value={filters.q}
            onChange={setFilter('q')}
          />
        </div>
        <div className="filter-controls-row">
          <select className="select-control" value={filters.subject} onChange={setFilter('subject')} aria-label="Subject filter">
            <option value="">All Subjects</option>
            {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="select-control" value={filters.ageGroup} onChange={setFilter('ageGroup')} aria-label="Age filter">
            <option value="">All Ages</option>
            {AGE_GROUPS.map((a) => <option key={a.key} value={a.key}>{a.label}</option>)}
          </select>
          <select className="select-control" value={filters.grade} onChange={setFilter('grade')} aria-label="Grade filter">
            <option value="">All Grades</option>
            {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
          <select className="select-control" value={filters.difficulty} onChange={setFilter('difficulty')} aria-label="Difficulty filter">
            <option value="">All Levels</option>
            {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="select-control" value={filters.language} onChange={setFilter('language')} aria-label="Language filter">
            <option value="">All Languages</option>
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
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
          Showing <strong>{filtered.length}</strong> of {content.length} activities
        </span>
      </div>

      {/* Cards */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔎</div>
          <div className="empty-state-title">No activities match your filters</div>
          <div className="empty-state-desc">Try a different subject, language or level.</div>
        </div>
      ) : (
        <div className="content-grid">
          {filtered.map((c) => (
            <ContentCard
              key={c._id}
              item={c}
              progress={progressByContent[c._id]}
              onStart={(item) => setActiveContent(item)}
            />
          ))}
        </div>
      )}

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
