import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import client from '../api/client.js';
import ClusterBarChart, { clusterStatus } from '../components/ClusterBarChart.jsx';
import {
  LocalStore,
  SKILL_LABELS,
  LANG_LABELS,
} from '../data/mockData.js';
import {
  deriveDashboard,
  PRIORITY_META,
  studentMeta,
} from '../utils/adaptive.js';
import { AddStudentModal, RecordInterventionModal, ViewProgressModal } from '../components/DashboardModals.jsx';

const MOCK_SUMMARY = {
  totalStudents: 12,
  percentFlagged: 30,
  avgScoreByCluster: [
    { cluster: 'Chennai-North', avg: 65 },
    { cluster: 'Madurai-East', avg: 72 },
    { cluster: 'Coimbatore-Central', avg: 58 },
  ],
};

const MOCK_SESSIONS = [
  { date: '2026-09-12', educator_id: 'ED-101 (Priya)', cluster: 'Chennai-North', topic: 'Math Basics & Fractions', attendance_count: 18 },
  { date: '2026-09-11', educator_id: 'ED-102 (Karthik)', cluster: 'Madurai-East', topic: 'Reading Circle & Phonics', attendance_count: 22 },
  { date: '2026-09-10', educator_id: 'ED-103 (Anitha)', cluster: 'Coimbatore-Central', topic: 'Times Tables & Mental Math', attendance_count: 15 },
];

