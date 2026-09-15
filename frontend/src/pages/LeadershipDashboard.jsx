import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import client from "../api/client.js";
import { clusterStatus, colorFor } from "../components/ClusterBarChart.jsx";

const MOCK_SUMMARY = {
  totalStudents: 12,
  percentFlagged: 30,
  avgScoreByCluster: [
    { cluster: "A", avg: 65 },
    { cluster: "B", avg: 72 },
    { cluster: "C", avg: 58 },
  ],
};

const MOCK_SESSIONS = [
  { date: "2026-09-12", educator_id: "Priya Nair",    cluster: "A", topic: "Fractions review",    attendance_count: 18 },
  { date: "2026-09-11", educator_id: "Arjun Mehta",   cluster: "B", topic: "Reading circles",     attendance_count: 22 },
  { date: "2026-09-10", educator_id: "Fatima Sheikh", cluster: "C", topic: "Times tables drill",  attendance_count: 15 },
  { date: "2026-09-09", educator_id: "Priya Nair",    cluster: "A", topic: "Word problems",       attendance_count: 19 },
  { date: "2026-09-08", educator_id: "Arjun Mehta",   cluster: "B", topic: "Vocabulary building", attendance_count: 20 },
];


function formatDate(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
function timeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}
// One bar per real cluster, labelled with that cluster's actual name.
// (Previously this rendered cluster averages under Mon–Sun weekday labels, which
// presented real scores as fake per-day activity.)
function ClusterScoreChart({ data }) {
  const max = Math.max(...data.map((d) => d.avg), 100);
  return (
    <div className="act-chart">
      {data.map((d) => {
        const heightPct = (d.avg / max) * 100;
        const status = clusterStatus(d.avg);
        return (
          <div className="act-bar-col" key={d.cluster}>
            <div className="act-bar-track">
              <div
                className={`act-bar-fill${status === "good" ? " act-bar-highlight" : ""}`}
                style={{ height: `${heightPct}%` }}
                title={`${d.cluster}: ${Math.round(d.avg)} average score`}
              />
            </div>
            <span className="act-bar-label">{d.cluster}</span>
          </div>
        );
      })}
    </div>
  );
}

