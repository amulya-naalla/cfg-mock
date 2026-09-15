/**
 * Interactive Student Activity & Quiz Modal.
 * Allows students to read passage/prompts, type or select answers for practice questions,
 * receive instant feedback, score points, and persist completed progress.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import Modal from './Modal.jsx';
import { LocalStore, LANG_LABELS } from '../data/mockData.js';
import { getMyProgress } from '../utils/student.js';

/** Parse content.body into structured interactive steps/questions */
function buildInteractiveSteps(body) {
  const lines = String(body || '')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const questions = [];
  let leadContext = '';

  // Find line index where questions start
  const firstQIdx = lines.findIndex((l) => /^(\d+[\).:]?|[-•*])\s+/.test(l));

  if (firstQIdx > 0) {
    leadContext = lines.slice(0, firstQIdx).join('\n');
  } else if (firstQIdx === -1 && lines.length > 0) {
    leadContext = lines[0];
  }

  const questionLines = firstQIdx >= 0 ? lines.slice(firstQIdx) : lines;

  questionLines.forEach((line, idx) => {
    const cleanLine = line.replace(/^(\d+[\).:]?|[-•*])\s+/, '');
    
    // Check if simple math expression like "12 + 7 = __" or "25 + 14 = __"
    const mathMatch = cleanLine.match(/(\d+)\s*([\+\-\−×\*\/])\s*(\d+)/);
    let expected = null;
    let isMath = false;

    if (mathMatch) {
      isMath = true;
      const n1 = parseInt(mathMatch[1], 10);
      const op = mathMatch[2];
      const n2 = parseInt(mathMatch[3], 10);
      if (op === '+' || op === 'add') expected = n1 + n2;
      else if (op === '-' || op === '−') expected = n1 - n2;
      else if (op === '*' || op === '×') expected = n1 * n2;
      else if (op === '/') expected = Math.floor(n1 / n2);
    }

    questions.push({
      id: `q-${idx}`,
      number: idx + 1,
      text: cleanLine,
      isMath,
      expected: expected !== null ? String(expected) : null,
    });
  });

  if (questions.length === 0) {
    questions.push({
      id: 'q-0',
      number: 1,
      text: String(body || 'Practice completing this module.'),
      isMath: false,
      expected: null,
    });
  }

  return { leadContext, questions };
}

