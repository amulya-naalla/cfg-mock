import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client.js";
import ClusterBarChart, { clusterStatus, colorFor } from "../components/ClusterBarChart.jsx";

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

const MOCK_TODOS = [
  { id: 1, title: "Review cluster reports",  desc: "Check scores across all clusters.",       date: "Sep 20, 2026", done: true,  assignees: ["PN","AM"] },
  { id: 2, title: "Analyze quiz results",    desc: "Review scores and focus on weak areas.",  date: "Sep 22, 2026", done: false, assignees: ["FS"]      },
  { id: 3, title: "Schedule team sync",      desc: "Align on intervention strategies.",       date: "Sep 25, 2026", done: false, assignees: ["PN"]      },
];

const STATUS_LABEL  = { good: "On track", watch: "Watch", risk: "At risk" };
const DOW           = ["M","T","W","T","F","S","S"];
const CLUSTER_COLORS= { A: "#1bbc9d", B: "#7c6af7", C: "#f4a536" };

function initials(name) {
  if (!name) return "?";
  return name.split(" ").filter(Boolean).slice(0,2).map((p) => p[0].toUpperCase()).join("");
}
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
function buildCalendarCells(year, month) {
  const rawStart = new Date(year, month, 1).getDay();
  const startDay = (rawStart + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev  = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = startDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, otherMonth: true, key: null });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    cells.push({ day: d, otherMonth: false, key });
  }
  let next = 1;
  while (cells.length % 7 !== 0) cells.push({ day: next++, otherMonth: true, key: null });
  return cells;
}

function ProgressRing({ percent, size = 110, strokeWidth = 11, color = "#1bbc9d", trackColor = "#e8f8f5" }) {
  const clamped = Math.min(100, Math.max(0, percent));
  const radius  = (size - strokeWidth) / 2;
  const circ    = 2 * Math.PI * radius;
  const offset  = circ * (1 - clamped / 100);
  return (
    <div className="pring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="pring-inner">
        <span className="pring-value">{clamped}%</span>
      </div>
    </div>
  );
}

function ActivityBarChart({ data }) {
  const max  = Math.max(...data.map((d) => d.avg), 100);
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const bars = days.map((day, i) => {
    const d = data[i % data.length];
    return { day, value: d.avg, cluster: d.cluster };
  });
  return (
    <div className="act-chart">
      {bars.map((b, i) => {
        const heightPct = (b.value / max) * 100;
        const hi = i >= days.length - 2;
        return (
          <div className="act-bar-col" key={b.day}>
            <div className="act-bar-track">
              <div className={`act-bar-fill${hi ? " act-bar-highlight" : ""}`} style={{ height: `${heightPct}%` }} title={`${b.value}%`} />
            </div>
            <span className="act-bar-label">{b.day}</span>
          </div>
        );
      })}
    </div>
  );
}

