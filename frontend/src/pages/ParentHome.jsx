import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client.js";

/* ── mock data ─────────────────────────────────────────────── */
const MOCK_CHILDREN = [
  {
    _id: "mock-1",
    name: "Arjun Sharma",
    grade: "Grade 5",
    language: "hi",
    cluster: "A",
    latestScore: 72,
    flagged: false,
    subjects: ["Math", "Reading", "Science"],
    lastAssessed: "2026-09-12",
  },
  {
    _id: "mock-2",
    name: "Priya Meenakshi",
    grade: "Grade 4",
    language: "ta",
    cluster: "B",
    latestScore: 58,
    flagged: true,
    subjects: ["Math", "Reading"],
    lastAssessed: "2026-09-11",
  },
  {
    _id: "mock-3",
    name: "Rohan Das",
    grade: "Grade 6",
    language: "en",
    cluster: "C",
    latestScore: 85,
    flagged: false,
    subjects: ["Math", "Science"],
    lastAssessed: "2026-09-10",
  },
];

const LANG_LABEL = { en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", kn: "Kannada" };

function scoreColor(s) {
  if (s >= 70) return "#1bbc9d";
  if (s >= 50) return "#f4a536";
  return "#e05c5c";
}

function ScoreRing({ score, size = 56 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eee" strokeWidth="7" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <span style={{
        position: "absolute", inset: 0, display: "flex",
        alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: size * 0.22, color: "var(--ink)"
      }}>{score}%</span>
    </div>
  );
}

