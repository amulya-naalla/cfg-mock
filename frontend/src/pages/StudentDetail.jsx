import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import client, { GRADE_BENCHMARKS } from '../api/client.js';
import ParentSummaryModal from '../components/ParentSummaryModal.jsx';
import FlagBadge from '../components/FlagBadge.jsx';

export default function StudentDetail() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState(false);

  useEffect(() => {
    async function loadStudentAndAssessments() {
      setLoading(true);
      try {
        // Fetch assessments for this student
        const asmsRes = await client.get(`/api/assessments?student_id=${id}`);
        const asms = Array.isArray(asmsRes.data) ? asmsRes.data : [];
        setAssessments(asms);

        // Fetch students list to find current student metadata
        const studentsRes = await client.get('/api/students');
        const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
        const current = studentsList.find((s) => String(s._id || s.id) === String(id));

        if (current) {
          const latest = asms[asms.length - 1];
          setStudent({
            ...current,
            flagged: latest ? Boolean(latest.flagged) : Boolean(current.flagged),
            cluster: current.cluster || latest?.cluster || 'North-2',
            district: current.district || 'Pune Rural',
          });
        }
      } catch (err) {
        console.error('Failed to load student detail', err);
      } finally {
        setLoading(false);
      }
    }

    loadStudentAndAssessments();
  }, [id]);

  async function handleGenerateSummary() {
    setGeneratingSummary(true);
    try {
      // Person C hand-off route: POST /api/students/:id/parent-summary
      const res = await client.post(`/api/students/${id}/parent-summary`);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Failed to generate summary', err);
      // Fallback
      setSummary(`Progress report for ${student?.name || 'Student'}: Completed ${assessments.length} assessment(s).`);
    } finally {
      setGeneratingSummary(false);
    }
  }

  if (loading) {
    return <div className="loading-state">Loading student record...</div>;
  }

  if (!student && assessments.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <div className="empty-state-title">Student Not Found</div>
        <Link to="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '14px' }}>
          Back to Students
        </Link>
      </div>
    );
  }

  const studentName = student?.name || 'Student';
  const grade = student?.grade || '3';
  const expectedBenchmark = GRADE_BENCHMARKS[grade] || 45;
  const isFlagged = Boolean(student?.flagged);

  // Sort assessments newest first
  const sortedAssessments = [...assessments].reverse();

  return (
    <div className="student-detail-page">
      {/* Top Back Navigation */}
      <div className="top-nav-bar">
        <Link to="/" className="back-link">
          <span>←</span> <span>All Students</span>
        </Link>
        <span className="student-id-pill">ID: {id}</span>
      </div>

      {/* Student Profile Card */}
      <div className={`detail-card ${isFlagged ? 'is-flagged' : ''}`}>
        <div className="detail-header-row">
          <div>
            <h1 className="detail-title">{studentName}</h1>
            <div className="detail-subtitle">
              Grade {grade} • Cluster {student?.cluster || 'North-2'}
            </div>
          </div>
          <FlagBadge flagged={isFlagged} showOnTrack={true} />
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <span className="detail-label">District</span>
            <span className="detail-value">{student?.district || 'Pune Rural'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Cluster</span>
            <span className="detail-value">Cluster {student?.cluster || 'North-2'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Language Preference</span>
            <span className="detail-value">🗣️ {student?.language || 'en'}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Grade Benchmark</span>
            <span className="detail-value">{expectedBenchmark} pts</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="action-toolbar">
        {/* Big + New Assessment Button */}
        <Link
          to={`/assessments/new?student_id=${id}&cluster=${encodeURIComponent(student?.cluster || 'North-2')}`}
          className="btn-primary-big"
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>+</span>
          <span>Record New Assessment</span>
        </Link>

        {/* Secondary Actions for Person C handoffs */}
        <div className="secondary-btn-row">
          {/* Person C: Localized Lesson Handoff */}
          <Link
            to={`/content?lang=${encodeURIComponent(student?.language || 'hi')}`}
            className="btn-secondary"
            title="View localized lesson on Person C content screen"
          >
            <span>📖</span>
            <span>View Localized Lesson</span>
          </Link>

          {/* Person C: Share with Parent Modal */}
          <button
            className="btn-secondary"
            onClick={handleGenerateSummary}
            disabled={generatingSummary}
            title="Generate and view summary for parent"
          >
            <span>💬</span>
            <span>{generatingSummary ? 'Generating...' : 'Share with Parent'}</span>
          </button>
        </div>
      </div>

      {/* Past Assessments History */}
      <div className="section-header">
        <h2>Assessment History ({assessments.length})</h2>
        <span className="benchmark-note">Expected benchmark: {expectedBenchmark} pts</span>
      </div>

      <div className="assessment-list">
        {sortedAssessments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📝</div>
            <div className="empty-state-title">No assessments recorded yet</div>
            <p className="empty-state-desc">Click '+ Record New Assessment' above to add the first score.</p>
          </div>
        ) : (
          sortedAssessments.map((a) => {
            const asmFlagged = Boolean(a.flagged);
            const dateStr = a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Recent';
            return (
              <div key={a._id || Math.random()} className={`assessment-card ${asmFlagged ? 'flagged-record' : ''}`}>
                <div className="asm-left">
                  <div className="asm-subject">{a.subject}</div>
                  <div className="asm-date">📅 {dateStr}</div>
                </div>

                <div className="asm-right">
                  <div className="asm-score-block">
                    <span className={`asm-score ${asmFlagged ? 'danger' : ''}`}>
                      {a.score}
                    </span>
                    <span className="asm-total">/100</span>
                    <div className="asm-target">Target: {expectedBenchmark}</div>
                  </div>

                  <FlagBadge flagged={asmFlagged} showOnTrack={true} />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Parent Summary Modal (Person C integration) */}
      <ParentSummaryModal
        summary={summary}
        studentName={studentName}
        onClose={() => setSummary(null)}
      />
    </div>
  );
}
