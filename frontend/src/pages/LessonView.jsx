import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client from '../api/client.js';

function BackLink({ to = '/leadership', label = 'Dashboard' }) {
  return (
    <div className="topbar">
      <Link to={to} className="back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M15 6l-6 6 6 6" />
        </svg>
        {label}
      </Link>
    </div>
  );
}

function ContentSkeleton() {
  return (
    <div>
      <div className="skeleton" style={{ width: '55%', height: 36, marginBottom: 10 }} />
      <div className="skeleton" style={{ width: '30%', height: 18, marginBottom: 28 }} />
      <div className="content-columns">
        <div className="skeleton" style={{ height: 140 }} />
        <div className="skeleton" style={{ height: 140 }} />
      </div>
    </div>
  );
}

// Reused by both the parent-facing lesson link (/content/:id, no studentId — behavior
// unchanged) and the student portal (/student/:id, passes studentId + hides the
// dashboard back-link since students don't have dashboard access).
export default function ContentScreen({ contentId: contentIdProp, studentId, backLink } = {}) {
  const params = useParams();
  const id = contentIdProp || params.id;

  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    setContent(null);
    setError(null);
    setQuizAnswers([]);
    setQuizResult(null);
    const query = studentId ? `?student_id=${studentId}` : '';
    client
      .get(`/api/content/${id}${query}`)
      .then((res) => {
        setContent(res.data);
        if (Array.isArray(res.data.quiz)) {
          setQuizAnswers(new Array(res.data.quiz.length).fill(null));
        }
      })
      .catch(() => setError('Could not load this lesson.'));
  }, [id, studentId]);

  function selectQuizAnswer(qIndex, optionIndex) {
    setQuizAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
    setQuizResult(null);
  }

  async function submitQuiz() {
    setSubmittingQuiz(true);
    try {
      const res = await client.post(`/api/content/${id}/quiz-submit`, { answers: quizAnswers });
      setQuizResult(res.data);
    } catch {
      setError('Could not submit the quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  }

  if (error) {
    return (
      <div>
        {backLink !== false && <BackLink {...backLink} />}
        <div className="error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v5M12 16h.01" />
          </svg>
          {error}
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div>
        {backLink !== false && <BackLink {...backLink} />}
        <ContentSkeleton />
      </div>
    );
  }

  const tamil = content.localized_text?.ta;
  const hasSteps = Array.isArray(content.resolved_steps) && content.resolved_steps.length > 0;
  const englishBody = content.resolved_text || content.original_text;

  return (
    <div>
      {backLink !== false && <BackLink {...backLink} />}
      <div className="page-header">
        <h1>{content.title}</h1>
        <div className="content-meta-row">
          <span className="badge">{content.subject}</span>
          <span className="badge">Grade {content.grade_level}</span>
        </div>
      </div>

      <div className="content-columns">
        <div className="card lang-card">
          <div className="lang-card-header">
            <span className="lang-flag">EN</span>
            English
          </div>
          {hasSteps ? (
            <ol className="step-list">
              {content.resolved_steps.map((step) => (
                <li key={step.id} className="step-item">{step.text}</li>
              ))}
            </ol>
          ) : (
            <p className="lang-card-body">{englishBody}</p>
          )}
        </div>

        <div className={`card lang-card lang-card-ta ${!tamil ? 'lang-card-pending' : ''}`}>
          <div className="lang-card-header">
            <span className="lang-flag">TA</span>
            Tamil
          </div>
          {tamil ? (
            <p className="lang-card-body">{tamil}</p>
          ) : (
            <p className="content-pending">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
              Translation pending
            </p>
          )}
        </div>
      </div>

      {Array.isArray(content.quiz) && content.quiz.length > 0 && (
        <div className="quiz-block">
          <h3>Check understanding</h3>
          {content.quiz.map((q, qi) => (
            <div key={qi} className="quiz-question">
              <p className="quiz-question-text">{q.question}</p>
              <div className="quiz-options">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`quiz-option-btn ${quizAnswers[qi] === oi ? 'is-selected' : ''}`}
                    onClick={() => selectQuizAnswer(qi, oi)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            className="btn-primary"
            onClick={submitQuiz}
            disabled={submittingQuiz || quizAnswers.some((a) => a === null)}
          >
            {submittingQuiz ? 'Checking…' : 'Submit'}
          </button>

          {quizResult && (
            <div className="quiz-result">
              {quizResult.score === quizResult.total ? (
                <p className="quiz-result-good">🎉 Great job! {quizResult.score}/{quizResult.total} correct.</p>
              ) : (
                <p className="quiz-result-review">
                  Let&rsquo;s review this together — {quizResult.score}/{quizResult.total} correct.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