export default function ParentHome() {
  const [children, setChildren] = useState(null);
  const [isMocked, setIsMocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const [studentsRes, assessmentsRes] = await Promise.all([
        client.get("/api/students"),
        client.get("/api/assessments"),
      ]);
      const rawStudents = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data?.students;
      const rawAssessments = Array.isArray(assessmentsRes.data) ? assessmentsRes.data : [];
      if (!rawStudents?.length) throw new Error("empty");

      // The real backend returns bare student docs — no latestScore/flagged fields.
      // Derive them from that student's most recent assessment, same as the educator's list.
      const list = rawStudents.map((student) => {
        const studentId = String(student._id || student.id);
        const studentAsms = rawAssessments.filter((a) => String(a.student_id) === studentId);
        const latest = studentAsms[studentAsms.length - 1];
        return {
          ...student,
          latestScore: latest?.score ?? null,
          flagged: latest ? Boolean(latest.flagged) : Boolean(student.flagged),
          lastAssessed: latest?.date || null,
        };
      });
      setChildren(list);
    } catch {
      setChildren(MOCK_CHILDREN);
      setIsMocked(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    if (!children) return [];
    const t = search.trim().toLowerCase();
    if (!t) return children;
    return children.filter((c) =>
      c.name?.toLowerCase().includes(t) ||
      c.grade?.toLowerCase().includes(t) ||
      c.cluster?.toLowerCase().includes(t)
    );
  }, [children, search]);

  return (
    <div className="par-page">
      {/* header */}
      <header className="par-topbar">
        <div>
          <h1 className="par-greeting">Welcome back <span aria-hidden="true">👋</span></h1>
          <p className="par-subtitle">Track your child&rsquo;s learning progress</p>
        </div>
        <div className="par-topbar-right">
          <div className="par-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="11" cy="11" r="7" /><path d="m20 20-3.2-3.2" />
            </svg>
            <input
              type="text" placeholder="Search children..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="par-icon-btn-wrap">
            <button type="button" className="par-icon-btn" title="Notifications">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
            </button>
          </div>
          <Link to="/" className="par-icon-btn" title="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
            </svg>
          </Link>
        </div>
      </header>

      {/* mocked banner */}
      {isMocked && (
        <div className="par-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="9" />
          </svg>
          Showing demo data — connect backend to see real children.
        </div>
      )}

      {/* stats strip */}
      {!loading && children && (
        <div className="par-stats-strip">
          <div className="par-stat-chip">
            <span className="par-stat-chip-num">{children.length}</span>
            <span className="par-stat-chip-lbl">Children</span>
          </div>
          <div className="par-stat-chip par-stat-chip--green">
            <span className="par-stat-chip-num">{children.filter((c) => !c.flagged).length}</span>
            <span className="par-stat-chip-lbl">On Track</span>
          </div>
          <div className="par-stat-chip par-stat-chip--red">
            <span className="par-stat-chip-num">{children.filter((c) => c.flagged).length}</span>
            <span className="par-stat-chip-lbl">Need Support</span>
          </div>
          <div className="par-stat-chip par-stat-chip--blue">
            <span className="par-stat-chip-num">
              {children.length
                ? Math.round(children.reduce((s, c) => s + (c.latestScore ?? 0), 0) / children.length)
                : "-"}%
            </span>
            <span className="par-stat-chip-lbl">Avg Score</span>
          </div>
        </div>
      )}

      {/* section label */}
      <div className="par-section-header">
        <h2 className="par-section-title">
          {search ? `Results for "${search}"` : "Your Children"}
        </h2>
        <span className="par-section-count">{filtered.length} child{filtered.length !== 1 ? "ren" : ""}</span>
      </div>

      {/* loading skeletons */}
      {loading && (
        <div className="par-grid">
          {[1, 2, 3].map((i) => (
            <div className="card par-child-card" key={i}>
              <div className="skeleton" style={{ height: 56, width: 56, borderRadius: "50%", marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 16, width: "60%", marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 12, width: "40%" }} />
            </div>
          ))}
        </div>
      )}

      {/* child cards */}
      {!loading && (
        <div className="par-grid">
          {filtered.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", color: "var(--ink-muted)", padding: "3rem 0" }}>
              No children found.
            </div>
          )}
          {filtered.map((child) => {
            const score = child.latestScore ?? 0;
            const clr = scoreColor(score);
            return (
              <div
                className={`card par-child-card${child.flagged ? " par-child-card--flagged" : ""}`}
                key={child._id}
              >
                {/* flagged ribbon */}
                {child.flagged && (
                  <div className="par-flag-ribbon">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M4 3v18M4 4h13l-2.5 3.5L17 11H4" />
                    </svg>
                    Needs Support
                  </div>
                )}

                {/* top row */}
                <div className="par-child-top">
                  <div className="par-child-avatar" style={{ background: clr + "22", color: clr }}>
                    {child.name?.split(" ").map((p) => p[0]).slice(0, 2).join("")}
                  </div>
                  <ScoreRing score={score} />
                </div>

                {/* info */}
                <div className="par-child-name">{child.name}</div>
                <div className="par-child-meta">
                  <span className="par-meta-pill">{child.grade ?? "—"}</span>
                  {child.cluster && <span className="par-meta-pill par-meta-pill--cluster">Cluster {child.cluster}</span>}
                  {child.language && child.language !== "en" && (
                    <span className="par-meta-pill">{LANG_LABEL[child.language] ?? child.language}</span>
                  )}
                </div>

                {/* subjects */}
                {child.subjects?.length > 0 && (
                  <div className="par-subjects">
                    {child.subjects.map((s) => (
                      <span className="par-subject-tag" key={s}>{s}</span>
                    ))}
                  </div>
                )}

                {/* last assessed */}
                {child.lastAssessed && (
                  <div className="par-last-assessed">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
                    </svg>
                    Last assessed {new Date(child.lastAssessed).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </div>
                )}

                {/* score bar */}
                <div className="par-score-bar-wrap">
                  <div className="par-score-bar-track">
                    <div className="par-score-bar-fill" style={{ width: `${score}%`, background: clr }} />
                  </div>
                  <span className="par-score-bar-label" style={{ color: clr }}>{score}%</span>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  className="par-view-btn"
                  onClick={() => navigate(`/parent/${child._id}`)}
                >
                  View Progress
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
