/**
 * Test-results modal.
 * Shows score/percentage, correct vs incorrect answers, time taken, topics
 * needing improvement, and learning content matched to the missed skills.
 *
 * Reuses the existing Modal shell + difficulty-chip/meta-tag styles.
 */

import { useMemo, useState } from 'react';
import Modal from './Modal.jsx';
import { LANG_LABELS } from '../data/mockData.js';
import { getContentForTestSkills } from '../utils/student.js';
import StudentActivityModal from './StudentActivityModal.jsx';

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, '0')}s`;
}

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

export default function TestResultsModal({ test, attempt, onClose, onRetry }) {
  const questions = useMemo(() => test.questions || [], [test]);
  const missedTopics = useMemo(() => {
    const topics = [];
    questions.forEach((q, i) => {
      if (attempt.answers[i] !== q.answer) topics.push(q.topic);
    });
    return topics;
  }, [questions, attempt]);

  const recommendedContent = useMemo(
    () => getContentForTestSkills([{ test, attempt }]),
    [test, attempt]
  );

  const [activeContent, setActiveContent] = useState(null);
  if (activeContent) {
    return (
      <StudentActivityModal
        content={activeContent}
        onClose={() => setActiveContent(null)}
      />
    );
  }

  const score = attempt.score;
  const total = attempt.total;
  const pct = attempt.pct;
  const tone = pct >= 80 ? 'great' : pct >= 50 ? 'ok' : 'rough';

  const headline = {
    great: { icon: '🏆', title: 'Excellent work!' },
    ok: { icon: '👍', title: 'Good effort — keep practicing!' },
    rough: { icon: '💪', title: 'Keep going — practice makes progress!' },
  }[tone];

  return (
    <Modal title={`${test.title} — Results`} icon="🏁" onClose={onClose} wide>
      <div className="modal-body">
        {/* Score summary */}
        <div className={`test-result-summary test-result-${tone}`}>
          <div className="test-result-ring">
            <span className="test-result-pct">{pct}%</span>
            <span className="test-result-frac">{score}/{total}</span>
          </div>
          <div className="test-result-badges">
            <span className="test-result-icon">{headline.icon}</span>
            <span className="test-result-title">{headline.title}</span>
            <span className="test-result-time">⏱ Time taken: {fmtTime(attempt.time_taken_sec)}</span>
          </div>
        </div>

        {/* Weak topics */}
        {missedTopics.length > 0 ? (
          <div className="test-weak-panel">
            <h3 className="test-weak-title">🎯 Topics to practice</h3>
            <div className="test-weak-chips">
              {missedTopics.map((t, i) => (
                <span key={i} className="test-weak-chip">{t}</span>
              ))}
            </div>
          </div>
        ) : (
          <div className="test-weak-panel test-weak-perfect">
            <h3 className="test-weak-title">🌟 Perfect score!</h3>
            <p className="test-confirm-text">No mistakes — every topic mastered in this test.</p>
          </div>
        )}

        {/* Recommended learning content from the same recommender */}
        {recommendedContent.length > 0 && (
          <div className="test-rec-panel">
            <h3 className="test-rec-title">📚 Recommended learning for you</h3>
            <div className="test-rec-list">
              {recommendedContent.map((rec) => (
                <button key={rec.content._id} className="test-rec-item" onClick={() => setActiveContent(rec.content)}>
                  <span className="content-type-chip">{rec.content.type}</span>
                  <span className="test-rec-item-title">{rec.content.title}</span>
                  <span className="test-rec-item-meta">
                    {rec.content.subject} • {LANG_LABELS[rec.content.language] || rec.content.language} • ⏱ {rec.content.duration_min || 20} min
                  </span>
                  <span className="test-rec-item-arrow">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answer-by-answer breakdown */}
        <div className="test-breakdown">
          <h3 className="test-breakdown-title">Your answers</h3>
          {questions.map((q, i) => {
            const chosen = attempt.answers[i];
            const correct = chosen === q.answer;
            return (
              <div key={i} className={`test-breakdown-row ${correct ? 'is-correct' : 'is-wrong'}`}>
                <div className="test-breakdown-head">
                  <span className={`test-breakdown-mark ${correct ? 'is-correct' : 'is-wrong'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <span className="test-breakdown-topic">{q.topic}</span>
                  <span className="test-breakdown-qnum">Q{i + 1}</span>
                </div>
                <p className="test-breakdown-prompt">{q.prompt}</p>
                <div className="test-breakdown-answers">
                  <span className="test-breakdown-answer">
                    Your answer: <strong>{chosen != null ? `${LETTERS[chosen]}. ${q.options[chosen]}` : '— blank —'}</strong>
                  </span>
                  {!correct && (
                    <span className="test-breakdown-answer is-correct-answer">
                      Correct: <strong>{LETTERS[q.answer]}. {q.options[q.answer]}</strong>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="test-result-actions">
          <button className="btn-secondary" onClick={onRetry}>
            🔄 Retry Test
          </button>
          <button className="btn-primary" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
