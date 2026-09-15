/**
 * Dashboard quick-action modals: Add Student, Record Intervention, View Progress.
 * All operate on LocalStore so the demo works with or without the backend.
 */

import { useMemo, useState } from 'react';
import Modal, { Field, FormError } from './Modal.jsx';
import { GRADES, LANGUAGES, SKILL_AREAS, SKILL_LABELS, LocalStore } from '../data/mockData.js';
import { studentMeta, getAttentionPriority, PRIORITY_META } from '../utils/adaptive.js';

// ---------------------------------------------------------------------------
// Add Student
// ---------------------------------------------------------------------------

export function AddStudentModal({ onClose, onAdded }) {
  const [form, setForm] = useState({
    name: '',
    age: '',
    grade: '3',
    language: 'mr',
    primary_gap: '',
  });
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Please enter the student\u2019s name.');
      return;
    }
    const age = Number(form.age);
    if (!age || age < 4 || age > 18) {
      setError('Please enter an age between 4 and 18.');
      return;
    }
    const student = LocalStore.addStudent({ ...form, age });
    onAdded?.(student);
    onClose();
  }

  return (
    <Modal title="Add Student" icon="➕" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p className="modal-subtitle">
            New students start unflagged. Assessments will surface their learning gaps automatically.
          </p>
          <FormError message={error} />
          <Field label="Student name">
            <input
              className="form-input"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Anita Bhosale"
              autoFocus
            />
          </Field>
          <div className="form-grid-2">
            <Field label="Age">
              <input
                className="form-input"
                type="number"
                min="4"
                max="18"
                value={form.age}
                onChange={set('age')}
                placeholder="e.g. 9"
              />
            </Field>
            <Field label="Grade">
              <select className="form-input select-input" value={form.grade} onChange={set('grade')}>
                {GRADES.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="form-grid-2">
            <Field label="Preferred language">
              <select className="form-input select-input" value={form.language} onChange={set('language')}>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Known learning gap (optional)">
              <select className="form-input select-input" value={form.primary_gap} onChange={set('primary_gap')}>
                <option value="">Not known yet</option>
                {SKILL_AREAS.map((s) => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Add Student</button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Record Intervention
// ---------------------------------------------------------------------------

const INTERVENTION_TYPES = [
  '1-on-1 Reading Session',
  'Math Remedial Block',
  'Peer Learning Pair',
  'At-Home Practice Plan',
  'Attendance Follow-up',
  'Other',
];

export function RecordInterventionModal({ onClose, onRecorded }) {
  const [form, setForm] = useState({ student_id: '', type: INTERVENTION_TYPES[0], other: '', notes: '' });
  const [error, setError] = useState('');
  const students = useMemo(() => LocalStore.getStudents(), []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.student_id) {
      setError('Please choose a student.');
      return;
    }
    const type = form.type === 'Other' ? form.other.trim() || 'Other' : form.type;
    if (!type) {
      setError('Please describe the intervention type.');
      return;
    }
    const intervention = LocalStore.addIntervention({
      student_id: form.student_id,
      type,
      notes: form.notes,
    });
    onRecorded?.(intervention);
    onClose();
  }

  return (
    <Modal title="Record Intervention" icon="📝" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p className="modal-subtitle">
            Log the extra support you&rsquo;re providing. Active interventions count on your dashboard.
          </p>
          <FormError message={error} />
          <Field label="Student">
            <select className="form-input select-input" value={form.student_id} onChange={set('student_id')}>
              <option value="">Choose a student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>{s.name} — {studentMeta(s)}</option>
              ))}
            </select>
          </Field>
          <Field label="Intervention type">
            <select className="form-input select-input" value={form.type} onChange={set('type')}>
              {INTERVENTION_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          {form.type === 'Other' && (
            <Field label="Describe the intervention type">
              <input className="form-input" value={form.other} onChange={set('other')} placeholder="e.g. Weekend bridge course" />
            </Field>
          )}
          <Field label="Notes (what/how often)">
            <textarea
              className="form-input"
              rows="3"
              value={form.notes}
              onChange={set('notes')}
              placeholder="e.g. Daily 20-min phonics practice for 2 weeks"
            />
          </Field>
        </div>
        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary">Save Intervention</button>
        </div>
      </form>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// View Progress
// ---------------------------------------------------------------------------

export function ViewProgressModal({ onClose }) {
  const students = useMemo(() => LocalStore.getStudents(), []);
  const assessments = useMemo(() => LocalStore.getAssessments(), []);
  const [selectedId, setSelectedId] = useState(students[0]?._id || '');

  const selected = students.find((s) => s._id === selectedId);
  const history = assessments
    .filter((a) => String(a.student_id) === String(selectedId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const priority = selected ? getAttentionPriority(selected) : null;
  const priorityMeta = priority ? PRIORITY_META[priority] : null;

  return (
    <Modal title="View Progress" icon="📈" onClose={onClose} wide>
      <div className="modal-body">
        <Field label="Choose a student">
          <select
            className="form-input select-input"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name} — {studentMeta(s)}</option>
            ))}
          </select>
        </Field>

        {selected && (
          <>
            <div className="progress-summary-row">
              <div className="progress-chip">
                <span className="progress-chip-label">Latest score</span>
                <span className={`progress-chip-value ${selected.flagged ? 'is-danger' : 'is-good'}`}>
                  {selected.last_score != null ? `${selected.last_score}/100` : '—'}
                </span>
              </div>
              <div className="progress-chip">
                <span className="progress-chip-label">Subject</span>
                <span className="progress-chip-value">{selected.last_subject || '—'}</span>
              </div>
              <div className="progress-chip">
                <span className="progress-chip-label">Status</span>
                <span className="progress-chip-value">
                  {priorityMeta ? priorityMeta.label : selected.learning_level === 'ahead' ? 'Ahead' : 'On track'}
                </span>
              </div>
              <div className="progress-chip">
                <span className="progress-chip-label">Main gap</span>
                <span className="progress-chip-value">{selected.primary_gap ? SKILL_LABELS[selected.primary_gap] : 'None noted'}</span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🗂️</div>
                <div className="empty-state-title">No assessments yet</div>
                <div className="empty-state-desc">Record an assessment to start tracking this student.</div>
              </div>
            ) : (
              <div className="progress-history">
                {history.map((a) => (
                  <div key={a._id} className={`assessment-card ${a.flagged ? 'flagged-record' : ''}`}>
                    <div>
                      <div className="asm-subject">{a.subject}</div>
                      <div className="asm-date">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                    <div className="asm-right">
                      <div className="asm-score-block">
                        <div className={`asm-score ${a.flagged ? 'danger' : ''}`}>{a.score}</div>
                        <div className="asm-total">out of 100</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <div className="modal-footer">
        <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
