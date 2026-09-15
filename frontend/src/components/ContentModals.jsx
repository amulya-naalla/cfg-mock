/**
 * Content page modals: Preview, Assign, and Create Content (+ AI assist stubs).
 * AI actions are clearly labelled as drafts for the educator to review/edit —
 * AI assists, it doesn't replace educator decisions.
 */

import { useMemo, useState } from 'react';
import Modal, { Field, FormError } from './Modal.jsx';
import {
  LocalStore,
  SKILL_LABELS,
  LANG_LABELS,
  LANGUAGES,
  SUBJECTS,
  DIFFICULTIES,
  CONTENT_TYPES,
  GRADES,
} from '../data/mockData.js';
import { studentMeta } from '../utils/adaptive.js';

// ---------------------------------------------------------------------------
// Preview
// ---------------------------------------------------------------------------

export function PreviewModal({ content, onClose, onAssign }) {
  return (
    <Modal title={content.title} icon="👁️" onClose={onClose} wide>
      <div className="modal-body">
        <div className="preview-meta-row">
          <span className="meta-tag">{content.subject}</span>
          <span className="meta-tag">{LANG_LABELS[content.language] || content.language}</span>
          <span className="meta-tag">Age {content.age_min}–{content.age_max}</span>
          <span className="meta-tag">Grade {content.grades.join('–')}</span>
          <span className="meta-tag">{content.difficulty}</span>
          <span className="meta-tag">Skill: {SKILL_LABELS[content.skill] || content.skill}</span>
          <span className="meta-tag">⏱ {content.duration_min || 20} min</span>
        </div>
        <p className="preview-description">{content.description}</p>
        <div className="preview-body">
          <pre className="preview-body-text">{content.body || 'No body text yet — use the editor to add the lesson content.'}</pre>
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={onClose}>Close</button>
        <button className="btn-primary" onClick={onAssign}>Assign to Student</button>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Assign
// ---------------------------------------------------------------------------

export function AssignModal({ content, onClose, onAssigned }) {
  const students = useMemo(() => LocalStore.getStudents(), []);
  const [studentId, setStudentId] = useState('');
  const [search, setSearch] = useState('');
  const [filterFlagged, setFilterFlagged] = useState(false);
  const [error, setError] = useState('');

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterFlagged && !s.flagged) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = s.name.toLowerCase().includes(q);
        const matchGrade = String(s.grade || '').includes(q);
        const matchCluster = String(s.cluster || '').toLowerCase().includes(q);
        const matchLang = String(s.language || '').toLowerCase().includes(q);
        return matchName || matchGrade || matchCluster || matchLang;
      }
      return true;
    });
  }, [students, search, filterFlagged]);

  const selectedStudent = students.find((s) => s._id === studentId);

  function handleSubmit(e) {
    e.preventDefault();
    if (!studentId) {
      setError('Please select a student from the list.');
      return;
    }
    LocalStore.addAssignment({ content_id: content._id, student_id: studentId });
    onAssigned?.(selectedStudent, content);
    onClose();
  }

  return (
    <Modal title="Assign Content to Student" icon="📚" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <div className="assign-content-summary">
            <strong>{content.title}</strong>
            <span>{content.subject} • {LANG_LABELS[content.language] || content.language} • {content.difficulty} • {content.duration_min || 20} min</span>
          </div>
          <FormError message={error} />

          {/* Search & Filter Toolbar */}
          <div className="assign-student-toolbar">
            <div className="assign-search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="assign-search-input"
                placeholder="Search student by name, grade, or cluster..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className="clear-search-btn" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
            <button
              type="button"
              className={`assign-filter-pill ${filterFlagged ? 'active' : ''}`}
              onClick={() => setFilterFlagged((prev) => !prev)}
            >
              ⚠️ Needs Attention ({students.filter((s) => s.flagged).length})
            </button>
          </div>

          {/* Custom Student Selector Grid */}
          <div className="assign-student-picker-container">
            {filteredStudents.length === 0 ? (
              <div className="assign-empty-state">
                No students match &quot;{search}&quot;. Try clearing filters.
              </div>
            ) : (
              <div className="assign-student-grid">
                {filteredStudents.map((s) => {
                  const isSelected = s._id === studentId;
                  const initials = s.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
                  return (
                    <div
                      key={s._id}
                      className={`assign-student-card ${isSelected ? 'is-selected' : ''}`}
                      onClick={() => {
                        setStudentId(s._id);
                        setError('');
                      }}
                    >
                      <div className="assign-student-avatar">{initials}</div>
                      <div className="assign-student-info">
                        <span className="assign-student-name">{s.name}</span>
                        <span className="assign-student-meta">
                          Grade {s.grade} • Age {s.age || '?'} • Cluster {s.cluster || 'A'} • {LANG_LABELS[s.language] || s.language}
                        </span>
                      </div>
                      <div className="assign-student-badge-col">
                        {s.flagged && <span className="flagged-badge">⚠️ Flagged</span>}
                        <div className={`assign-checkbox ${isSelected ? 'checked' : ''}`}>
                          {isSelected ? '✓' : ''}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="assign-selected-banner">
              🎯 Ready to assign to <strong>{selectedStudent.name}</strong> (Grade {selectedStudent.grade}, {LANG_LABELS[selectedStudent.language] || selectedStudent.language})
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={!studentId}>
            Assign Content
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Create Content (+ AI assists)
// ---------------------------------------------------------------------------

// Simple, deterministic "AI" generators — stand-ins for the real LLM backend.
// Always produce editable drafts, never auto-saved.
function generateExplanation(form) {
  const topic = form.title || form.topic || 'this topic';
  return (
    `What you will learn today: ${topic}.\n\n` +
    `1. Start with something familiar: connect ${topic} to an object or event from daily life.\n` +
    `2. Show one clear example, step by step, speaking aloud.\n` +
    `3. Ask the student to repeat the example in their own words.\n` +
    `4. Try a second example together, with the student leading.\n\n` +
    `Tip: keep sentences short and check understanding after every step.`
  );
}

function generateQuestions(form) {
  const topic = form.title || form.topic || 'the topic';
  return (
    `Practice questions on ${topic}:\n\n` +
    `1) Warm-up: What is ${topic} in your own words?\n` +
    `2) Now try: (write 2 practice problems at the student's level)\n` +
    `3) Challenge: (write 1 harder problem)\n` +
    `4) Real life: Where have you seen ${topic} outside school?`
  );
}

function generateSimplified(original) {
  const base = (original || '').trim();
  if (!base) return 'Add some content first, then simplify it.';
  return (
    base
      .split(/(?<=[.!?])\s+/)
      .map((s) => `• ${s}`)
      .join('\n') +
    `\n\n(Each idea on its own line. Read one line at a time together.)`
  );
}

function generateActivity(form) {
  const topic = form.title || form.topic || 'the topic';
  return (
    `Activity: ${topic} in our world\n\n` +
    `1. Find 3 things around you connected to ${topic}.\n` +
    `2. Draw one of them and label it.\n` +
    `3. Explain your drawing to a partner in 2 sentences.\n` +
    `4. Together, list one more question you want to explore next time.`
  );
}

const AI_ACTIONS = [
  { key: 'explanation', label: '✨ Generate explanation' },
  { key: 'questions', label: '✨ Generate practice questions' },
  { key: 'simplify', label: '✨ Simplify content' },
  { key: 'activity', label: '✨ Generate activity' },
];

export function CreateContentModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: '',
    subject: 'Reading',
    age_min: '8',
    age_max: '10',
    grade: '4',
    difficulty: 'Beginner',
    language: 'en',
    topic: '',
    type: 'Explanation',
    skill: 'reading',
    duration_min: '20',
    description: '',
    body: '',
  });
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function runAiAction(action) {
    setAiStatus('Generating draft…');
    // Simulated latency so the educator sees the "AI is working" state
    setTimeout(() => {
      if (action === 'explanation') {
        setForm((f) => ({ ...f, body: generateExplanation(f) }));
        setAiStatus('Draft explanation added below — please review and edit.');
      } else if (action === 'questions') {
        setForm((f) => ({ ...f, body: generateQuestions(f) }));
        setAiStatus('Draft questions added below — please review and edit.');
      } else if (action === 'simplify') {
        setForm((f) => ({ ...f, body: generateSimplified(f.body) }));
        setAiStatus('Simplified draft ready — please review before saving.');
      } else if (action === 'activity') {
        setForm((f) => ({ ...f, body: generateActivity(f) }));
        setAiStatus('Draft activity added below — please review and edit.');
      }
    }, 450);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Please give the content a title.');
      return;
    }
    if (Number(form.age_max) < Number(form.age_min)) {
      setError('Maximum age must be greater than or equal to minimum age.');
      return;
    }
    const item = LocalStore.addContent({
      ...form,
      grades: [form.grade],
    });
    onCreated?.(item);
    onClose();
  }

  return (
    <Modal title="Create Content" icon="✨" onClose={onClose} wide>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p className="modal-subtitle">
            AI can draft material for you — always review and adapt it before assigning to a student.
          </p>
          <FormError message={error} />

          <Field label="Title">
            <input className="form-input" value={form.title} onChange={set('title')} placeholder="e.g. Reading Comprehension – Beginner" />
          </Field>

          <div className="form-grid-2">
            <Field label="Subject">
              <select className="form-input select-input" value={form.subject} onChange={set('subject')}>
                {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Language">
              <select className="form-input select-input" value={form.language} onChange={set('language')}>
                {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
              </select>
            </Field>
          </div>

          <div className="form-grid-3">
            <Field label="Age from">
              <input className="form-input" type="number" min="4" max="18" value={form.age_min} onChange={set('age_min')} />
            </Field>
            <Field label="Age to">
              <input className="form-input" type="number" min="4" max="18" value={form.age_max} onChange={set('age_max')} />
            </Field>
            <Field label="Grade">
              <select className="form-input select-input" value={form.grade} onChange={set('grade')}>
                {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
              </select>
            </Field>
          </div>

          <div className="form-grid-2">
            <Field label="Difficulty">
              <select className="form-input select-input" value={form.difficulty} onChange={set('difficulty')}>
                {DIFFICULTIES.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Content type">
              <select className="form-input select-input" value={form.type} onChange={set('type')}>
                {CONTENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
          </div>

          <div className="form-grid-2">
            <Field label="Topic">
              <input className="form-input" value={form.topic} onChange={set('topic')} placeholder="e.g. Understanding fractions" />
            </Field>
            <Field label="Skill it supports">
              <select className="form-input select-input" value={form.skill} onChange={set('skill')}>
                {Object.entries(SKILL_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="form-grid-2">
            <Field label="Estimated duration (minutes)">
              <input
                className="form-input"
                type="number"
                min="5"
                max="120"
                step="5"
                value={form.duration_min}
                onChange={set('duration_min')}
                placeholder="e.g. 20"
              />
            </Field>
            <Field label="Short description (optional)">
              <input className="form-input" value={form.description} onChange={set('description')} placeholder="One line shown on the content card" />
            </Field>
          </div>

          <Field label="Content body">
            <textarea
              className="form-input"
              rows="7"
              value={form.body}
              onChange={set('body')}
              placeholder="Write the lesson, questions or activity here…"
            />
          </Field>

          {/* AI assists */}
          <div className="ai-assist-box">
            <div className="ai-assist-header">
              <span className="ai-assist-title">🤖 AI Assist (optional)</span>
              <span className="ai-assist-note">Drafts for you to review — nothing is auto-saved</span>
            </div>
            <div className="ai-assist-actions">
              {AI_ACTIONS.map((a) => (
                <button key={a.key} type="button" className="ai-btn" onClick={() => runAiAction(a.key)}>
                  {a.label}
                </button>
              ))}
              <button
                type="button"
                className="ai-btn"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    language: f.language === 'en' ? 'hi' : 'en',
                  }))
                }
                title="Demo stand-in for the translation service"
              >
                ✨ Translate to local language
              </button>
            </div>
            {aiStatus && <p className="ai-status">{aiStatus}</p>}
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save Content</button>
        </div>
      </form>
    </Modal>
  );
}