function DashSkeleton() {
  return (
    <div className="new-dash-layout">
      <div className="new-dash-left">
        <div className="card nd-card"><div className="skeleton" style={{ height: 260 }} /></div>
        <div className="card nd-card"><div className="skeleton" style={{ height: 300 }} /></div>
      </div>
      <div className="new-dash-center">
        <div className="card nd-card"><div className="skeleton" style={{ height: 220 }} /></div>
      </div>
      <div className="new-dash-right">
        <div className="card nd-card"><div className="skeleton" style={{ height: 500 }} /></div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary,         setSummary]         = useState(null);
  const [sessions,        setSessions]        = useState(null);
  const [isSummaryMocked, setIsSummaryMocked] = useState(false);
  const [loading,         setLoading]         = useState(true);
  const [refreshing,      setRefreshing]      = useState(false);
  const [lastUpdated,     setLastUpdated]     = useState(null);
  const [sessionTab,      setSessionTab]      = useState("all");
  const [search,          setSearch]          = useState("");

  const load = useCallback(async (isRefresh) => {
    if (isRefresh) setRefreshing(true);
    let nextSummary, summaryMocked = false;
    try {
      const res = await client.get("/api/dashboard/summary");
      const data = res.data;
      if (!data || !Array.isArray(data.avgScoreByCluster)) throw new Error("bad shape");
      nextSummary = data;
    } catch { nextSummary = MOCK_SUMMARY; summaryMocked = true; }

    let nextSessions;
    try {
      const res  = await client.get("/api/sessions?limit=5");
      const list = Array.isArray(res.data) ? res.data : res.data?.sessions;
      if (!list?.length) throw new Error("empty");
      nextSessions = list;
    } catch { nextSessions = MOCK_SESSIONS; }

    setSummary(nextSummary); setIsSummaryMocked(summaryMocked);
    setSessions(nextSessions); setLastUpdated(new Date());
    setLoading(false); setRefreshing(false);
  }, []);

  useEffect(() => { load(false); }, [load]);

  const clusters = useMemo(() => summary?.avgScoreByCluster.map((c) => c.cluster) ?? [], [summary]);

  const statusCounts = useMemo(() => {
    const counts = { good: 0, watch: 0, risk: 0 };
    summary?.avgScoreByCluster.forEach((c) => { counts[clusterStatus(c.avg)] += 1; });
    return counts;
  }, [summary]);

  const tabbedSessions = useMemo(() => {
    if (!sessions) return [];
    const term = search.trim().toLowerCase();
    return sessions.filter((s) => {
      const mt = sessionTab === "all" || s.cluster === sessionTab;
      const ms = !term || s.educator_id?.toLowerCase().includes(term) || s.topic?.toLowerCase().includes(term);
      return mt && ms;
    });
  }, [sessions, sessionTab, search]);

  const attentionClusters = useMemo(
    () => summary?.avgScoreByCluster.filter((c) => clusterStatus(c.avg) !== "good") ?? [],
    [summary]
  );

  function clusterAvg(code) {
    return summary?.avgScoreByCluster.find((c) => c.cluster === code)?.avg;
  }

  const flaggedHigh = summary && summary.percentFlagged >= 40;

  return (
    <div className="nd-page">

      <header className="nd-topbar">
        <div className="nd-topbar-left">
          <h1 className="nd-greeting">
            {timeGreeting()}, Leadership <span aria-hidden="true">👋</span>
          </h1>
          <p className="nd-subtitle">Here&rsquo;s your cross-district program overview.</p>
        </div>
        <div className="nd-topbar-right">
          {lastUpdated && (
            <span className="nd-last-updated">
              Updated {lastUpdated.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}
            </span>
          )}
          <button type="button" className={`nd-icon-btn${refreshing?" is-spinning":""}`} onClick={() => load(true)} disabled={loading||refreshing} title="Refresh">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M21 12a9 9 0 1 1-3-6.7" /><path d="M21 3v6h-6" />
            </svg>
          </button>
          <Link to="/" className="nd-icon-btn" title="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
            </svg>
          </Link>
        </div>
      </header>

      {isSummaryMocked && (
        <div className="nd-status-banner">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="9" />
          </svg>
          Showing sample data — backend not reachable.
        </div>
      )}

      {loading && <DashSkeleton />}

      {!loading && summary && (
        <div className="nd-grid">

          {/* KPI strip — the few numbers leadership acts on */}
          <section className="nd-kpi-row" style={{ gridArea: 'kpi' }}>
            <div className="card nd-kpi">
              <span className="nd-kpi-icon" aria-hidden="true">🎒</span>
              <span className="nd-kpi-num">{summary.totalStudents}</span>
              <span className="nd-kpi-lbl">Students tracked</span>
            </div>
            <div className={`card nd-kpi${flaggedHigh ? " nd-kpi--alert" : ""}`}>
              <span className="nd-kpi-icon" aria-hidden="true">🤝</span>
              <span className="nd-kpi-num">{Math.round(summary.percentFlagged)}%</span>
              <span className="nd-kpi-lbl">Currently needing support</span>
            </div>
            <div className={`card nd-kpi${statusCounts.risk > 0 ? " nd-kpi--alert" : ""}`}>
              <span className="nd-kpi-icon" aria-hidden="true">📍</span>
              <span className="nd-kpi-num">{statusCounts.risk}</span>
              <span className="nd-kpi-lbl">
                {statusCounts.risk === 1 ? "Cluster at risk" : "Clusters at risk"}
              </span>
            </div>
            <div className="card nd-kpi">
              <span className="nd-kpi-icon" aria-hidden="true">✅</span>
              <span className="nd-kpi-num">{statusCounts.good}</span>
              <span className="nd-kpi-lbl">
                {statusCounts.good === 1 ? "Cluster on track" : "Clusters on track"}
              </span>
            </div>
          </section>

          {/* Average score by cluster — where to focus outreach */}
          <section className="card nd-card" style={{ gridArea: 'cluster' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Average Score by Cluster</h2>
              <span className="nd-hint">where to focus outreach</span>
            </div>
            <ClusterScoreChart data={summary.avgScoreByCluster} />
          </section>

          {/* Average score by subject — real backend data, previously discarded */}
          <section className="card nd-card" style={{ gridArea: 'subject' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Average Score by Subject</h2>
              <span className="nd-hint">which subjects need support</span>
            </div>
            {summary.avgScoreBySubject?.length ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={summary.avgScoreBySubject} margin={{ top: 8, right: 8, left: -18, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6ecf2" />
                  <XAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v) => [`${Math.round(v)}`, "Average score"]} />
                  <Bar dataKey="avg" fill="#0891b2" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="nd-empty">No assessment data yet.</div>
            )}
          </section>

          {/* Students needing support over time — real backend data, previously discarded */}
          <section className="card nd-card" style={{ gridArea: 'trend' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Students Needing Support, Over Time</h2>
              <span className="nd-hint">by assessment date</span>
            </div>
            {summary.flaggedOverTime?.length ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={summary.flaggedOverTime} margin={{ top: 8, right: 12, left: -18, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e6ecf2" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={formatDate} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip labelFormatter={formatDate} formatter={(v) => [v, "Needing support"]} />
                  <Line type="monotone" dataKey="count" stroke="#c1543f" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="nd-empty">No trend data yet.</div>
            )}
          </section>

          {/* Recent educator sessions */}
          <section className="card nd-card" style={{ gridArea: 'sessions' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Recent Educator Sessions</h2>
              <div className="nd-search-box nd-search-box--inline">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
                </svg>
                <input
                  type="text"
                  placeholder="Search sessions"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="nd-course-tabs">
              {["all", ...clusters].map((c) => (
                <button key={c} type="button"
                  className={`nd-tab${sessionTab === c ? " nd-tab--active" : ""}`}
                  onClick={() => setSessionTab(c)}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>

            {tabbedSessions.length === 0 ? (
              <div className="nd-empty">No sessions match.</div>
            ) : (
              <ul className="nd-session-list">
                {tabbedSessions.map((s, i) => {
                  const avg = clusterAvg(s.cluster);
                  return (
                    <li className="nd-session-row" key={`${s.date}-${i}`}>
                      <span
                        className="nd-session-dot"
                        style={{ background: colorFor ? colorFor(avg ?? 0) : "#94a3b8" }}
                        aria-hidden="true"
                      />
                      <div className="nd-session-main">
                        <span className="nd-session-topic">{s.topic}</span>
                        <span className="nd-session-meta">
                          {s.cluster} · {formatDate(s.date)} · {s.attendance_count} attended
                        </span>
                      </div>
                      {avg != null && (
                        <span className="nd-session-avg">{Math.round(avg)} avg</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

        </div>
      )}


    </div>
  );
}
