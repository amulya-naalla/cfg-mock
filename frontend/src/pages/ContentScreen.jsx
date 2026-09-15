import { useEffect, useState } from 'react';
import client from '../api/client.js';

const LANGUAGE_TOGGLE = [
  { code: 'en', nativeLabel: 'English', englishLabel: 'English' },
  { code: 'ta', nativeLabel: 'தமிழ்', englishLabel: 'Tamil' },
];

export default function ContentScreen() {
  const [lessons, setLessons] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [content, setContent] = useState(null);
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);

  const [quizAnswers, setQuizAnswers] = useState([]);
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    client
      .get('/api/content')
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        setLessons(list);
        if (list.length > 0) setSelectedId(list[0]._id);
      })
      .catch(() => setError('Could not load lessons.'));

    client
      .get('/api/students')
      .then((res) => setStudents(Array.isArray(res.data) ? res.data : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    setError(null);
    setLang('en');
    setQuizAnswers([]);
    setQuizResult(null);

    const query = studentId ? `?student_id=${studentId}` : '';
    client
      .get(`/api/content/${selectedId}${query}`)
      .then((res) => {
        setContent(res.data);
        if (Array.isArray(res.data.quiz)) {
          setQuizAnswers(new Array(res.data.quiz.length).fill(null));
        }
      })
      .catch(() => setError('Could not load this lesson.'))
      .finally(() => setLoading(false));
  }, [selectedId, studentId]);

  async function handleLanguageToggle(code) {
    setLang(code);
    if (code === 'en' || !content) return;
    if (content.localized_text && content.localized_text[code]) return;

    setTranslating(true);
    try {
      const res = await client.post(`/api/content/${selectedId}/translate?lang=${code}`);
      setContent((prev) => ({ ...prev, ...res.data }));
    } catch {
      setError('Translation failed — showing English.');
      setLang('en');
    } finally {
      setTranslating(false);
    }
  }

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
      const res = await client.post(`/api/content/${selectedId}/quiz-submit`, { answers: quizAnswers });
      setQuizResult(res.data);
    } catch {
      setError('Could not submit the quiz.');
    } finally {
      setSubmittingQuiz(false);
    }
  }

  const localizedText = content?.localized_text?.[lang];
  const mainText = lang === 'en' ? content?.resolved_text || content?.original_text : localizedText;

  return (
    <div className="page-content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Learning Resources</h1>
          <p className="page-subtitle">Pick a lesson to review or share with a student.</p>
        </div>
      </div>

      {error && <div className="empty-state"><div className="empty-state-desc">⚠️ {error}</div></div>}

      <div className="filter-panel">
        <div className="filter-controls-row">
          <select className="select-control" value={selectedId || ''} onChange={(e) => setSelectedId(e.target.value)} aria-label="Lesson">
            {lessons.map((l) => (
              <option key={l._id} value={l._id}>{l.title}</option>
            ))}
          </select>
          <select className="select-control" value={studentId} onChange={(e) => setStudentId(e.target.value)} aria-label="View as student">
            <option value="">General view (no student)</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="page-subtitle">Loading lesson…</p>}

      {!loading && content && (
        <section className="panel">
          <div className="panel-header">
            <h2>{content.title}</h2>
            {studentId && (
              <span className="flag-badge flag-badge-success" title="Content adjusted to this student's level">
                ✨ Adjusted for this student
              </span>
            )}
          </div>

          {/* Language toggle — persistent, not a dropdown, native script + English label */}
          <div className="lang-toggle" role="group" aria-label="Language">
            {LANGUAGE_TOGGLE.map((l) => (
              <button
                key={l.code}
                className={`lang-toggle-btn ${lang === l.code ? 'is-active' : ''}`}
                onClick={() => handleLanguageToggle(l.code)}
                disabled={translating}
              >
                <span className="lang-native">{l.nativeLabel}</span>
                <span className="lang-english">{l.englishLabel}</span>
              </button>
            ))}
          </div>

          {translating && <p className="page-subtitle">Translating…</p>}

          {/* Stacked English + translated view, per the vertical-review recommendation */}
          <div className="lesson-body">
            {lang !== 'en' && (
              <div className="lesson-text-block lesson-text-original">
                <span className="lesson-text-label">English</span>
                <p>{content.resolved_text || content.original_text}</p>
              </div>
            )}
            {content.resolved_steps && content.resolved_steps.length > 0 ? (
              <div className="lesson-text-block">
                <span className="lesson-text-label">{lang === 'en' ? 'English' : 'தமிழ்'}</span>
                <ol className="step-list">
                  {content.resolved_steps.map((step) => (
                    <li key={step.id} className="step-item">{step.text}</li>
                  ))}
                </ol>
              </div>
            ) : (
              <div className="lesson-text-block">
                <span className="lesson-text-label">{lang === 'en' ? 'English' : 'தமிழ்'}</span>
                <p>{mainText || content.resolved_text || content.original_text}</p>
              </div>
            )}
          </div>

          {/* Quiz */}
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
        </section>
      )}
    </div>
  );
}
