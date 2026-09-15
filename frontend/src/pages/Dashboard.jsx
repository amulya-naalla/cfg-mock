import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import client from '../api/client.js';

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
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    client
      .get('/api/dashboard/summary')
      .then((res) => {
        if (!cancelled) setSummary(res.data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the dashboard. Check the backend connection.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="page-dashboard">
        <div className="empty-state">
          <div className="empty-state-icon">⚠️</div>
          <div className="empty-state-title">{error}</div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="page-dashboard">
        <p className="page-subtitle">Loading dashboard…</p>
      </div>
    );
  }

  const {
    totalStudents,
    percentFlagged,
    avgScoreByCluster = [],
    avgScoreBySubject = [],
    flaggedOverTime = [],
    recentSessions = [],
  } = summary;

  return (
    <div className="page-dashboard">
      <div className="page-head">
        <div>
          <h1 className="page-title">Leadership Dashboard</h1>
          <p className="page-subtitle">A quick read on how students are doing across every cluster.</p>
        </div>
      </div>

      {/* Top: only the numbers leadership acts on — kept to a scannable few */}
      <div className="metrics-row">
        <MetricCard icon="🎒" label="Total Students" value={totalStudents} />
        <MetricCard
          icon="🤝"
          label="% Needing Extra Support"
          value={`${Math.round(percentFlagged)}%`}
          tone={percentFlagged > 30 ? 'highlight-danger' : ''}
        />
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-col">
          <section className="panel">
            <div className="panel-header">
              <h2>📊 Average Score by Cluster</h2>
              <span className="benchmark-note">where to focus outreach</span>
            </div>
            {avgScoreByCluster.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-desc">No assessment data yet.</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgScoreByCluster} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="cluster" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${Math.round(v)}`, 'Avg score']} />
                  <Bar dataKey="avg" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>📚 Average Score by Subject</h2>
            </div>
            {avgScoreBySubject.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-desc">No assessment data yet.</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={avgScoreBySubject} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                  <Tooltip formatter={(v) => [`${Math.round(v)}`, 'Avg score']} />
                  <Bar dataKey="avg" fill="#0891b2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>

        <div className="dashboard-col">
          <section className="panel">
            <div className="panel-header">
              <h2>📈 Students Needing Support, Over Time</h2>
            </div>
            {flaggedOverTime.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-desc">No trend data yet.</div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={flaggedOverTime} margin={{ top: 8, right: 8, left: -16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="var(--color-flagged-badge)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <h2>🕐 Recent Educator Sessions</h2>
            </div>
            {recentSessions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-desc">No sessions logged yet.</div>
              </div>
            ) : (
              <div className="task-list">
                {recentSessions.map((s) => (
                  <div key={s._id} className="task-row">
                    <span className="task-label">
                      <strong>{s.cluster}</strong> — {s.topic} · {s.attendance_count} attendees
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
