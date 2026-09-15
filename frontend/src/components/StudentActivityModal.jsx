/**
 * Student-profile activity modal.
 * Opens a piece of learning content as a step-by-step activity, saves
 * progress to LocalStore and logs daily activity minutes (streak driver).
 *
 * Reuses the existing Modal shell + preview styles from index.css.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { LocalStore, SKILL_LABELS, LANG_LABELS } from '../data/mockData.js';
import { getMyProgress } from '../utils/student.js';

/** Split content.body into steps; fall back to one step with the raw text. */
function buildSteps(body) {
  const lines = String(body || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const numbered = lines.filter((l) => /^(\d+[).:]|[-•*])\s+/.test(l));
  if (numbered.length >= 2) {
    // Keep the lead-in (passage/instructions) with step 1
    const firstIdx = lines.indexOf(numbered[0]);
    const lead = lines.slice(0, firstIdx).join('\n');
    return numbered.map((l, i) => ({
      title: `Step ${i + 1} of ${numbered.length}`,
      text: (i === 0 && lead ? lead + '\n\n' : '') + l.replace(/^(\d+[).:]|[-•*])\s+/, ''),
    }));
  }
  return [{ title: 'Your activity', text: String(body || 'No content yet.') }];
}

export default function StudentActivityModal({ content, onClose }) {
  const steps = useMemo(() => buildSteps(content.body), [content]);
  const existing = useMemo(
    () => getMyProgress().find((p) => String(p.content_id) === String(content._id)),
    [content._id]
  );

  const [stepIdx, setStepIdx] = useState(() => {
    if (existing && existing.status !== 'completed' && existing.last_step) {
      return Math.min(existing.last_step, steps.length - 1);
    }
    return 0;
  });
  const [completed, setCompleted] = useState(existing?.status === 'completed');
  const [lastAward, setLastAward] = useState(null);
  const bodyRef = useRef(null);

  function persistWith(idx) {
    const pct = Math.round(((idx + 1) / steps.length) * 100);
    const rec = LocalStore.upsertStudentProgress({
      content_id: content._id,
      progress_pct: pct,
      last_step: idx + 1,
      total_steps: steps.length,
      status: idx + 1 >= steps.length ? 'completed' : 'in-progress',
    });
    LocalStore.logStudentActivity(1);
    // Award "Addition Master" when the math pack is completed
    if (rec.status === 'completed' && content.skill === 'math') {
      const awarded = LocalStore.awardStudentAchievement('Addition Master');
      if (awarded) setLastAward(awarded);
    }
  }

  // Persist progress whenever the step changes (incl. on open)
  useEffect(() => {
    if (!completed) persistWith(stepIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx]);

  function goNext() {
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
    else finish();
  }

  function goPrev() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  function finish() {
    setCompleted(true);
  }

  const pct = Math.round(((stepIdx + 1) / steps.length) * 100);
  const step = steps[stepIdx];

  // Scroll step body to top on step change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [stepIdx]);

  return (
    <Modal title={content.title} icon="📚" onClose={onClose} wide>
      <div className="modal-body">
        {completed ? (
          <div className="student-activity-done">
            <div className="student-activity-done-icon">🎉</div>
            <h3 className="student-activity-done-title">Activity complete!</h3>
            <p className="student-activity-done-text">
              Great work on <strong>{content.title}</strong>. Your progress has been saved.
            </p>
            {lastAward && (
              <div className="student-achievement-toast">
                {lastAward.icon} Achievement unlocked: <strong>{lastAward.title}</strong>
              </div>
            )}
            <button className="btn-primary student-activity-done-btn" onClick={onClose}>
              Back to my learning
            </button>
          </div>
        ) : (
          <>
            {/* Progress bar */}
            <div className="student-activity-progress-row">
              <div className="student-activity-progress-track">
                <div className="student-activity-progress-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="student-activity-progress-label">{pct}%</span>
            </div>

            <div className="student-activity-step-head">
              <span className="student-activity-step-title">{step.title}</span>
              <span className="meta-tag">
                {content.subject} • {LANG_LABELS[content.language] || content.language}
              </span>
            </div>

            <div className="preview-body student-activity-body" ref={bodyRef}>
              <pre className="preview-body-text">{step.text}</pre>
            </div>

            <div className="student-activity-nav">
              <button className="btn-secondary" onClick={goPrev} disabled={stepIdx === 0}>
                ← Back
              </button>
              <span className="student-activity-counter">
                {stepIdx + 1} / {steps.length}
              </span>
              {stepIdx < steps.length - 1 ? (
                <button className="btn-primary" onClick={goNext}>
                  Next →
                </button>
              ) : (
                <button className="btn-primary" onClick={finish}>
                  ✓ Finish
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