export default function StudentActivityModal({ content, onClose }) {
  const { leadContext, questions } = useMemo(() => buildInteractiveSteps(content.body), [content.body]);
  const existing = useMemo(
    () => getMyProgress().find((p) => String(p.content_id) === String(content._id)),
    [content._id]
  );

  const [stepIdx, setStepIdx] = useState(() => {
    if (existing && existing.status !== 'completed' && existing.last_step) {
      return Math.min(existing.last_step - 1, questions.length - 1);
    }
    return 0;
  });

  const [userAnswers, setUserAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [completed, setCompleted] = useState(existing?.status === 'completed');
  const [lastAward, setLastAward] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);
  const bodyRef = useRef(null);

  const q = questions[stepIdx];
  const pct = Math.round(((stepIdx + 1) / questions.length) * 100);

  function handleAnswerChange(val) {
    setUserAnswers((prev) => ({ ...prev, [q.id]: val }));
  }

  function submitCurrentAnswer() {
    const val = (userAnswers[q.id] || '').trim();
    if (!val) return;

    let isCorrect = false;
    if (q.expected !== null) {
      isCorrect = String(val) === String(q.expected);
    } else {
      isCorrect = val.length > 0;
    }

    setSubmittedAnswers((prev) => {
      const next = { ...prev, [q.id]: { answer: val, isCorrect } };
      // Count correct
      const numCorrect = Object.values(next).filter((a) => a.isCorrect).length;
      setCorrectCount(numCorrect);
      return next;
    });
  }

  function persistProgress(idx) {
    const progressPct = Math.round(((idx + 1) / questions.length) * 100);
    const rec = LocalStore.upsertStudentProgress({
      content_id: content._id,
      progress_pct: progressPct,
      last_step: idx + 1,
      total_steps: questions.length,
      status: idx + 1 >= questions.length ? 'completed' : 'in-progress',
    });
    LocalStore.logStudentActivity(1);

    if (rec.status === 'completed' && content.subject?.toLowerCase() === 'math') {
      const awarded = LocalStore.awardStudentAchievement('Addition Master');
      if (awarded) setLastAward(awarded);
    }
  }

  function goNext() {
    // If current question not submitted yet, auto submit
    if (userAnswers[q.id] && submittedAnswers[q.id] == null) {
      submitCurrentAnswer();
    }
    if (stepIdx < questions.length - 1) {
      const nextIdx = stepIdx + 1;
      setStepIdx(nextIdx);
      persistProgress(nextIdx);
    } else {
      finish();
    }
  }

  function goPrev() {
    if (stepIdx > 0) {
      setStepIdx((i) => i - 1);
    }
  }

  function finish() {
    persistProgress(questions.length - 1);
    setCompleted(true);
  }

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = 0;
  }, [stepIdx]);

  return (
    <Modal title={content.title} icon="📚" onClose={onClose} wide>
      <div className="modal-body">
        {completed ? (
          <div className="student-activity-done">
            <div className="student-activity-done-icon">🎉</div>
            <h3 className="student-activity-done-title">Practice Complete!</h3>
            <p className="student-activity-done-text">
              Great effort on <strong>{content.title}</strong>! You answered {correctCount} of {questions.length} questions.
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
              <span className="student-activity-step-title">
                Question {stepIdx + 1} of {questions.length}
              </span>
              <span className="meta-tag">
                {content.subject} • {LANG_LABELS[content.language] || content.language}
              </span>
            </div>

            <div className="preview-body student-activity-body" ref={bodyRef}>
              {leadContext && (
                <div className="interactive-lead-context">
                  <strong>📖 Instructions / Passage:</strong>
                  <p>{leadContext}</p>
                </div>
              )}

              <div className="interactive-question-box">
                <h3 className="question-prompt-text">{q.text}</h3>

                {/* Answer Input Section */}
                <div className="interactive-answer-section">
                  <label htmlFor={`q-input-${q.id}`} className="answer-input-label">
                    ✏️ Your Answer:
                  </label>
                  <div className="answer-input-group">
                    <input
                      id={`q-input-${q.id}`}
                      type={q.isMath ? 'number' : 'text'}
                      className="student-answer-input"
                      placeholder={q.isMath ? 'e.g. 19' : 'Type your answer here...'}
                      value={userAnswers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') submitCurrentAnswer();
                      }}
                      disabled={submittedAnswers[q.id] != null}
                    />
                    {submittedAnswers[q.id] == null ? (
                      <button
                        type="button"
                        className="btn-primary submit-answer-btn"
                        onClick={submitCurrentAnswer}
                        disabled={!(userAnswers[q.id] || '').trim()}
                      >
                        Submit Answer ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary edit-answer-btn"
                        onClick={() => {
                          setSubmittedAnswers((prev) => {
                            const copy = { ...prev };
                            delete copy[q.id];
                            return copy;
                          });
                        }}
                      >
                        Change Answer ✏️
                      </button>
                    )}
                  </div>
                </div>

                {/* Feedback Toast */}
                {submittedAnswers[q.id] != null && (
                  <div className={`answer-feedback-card ${submittedAnswers[q.id].isCorrect ? 'is-correct' : 'is-submitted'}`}>
                    {submittedAnswers[q.id].isCorrect ? (
                      <div className="feedback-content">
                        <span className="feedback-icon">🎉</span>
                        <div>
                          <strong>Correct Answer!</strong>
                          <p>Outstanding work! You solved this question correctly (+10 pts).</p>
                        </div>
                      </div>
                    ) : (
                      <div className="feedback-content">
                        <span className="feedback-icon">🌟</span>
                        <div>
                          <strong>Answer Saved!</strong>
                          <p>Your response: &quot;{submittedAnswers[q.id].answer}&quot; has been recorded.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="student-activity-nav">
              <button className="btn-secondary" onClick={goPrev} disabled={stepIdx === 0}>
                ← Back
              </button>
              <span className="student-activity-counter">
                {stepIdx + 1} / {questions.length}
              </span>
              {stepIdx < questions.length - 1 ? (
                <button className="btn-primary" onClick={goNext}>
                  Next Question →
                </button>
              ) : (
                <button className="btn-primary" onClick={finish}>
                  ✓ Complete Activity
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
