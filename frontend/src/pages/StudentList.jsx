import { useEffect, useState, useMemo } from 'react';
import client from '../api/client.js';
import StudentCard from '../components/StudentCard.jsx';

export default function StudentList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clusterFilter, setClusterFilter] = useState('ALL');
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [studentsRes, assessmentsRes] = await Promise.allSettled([
          client.get('/api/students'),
          client.get('/api/assessments'),
        ]);

        const rawStudents = studentsRes.status === 'fulfilled' ? studentsRes.value.data : [];
        const rawAssessments = assessmentsRes.status === 'fulfilled' ? assessmentsRes.value.data : [];

        // Associate the most recent assessment's flagged status and cluster with each student
        const enriched = rawStudents.map((student) => {
          const studentId = String(student._id || student.id);
          const studentAsms = Array.isArray(rawAssessments)
            ? rawAssessments.filter((a) => String(a.student_id) === studentId)
            : [];
          
          // Latest assessment
          const latest = studentAsms[studentAsms.length - 1];

          // Determine flagged: either from student object or latest assessment
          const isFlagged = latest ? Boolean(latest.flagged) : Boolean(student.flagged);
          const cluster = student.cluster || latest?.cluster || 'North-2';

          return {
            ...student,
            cluster,
            flagged: isFlagged,
            last_subject: latest?.subject || student.last_subject,
            last_score: latest?.score ?? student.last_score,
            last_date: latest?.date || null,
          };
        });

        // Most-urgent-first: flagged students surface to the top, most
        // recently flagged first, so an educator sees who needs attention now.
        enriched.sort((a, b) => {
          if (a.flagged !== b.flagged) return a.flagged ? -1 : 1;
          const aTime = a.last_date ? new Date(a.last_date).getTime() : 0;
          const bTime = b.last_date ? new Date(b.last_date).getTime() : 0;
          return bTime - aTime;
        });

        setStudents(enriched);
      } catch (err) {
        console.error('Failed to load students', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Extract unique clusters
  const clusters = useMemo(() => {
    const list = students.map((s) => s.cluster).filter(Boolean);
    return Array.from(new Set(list)).sort();
  }, [students]);

  // Filtered students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (clusterFilter !== 'ALL' && s.cluster !== clusterFilter) {
        return false;
      }
      if (flaggedOnly && !s.flagged) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = (s.name || '').toLowerCase().includes(q);
        const matchCluster = (s.cluster || '').toLowerCase().includes(q);
        const matchGrade = String(s.grade || '').includes(q);
        if (!matchName && !matchCluster && !matchGrade) return false;
      }
      return true;
    });
  }, [students, clusterFilter, flaggedOnly, searchQuery]);

  const totalCount = students.length;
  const flaggedCount = students.filter((s) => s.flagged).length;

  return (
    <div className="student-list-page">
      {/* Priority Metric Summary Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <span className="metric-label">All Students</span>
          <span className="metric-val">{totalCount}</span>
        </div>
        <div className="metric-card highlight-danger">
          <span className="metric-label">Needs Help</span>
          <span className="metric-val">🚩 {flaggedCount}</span>
        </div>
        <div className="metric-card">
          <span className="metric-label">Clusters</span>
          <span className="metric-val">{clusters.length || 1}</span>
        </div>
      </div>

      {/* Filter & Prioritization Section */}
      <div className="filter-panel">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search student name or grade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-controls-row">
          <select
            className="select-control"
            value={clusterFilter}
            onChange={(e) => setClusterFilter(e.target.value)}
          >
            <option value="ALL">All Clusters ({totalCount})</option>
            {clusters.map((c) => (
              <option key={c} value={c}>
                Cluster {c}
              </option>
            ))}
          </select>

          {/* Quick "Flagged Only" prioritization toggle per spec */}
          <button
            className={`flagged-toggle-btn ${flaggedOnly ? 'active' : ''}`}
            onClick={() => setFlaggedOnly(!flaggedOnly)}
            title="Filter to show only students needing help"
          >
            <span>🚩 Needs Attention</span>
            <span className="flag-count-pill">{flaggedCount}</span>
          </button>
        </div>
      </div>

      {/* Header Info */}
      <div className="list-meta-bar">
        <span>Showing {filteredStudents.length} of {totalCount} students</span>
        {flaggedOnly && (
          <span className="active-filter-hint">
            Active: <strong>Only Flagged (Needs Attention)</strong>
          </span>
        )}
      </div>

      {/* Student List */}
      {loading ? (
        <div className="loading-state">Loading students...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <div className="empty-state-title">No students found</div>
          <p className="empty-state-desc">Try changing the cluster filter or turn off "Needs Attention".</p>
          <button
            className="btn-secondary"
            style={{ margin: '12px auto 0' }}
            onClick={() => {
              setClusterFilter('ALL');
              setFlaggedOnly(false);
              setSearchQuery('');
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="student-list">
          {filteredStudents.map((student) => (
            <StudentCard key={student._id || student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