function TodoItem({ item, onToggle }) {
  return (
    <button type="button" className={`todo-item${item.done ? " todo-item--done" : ""}`} onClick={() => onToggle(item.id)}>
      <div className="todo-item-body">
        <span className={`todo-title${item.done ? " todo-title--done" : ""}`}>{item.title}</span>
        <span className="todo-desc">{item.desc}</span>
        <div className="todo-footer-row">
          <span className="todo-date">{item.date}</span>
          <div className="todo-assignees">
            {item.assignees.map((a, i) => <span key={i} className="todo-avatar">{a}</span>)}
          </div>
        </div>
      </div>
      <span className={`todo-check${item.done ? " todo-check--done" : ""}`}>
        {item.done && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
            <path d="M5 12l4 4L19 6" />
          </svg>
        )}
      </span>
    </button>
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
  const [calMonthOffset,  setCalMonthOffset]  = useState(0);
  const [todos,           setTodos]           = useState(MOCK_TODOS);
  const [todoFilter,      setTodoFilter]      = useState("all");
  const [courseCarousel,  setCourseCarousel]  = useState(0);

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

  const spotlight = useMemo(() => {
    if (!sessions?.length) return null;
    const counts = {};
    sessions.forEach((s) => { if (s.educator_id) counts[s.educator_id] = (counts[s.educator_id] || 0) + 1; });
    let name = null, max = 0;
    Object.entries(counts).forEach(([n, c]) => { if (c > max) { max = c; name = n; } });
    return name ? { name, sessionCount: max } : null;
  }, [sessions]);

  const calDate = useMemo(() => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + calMonthOffset); return d;
  }, [calMonthOffset]);
  const calYear        = calDate.getFullYear();
  const calMonth       = calDate.getMonth();
  const calendarCells  = useMemo(() => buildCalendarCells(calYear, calMonth), [calYear, calMonth]);
  const sessionDateKeys= useMemo(() => new Set((sessions ?? []).map((s) => s.date?.slice(0,10))), [sessions]);
  const todayKey       = useMemo(() => new Date().toISOString().slice(0,10), []);
  const monthLabel     = calDate.toLocaleDateString(undefined, { month: "long" });

  function toggleTodo(id) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  const filteredTodos = useMemo(() => {
    if (todoFilter === "open")   return todos.filter((t) => !t.done);
    if (todoFilter === "closed") return todos.filter((t) =>  t.done);
    return todos;
  }, [todos, todoFilter]);

  const visibleCourses = 3;
  const maxCarousel    = Math.max(0, tabbedSessions.length - visibleCourses);
  const carouselSlice  = tabbedSessions.slice(courseCarousel, courseCarousel + visibleCourses);

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
          <div className="nd-search-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
            </svg>
            <input type="text" placeholder="Search everything" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {lastUpdated && <span className="nd-last-updated">{lastUpdated.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</span>}
          <button type="button" className="nd-icon-btn" title="Messages">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m2 7 10 7 10-7" />
            </svg>
          </button>
          <div className="nd-icon-btn-wrap">
            <button type="button" className="nd-icon-btn" title="Notifications">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </button>
            {statusCounts.risk > 0 && <span className="nd-badge-dot">{statusCounts.risk}</span>}
          </div>
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
        <div className="new-dash-layout">

          {/* ACTIVITY – grid area: activity */}
          <section className="card nd-card nd-activity-card" style={{ gridArea: 'activity' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Activity</h2>
              <span className="nd-pill">This week ▾</span>
            </div>
            <span className="nd-activity-trend">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 15l-6-6-6 6" /></svg>
              +{statusCounts.good * 3}% increase than last week
            </span>
            <div className="nd-activity-meta">
              <span className="nd-big-num">{summary.totalStudents}</span>
              <span className="nd-big-label">Students tracked</span>
            </div>
            <ActivityBarChart data={summary.avgScoreByCluster} />
          </section>

          {/* PROGRESS – grid area: progress */}
          <section className="card nd-card nd-progress-card" style={{ gridArea: 'progress' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Progress</h2>
              <span className="nd-pill">This week ▾</span>
            </div>
            <div className="nd-progress-body">
              <div className="nd-progress-ring-wrap">
                <p className="nd-progress-ring-label">Progress</p>
                <ProgressRing
                  percent={100 - summary.percentFlagged}
                  color={flaggedHigh ? "#c1543f" : "#1bbc9d"}
                  trackColor="#e8f8f5"
                />
                <div className="nd-mini-trend">
                  <div className="nd-mini-trend-pill">
                    <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
                      <polyline points="0,14 7,9 14,11 21,4 28,6" stroke="#94a3b8" strokeWidth="2" fill="none"/>
                    </svg>
                  </div>
                  <span className="nd-mini-trend-label">
                    {summary.percentFlagged}%<br /><small>Last week</small>
                  </span>
                </div>
              </div>
              <div className="nd-stat-rows">
                <div className="nd-stat-row">
                  <span className="nd-stat-icon nd-stat-icon--purple">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                    </svg>
                  </span>
                  <div>
                    <div className="nd-stat-num">{statusCounts.good}</div>
                    <div className="nd-stat-lbl">Completed</div>
                  </div>
                </div>
                <div className="nd-stat-row">
                  <span className="nd-stat-icon nd-stat-icon--orange">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>
                    </svg>
                  </span>
                  <div>
                    <div className="nd-stat-num">{statusCounts.watch + summary.totalStudents}</div>
                    <div className="nd-stat-lbl">In Progress</div>
                  </div>
                </div>
                <div className="nd-stat-row">
                  <span className="nd-stat-icon nd-stat-icon--red">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>
                    </svg>
                  </span>
                  <div>
                    <div className="nd-stat-num">{statusCounts.risk + 14}</div>
                    <div className="nd-stat-lbl">Upcoming</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CLUSTERS – grid area: clusters (spans left + center columns, row 2) */}
          <section className="card nd-card nd-courses-card" style={{ gridArea: 'clusters' }}>
            <div className="nd-card-header">
              <h2 className="nd-section-title">Clusters in Progress</h2>
              <button type="button" className="nd-add-btn">Add new&nbsp;+</button>
            </div>

            <div className="nd-course-tab-row">
              <div className="nd-course-tabs">
                {["all", ...clusters].map((c) => (
                  <button key={c} type="button"
                    className={`nd-tab${sessionTab === c ? " nd-tab--active" : ""}`}
                    onClick={() => { setSessionTab(c); setCourseCarousel(0); }}
                  >
                    {c === "all" ? "All" : `Cluster ${c}`}
                  </button>
                ))}
              </div>
              <div className="nd-course-nav">
                <button type="button" className="nd-nav-btn"
                  onClick={() => setCourseCarousel((v) => Math.max(0, v - 1))}
                  disabled={courseCarousel === 0}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 6l-6 6 6 6" /></svg>
                </button>
                <button type="button" className="nd-nav-btn"
                  onClick={() => setCourseCarousel((v) => Math.min(maxCarousel, v + 1))}
                  disabled={courseCarousel >= maxCarousel}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 6l6 6-6 6" /></svg>
                </button>
              </div>
            </div>

            {carouselSlice.length === 0 ? (
              <div className="nd-empty">No sessions match.</div>
            ) : (
              <div className="nd-course-grid">
                {carouselSlice.map((s, i) => {
                  const avg      = clusterAvg(s.cluster);
                  const clr      = CLUSTER_COLORS[s.cluster] ?? "var(--brand)";
                  const statusTx = avg != null ? STATUS_LABEL[clusterStatus(avg)] : null;
                  const pct      = avg ?? 0;
                  return (
                    <div className="card nd-course-card" key={`${s.date}-${i}`}>
                      <div className="nd-course-badge" style={{ background: clr+"22", color: clr }}>{s.cluster}</div>
                      <div className="nd-course-title">{s.topic}</div>
                      <div className="nd-course-level">{statusTx ?? "In progress"}</div>
                      <div className="nd-course-meta-row">
                        <span className="nd-course-meta-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
                          {s.attendance_count}
                        </span>
                        <span className="nd-course-meta-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
                          90 min
                        </span>
                        <span className="nd-course-meta-item">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="9" cy="8" r="3"/><path d="M3 18c.9-3 3.3-5 6-5s5.1 2 6 5"/><circle cx="17" cy="8" r="3"/><path d="M21 18c-.9-3-3.3-5-6-5"/></svg>
                          {s.attendance_count}
                        </span>
                      </div>
                      <div className="nd-course-progress-label">{pct}% Finish</div>
                      <div className="nd-course-progress-bar">
                        <div className="nd-course-progress-fill" style={{ width: `${pct}%`, background: clr }} />
                      </div>
                      <div className="nd-course-progress-sub">
                        <span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                          {Math.round(pct/10)}/10 Lessons
                        </span>
                        <span>2 hours left</span>
                      </div>
                      <div className="nd-course-footer">
                        <span className="nd-course-avatar">{initials(s.educator_id)}</span>
                        <div>
                          <div className="nd-course-footer-name">{s.educator_id}</div>
                          <div className="nd-course-footer-role">Educator</div>
                        </div>
                        <button type="button" className="nd-follow-btn">Follow</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* PROFILE – grid area: profile (spans both rows on the right) */}
          <aside className="card nd-card nd-profile-card" style={{ gridArea: 'profile' }}>

            <div className="nd-card-header">
              <h2 className="nd-section-title">Profile</h2>
              <button type="button" className="nd-menu-btn" title="More options">
                <svg width="4" height="16" viewBox="0 0 4 20" fill="currentColor">
                  <circle cx="2" cy="2"  r="1.8"/><circle cx="2" cy="10" r="1.8"/><circle cx="2" cy="18" r="1.8"/>
                </svg>
              </button>
            </div>

            <div className="nd-profile-block">
              <div className="nd-profile-avatar-ring">
                <div className="nd-profile-avatar">{initials(spotlight?.name)}</div>
              </div>
              <div className="nd-profile-name">
                {spotlight?.name ?? "Leadership"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#3368a0" stroke="none">
                  <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm-1.5 14.5-4-4 1.4-1.4 2.6 2.6 5.6-5.6 1.4 1.4-7 7z"/>
                </svg>
              </div>
              <div className="nd-profile-role">District Leadership</div>
            </div>

            <div className="nd-mini-cal">
              <div className="nd-mini-cal-header">
                <button type="button" className="nd-cal-nav-btn" onClick={() => setCalMonthOffset((v) => v - 1)}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M15 6l-6 6 6 6"/></svg>
                </button>
                <span className="nd-cal-title">{monthLabel}</span>
                <button type="button" className="nd-cal-nav-btn" onClick={() => setCalMonthOffset((v) => v + 1)}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M9 6l6 6-6 6"/></svg>
                </button>
              </div>
              <div className="nd-cal-grid">
                {DOW.map((d, i) => <span className="nd-cal-dow" key={`dow-${i}`}>{d}</span>)}
                {calendarCells.map((cell, i) => {
                  const isToday = cell.key === todayKey;
                  const hasSess = cell.key && sessionDateKeys.has(cell.key);
                  return (
                    <span key={i} className={[
                      "nd-cal-day",
                      cell.otherMonth ? "is-other" : "",
                      isToday ? "is-today" : "",
                      hasSess ? "has-session" : "",
                    ].filter(Boolean).join(" ")}>
                      {cell.day}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="nd-todo-section">
              <div className="nd-todo-header">
                <span className="nd-section-title">To Do List</span>
                <button type="button" className="nd-add-icon-btn" title="Add task">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14"/></svg>
                </button>
              </div>
              <div className="nd-todo-tabs">
                {[
                  { key: "all",    label: "All",    count: todos.length },
                  { key: "open",   label: "Open",   count: todos.filter((t) => !t.done).length },
                  { key: "closed", label: "Closed", count: todos.filter((t) =>  t.done).length },
                ].map(({ key, label, count }) => (
                  <button key={key} type="button"
                    className={`nd-todo-tab${todoFilter === key ? " nd-todo-tab--active" : ""}`}
                    onClick={() => setTodoFilter(key)}
                  >
                    {label} <span className="nd-todo-tab-count">{count}</span>
                  </button>
                ))}
              </div>
              <div className="nd-todo-list">
                {filteredTodos.map((t) => <TodoItem key={t.id} item={t} onToggle={toggleTodo} />)}
              </div>
              {attentionClusters.length > 0 && (
                <div className="nd-attention-banner">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
                    <path d="M12 9v4M12 17h.01"/><circle cx="12" cy="12" r="9"/>
                  </svg>
                  {attentionClusters.length} cluster{attentionClusters.length > 1 ? "s" : ""} need attention
                </div>
              )}
            </div>

          </aside>
        </div>
      )}


    </div>
  );
}