function MetricCard({ label, value, tone = '', icon }) {
  return (
    <div className={`metric-card ${tone}`}>
      <span className="metric-icon" aria-hidden="true">{icon}</span>
      <span className="metric-val">{value}</span>
      <span className="metric-label">{label}</span>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLeadership = location.pathname.startsWith('/leadership');
  const viewMode = isLeadership ? 'leadership' : 'educator';

  const [data, setData] = useState(() => deriveDashboard());
  const [modal, setModal] = useState(null);

  // Leadership state
  const [summary, setSummary] = useState(MOCK_SUMMARY);
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [loading, setLoading] = useState(false);

  function refresh() {
    setData(deriveDashboard());
  }

  useEffect(() => LocalStore.subscribe(refresh), []);

  useEffect(() => {
    client.get('/api/dashboard/summary').then((res) => {
      if (res.data && Array.isArray(res.data.avgScoreByCluster)) {
        setSummary(res.data);
      }
    }).catch(() => {});

    client.get('/api/sessions').then((res) => {
      if (Array.isArray(res.data)) {
        setSessions(res.data);
      }
    }).catch(() => {});
  }, []);

  const { metrics, attentionList, gapCounts, tasks } = data;
  const maxGap = Math.max(1, ...gapCounts.map((g) => g.count));

  return (
    <div className="page-dashboard">
      {viewMode === 'educator' ? (
        <>
          {/* Header + quick actions */}
          <div className="page-head">
            <div>
              <h1 className="page-title">Educator Dashboard</h1>
              <p className="page-subtitle">Here&rsquo;s what needs your attention today.</p>
            </div>
            <div className="quick-actions" aria-label="Quick actions">
              <button className="quick-btn" onClick={() => setModal('addStudent')}>
                <span aria-hidden="true">➕</span> Add Student
              </button>
              <button className="quick-btn" onClick={() => navigate('/content')}>
                <span aria-hidden="true">📚</span> Assign Content
              </button>
              <button className="quick-btn" onClick={() => setModal('progress')}>
                <span aria-hidden="true">📈</span> View Progress
              </button>
              <button className="quick-btn" onClick={() => setModal('intervention')}>
                <span aria-hidden="true">📝</span> Record Intervention
              </button>
            </div>
          </div>

          {/* Metrics */}
          <div className="metrics-row">
            <MetricCard icon="🎒" label="Total Students" value={metrics.totalStudents} />
            <MetricCard icon="🚩" label="Need Attention" value={metrics.needingAttention} tone="highlight-danger" />
            <MetricCard icon="✅" label="Pending Tasks" value={metrics.pendingTasks} />
            <MetricCard icon="🤝" label="Active Interventions" value={metrics.activeInterventions} />
            <MetricCard icon="🌱" label="Showing Improvement" value={metrics.showingImprovement} tone="highlight-success" />
          </div>

          <div className="dashboard-grid">
            {/* Left column: attention + gaps */}
            <div className="dashboard-col">
              {/* Students needing attention */}
              <section className="panel panel-danger">
                <div className="panel-header">
                  <h2>🚩 Students Needing Attention</h2>
                  <span className="panel-count">{attentionList.length}</span>
                </div>
                {attentionList.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon">👍</div>
                    <div className="empty-state-title">All students are on track</div>
                    <div className="empty-state-desc">No one needs urgent support right now.</div>
                  </div>
                ) : (
                  <div className="attention-list">
                    {attentionList.map((s) => {
                      const pm = PRIORITY_META[s.priority] || { className: 'prio-med', label: 'Medium' };
                      return (
                        <button key={s._id} className="attention-row" onClick={() => setModal('progress')} title="View progress">
                          <div className="attention-main">
                            <span className="attention-name">{s.name}</span>
                            <span className="attention-meta">{studentMeta(s)} • {LANG_LABELS[s.language] || s.language}</span>
                            <span className="attention-gap">
                              Gap: <strong>{s.primary_gap ? SKILL_LABELS[s.primary_gap] : 'Not assessed'}</strong>
                              {s.last_score != null && <> • Last score {s.last_score}/100</>}
                            </span>
                          </div>
                          <span className={`priority-pill ${pm.className}`}>{pm.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Learning gaps */}
              <section className="panel">
                <div className="panel-header">
                  <h2>📊 Learning Gaps</h2>
                  <span className="benchmark-note">students per gap area</span>
                </div>
                <div className="gap-bars">
                  {gapCounts.map((g) => (
                    <div key={g.key} className="gap-bar-row">
                      <span className="gap-bar-label">{g.label}</span>
                      <div className="gap-bar-track">
                        <div
                          className={`gap-bar-fill ${g.count === 0 ? 'is-empty' : ''}`}
                          style={{ width: `${Math.round((g.count / maxGap) * 100)}%` }}
                        />
                      </div>
                      <span className="gap-bar-count">{g.count}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right column: tasks */}
            <div className="dashboard-col">
              <section className="panel">
                <div className="panel-header">
                  <h2>🕐 Today&rsquo;s Tasks</h2>
                  <span className="panel-count">{tasks.filter((t) => !t.done).length} pending</span>
                </div>
                <div className="task-list">
                  {tasks.map((t) => (
                    <label key={t._id} className={`task-row ${t.done ? 'is-done' : ''}`}>
                      <input
                        type="checkbox"
                        checked={t.done}
                        onChange={() => LocalStore.toggleTask(t._id)}
                      />
                      <span className="task-label">{t.label}</span>
                    </label>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Leadership View */}
          <div className="page-head">
            <div>
              <h1 className="page-title">Leadership & Program Analytics</h1>
              <p className="page-subtitle">Cross-district cluster performance & assessment metrics</p>
            </div>
          </div>

          <div className="metrics-row">
            <MetricCard icon="📊" label="Total Assessments" value={summary.totalAssessments || 24} />
            <MetricCard icon="🚩" label="Flagged Ratio" value={`${summary.percentFlagged || 30}%`} tone="highlight-danger" />
            <MetricCard icon="🏫" label="Active Clusters" value={summary.avgScoreByCluster?.length || 3} />
          </div>

          <div style={{ marginTop: '24px' }}>
            <ClusterBarChart data={summary.avgScoreByCluster} />
          </div>
        </>
      )}

      {/* Modals */}
      {modal === 'addStudent' && <AddStudentModal onClose={() => setModal(null)} />}
      {modal === 'intervention' && <RecordInterventionModal onClose={() => setModal(null)} />}
      {modal === 'progress' && <ViewProgressModal onClose={() => setModal(null)} />}
    </div>
  );
}
