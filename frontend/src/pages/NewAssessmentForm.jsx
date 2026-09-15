import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import client, { GRADE_BENCHMARKS, SUBJECTS } from '../api/client.js';

export default function NewAssessmentForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryStudentId = searchParams.get('student_id') || '';
  const queryCluster = searchParams.get('cluster') || '';

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    student_id: queryStudentId,
    subject: SUBJECTS[0],
    score: '',
    cluster: queryCluster || 'North-2',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch students list so the educator can either use the pre-selected student or choose one
  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await client.get('/api/students');
        const list = Array.isArray(res.data) ? res.data : [];
        setStudents(list);

        if (queryStudentId) {
          const match = list.find((s) => String(s._id || s.id) === String(queryStudentId));
          if (match) {
            setSelectedStudent(match);
            setForm((prev) => ({
              ...prev,
              student_id: match._id || match.id,
              cluster: match.cluster || prev.cluster,
            }));
          }
        } else if (list.length > 0) {
          setSelectedStudent(list[0]);
          setForm((prev) => ({
            ...prev,
            student_id: list[0]._id || list[0].id,
            cluster: list[0].cluster || 'North-2',
          }));
        }
      } catch (e) {
        console.warn('Could not fetch students for assessment form', e);
      }
    }
    loadStudents();
  }, [queryStudentId]);

  function handleStudentChange(e) {
    const sId = e.target.value;
    const match = students.find((s) => String(s._id || s.id) === String(sId));
    setSelectedStudent(match || null);
    setForm({
      ...form,
      student_id: sId,
      cluster: match?.cluster || form.cluster,
    });
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  const studentGrade = selectedStudent?.grade || '3';
  const expectedBenchmark = GRADE_BENCHMARKS[studentGrade] || 45;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage('');

    if (!form.student_id) {
      setErrorMessage('Please select a student.');
      return;
    }

    if (form.score === '' || isNaN(form.score)) {
      setErrorMessage('Please enter a valid numeric score.');
      return;
    }

    setLoading(true);

    try {
      // POST /api/assessments with student_id, subject, score, cluster, and grade_level_expected
      // Per spec: "flagged is computed server-side by Person B's route — you don't compute it, just send score and threshold and trust the response."
      await client.post('/api/assessments', {
        student_id: form.student_id,
        subject: form.subject,
        score: Number(form.score),
        cluster: form.cluster,
        grade_level_expected: expectedBenchmark,
      });

      setSubmitted(true);

      // Smooth redirect back to Student Detail to see updated score per spec
      setTimeout(() => {
        navigate(`/students/${form.student_id}`);
      }, 700);
    } catch (err) {
      console.error('Failed to submit assessment', err);
      setErrorMessage('Failed to submit assessment. Please check backend connection.');
      setLoading(false);
    }
  }

  return (
    <div className="new-assessment-page">
      <div className="top-nav-bar">
        <Link
          to={form.student_id ? `/students/${form.student_id}` : '/'}
          className="back-link"
        >
          <span>←</span> <span>Cancel</span>
        </Link>
      </div>

      <div className="form-card">
        <h1 className="form-heading">Record New Assessment</h1>

        {/* Selected Student Banner */}
        {selectedStudent && (
          <div className="student-banner">
            <div>
              <div className="banner-name">{selectedStudent.name}</div>
              <div className="banner-meta">
                Grade {selectedStudent.grade} • Cluster {form.cluster} • 🗣️ {selectedStudent.language || 'en'}
              </div>
            </div>
            <span className="benchmark-pill">Target: {expectedBenchmark} pts</span>
          </div>
        )}

        {submitted && (
          <div className="success-banner">
            ✓ Assessment saved successfully! Redirecting to student profile...
          </div>
        )}

        {errorMessage && (
          <div className="error-banner">
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="assessment-form">
          {/* Student Selector (if not pre-selected or if user wants to switch) */}
          <div className="form-field">
            <label className="field-label" htmlFor="student-select">
              Select Student
            </label>
            <select
              id="student-select"
              name="student_id"
              className="form-input select-input"
              value={form.student_id}
              onChange={handleStudentChange}
              required
            >
              {students.map((s) => (
                <option key={s._id || s.id} value={s._id || s.id}>
                  {s.name} (Grade {s.grade})
                </option>
              ))}
            </select>
          </div>

          {/* Subject Dropdown per spec */}
          <div className="form-field">
            <label className="field-label" htmlFor="subject-select">
              Subject
            </label>
            <select
              id="subject-select"
              name="subject"
              className="form-input select-input"
              value={form.subject}
              onChange={handleChange}
              required
            >
              {SUBJECTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Score Input */}
          <div className="form-field">
            <label className="field-label" htmlFor="score-input">
              Score (0 - 100)
            </label>
            <input
              id="score-input"
              name="score"
              type="number"
              className="form-input"
              placeholder="e.g. 45"
              min="0"
              max="100"
              value={form.score}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          {/* Benchmark Explanation Box */}
          <div className="benchmark-hint-box">
            <span>💡</span>
            <span>
              Expected benchmark for Grade {studentGrade}: <strong>{expectedBenchmark} pts</strong>.
              Flag status is computed server-side on submission.
            </span>
          </div>

          {/* Actions */}
          <div className="form-btn-row">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => navigate(form.student_id ? `/students/${form.student_id}` : '/')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || submitted}
            >
              {loading ? 'Submitting...' : 'Submit Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
