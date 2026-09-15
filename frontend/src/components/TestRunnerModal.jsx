/**
 * Test-taking modal.
 * Walks the student through an MCQ test one question at a time, tracks
 * elapsed time, and saves the attempt to LocalStore on submit.
 *
 * Reuses the existing Modal shell + activity/progress styles from index.css.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { LocalStore, LANG_LABELS } from '../data/mockData.js';
import { getCurrentStudent } from '../utils/student.js';
import TestResultsModal from './TestResultsModal.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function TestRunnerModal({ test, onClose }) {
  const questions = useMemo(() => test.questions || [], [test]);
  const student = useMemo(() => getCurrentStudent(), []);

  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState(() => questions.map(() => null));
  const [confirming, setConfirming] = useState(false);
  const [attempt, setAttempt] = useState(null);
  const startedAt = useRef(Date.now());
  const bodyRef = useRef(null);

  // Scroll question into view on step change
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [stepIdx]);

  const answeredCount = answers.filter((a) => a != null).length;
  const pct = Math.round(((stepIdx + 1) / questions.length) * 100);

  function choose(optionIdx) {
    setAnswers((prev) => {
      const next = [...prev];
      next[stepIdx] = optionIdx;
      return next;
    });
  }

  function goNext() {
    if (stepIdx < questions.length - 1) setStepIdx((i) => i + 1);
    else setConfirming(true);
  }

  function goPrev() {
    if (stepIdx > 0) setStepIdx((i) => i - 1);
  }

  function submit() {
    const durationSec = Math.max(1, Math.round((Date.now() - startedAt.current) / 1000));
    const score = questions.reduce(
      (s, q, i) => s + (answers[i] === q.answer ? 1 : 0),
      0
    );
    const saved = LocalStore.addTestAttempt({
      test_id: test._id,
      student_id: student?._id,
      answers,
      score,
      total: questions.length,
      pct: questions.length ? Math.round((score / questions.length) * 100) : 0,
      time_taken_sec: durationSec,
    });
    setAttempt(saved);
    setConfirming(false);
  }

  // ----- Results view -----
  if (attempt) {
    return <TestResultsModal test={test} attempt={attempt} onClose={onClose} onRetry={() => {
      setAttempt(null);
      setAnswers(questions.map(() => null));
      setStepIdx(0);
      startedAt.current = Date.now();
    }} />;
  }

  // ----- Submit confirmation view -----
  if (confirming) {
    const unanswered = questions.length - answeredCount;
    return (
      <Modal title="Submit Test" icon="📤" onClose={() => setConfirming(false)}>
        <div className="modal-body">
          <div className="test-confirm">
            <div className="test-confirm-icon">🧐</div>
            <h3 className="test-confirm-title">Submit your test?</h3>
            <p className="test-confirm-text">
              You answered <strong>{answeredCount}</strong> of <strong>{questions.length}</strong> questions
              {unanswered > 0 && (
                <> — <strong className="test-confirm-warn">{unanswered} left blank</strong>. Blank answers are marked wrong.</>
              )}
              {unanswered === 0 && ' — great job reviewing every question!'}
            </p>
            <div className="test-confirm-actions">
              <button className="btn-secondary" onClick={() => setConfirming(false)}>
                ← Keep working
              </button>
              <button className="btn-primary" onClick={submit}>
                ✓ Submit Test
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const q = questions[stepIdx];

  // ----- Question view -----
  return (
    <Modal title={test.title} icon="📝" onClose={onClose} wide>
      <div className="modal-body">
        {/* Progress */}
        <div className="student-activity-progress-row">
          <div className="student-activity-progress-track">
            <div className="student-activity-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="student-activity-progress-label">
            Q {stepIdx + 1}/{questions.length}
          </span>
        </div>

        <div className="student-activity-step-head">
          <span className="student-activity-step-title">Question {stepIdx + 1}</span>
          <span className="meta-tag">
            {test.subject} • {LANG_LABELS[test.language] || test.language} • {test.difficulty}
          </span>
        </div>

        <div className="preview-body student-activity-body" ref={bodyRef}>
          <p className="test-question-prompt">{q.prompt}</p>
          <div className="test-options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`test-option ${answers[stepIdx] === i ? 'is-selected' : ''}`}
                onClick={() => choose(i)}
              >
                <span className="test-option-letter">{LETTERS[i]}</span>
                <span className="test-option-text">{opt}</span>
                {answers[stepIdx] === i && <span className="test-option-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Question dots + nav */}
        <div className="test-dots-row">
          {questions.map((_, i) => (
            <button
              key={i}
              className={`test-dot ${i === stepIdx ? 'is-current' : ''} ${answers[i] != null ? 'is-answered' : ''}`}
              onClick={() => setStepIdx(i)}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <div className="student-activity-nav">
          <button className="btn-secondary" onClick={goPrev} disabled={stepIdx === 0}>
            ← Previous
          </button>
          <span className="student-activity-counter">
            {answeredCount}/{questions.length} answered
          </span>
          {stepIdx < questions.length - 1 ? (
            <button className="btn-primary" onClick={goNext}>
              Next →
            </button>
          ) : (
            <button className="btn-primary" onClick={() => setConfirming(true)}>
              Submit Test
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
}
