import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import client from "../api/client.js";

/* ── mock data ─────────────────────────────────────────────── */
const MOCK_STUDENTS = {
  "mock-1": {
    _id: "mock-1", name: "Arjun Sharma", grade: "Grade 5",
    language: "hi", cluster: "A", flagged: false,
  },
  "mock-2": {
    _id: "mock-2", name: "Priya Meenakshi", grade: "Grade 4",
    language: "ta", cluster: "B", flagged: true,
  },
  "mock-3": {
    _id: "mock-3", name: "Rohan Das", grade: "Grade 6",
    language: "en", cluster: "C", flagged: false,
  },
};

const MOCK_ASSESSMENTS = {
  "mock-1": [
    { _id: "a1", subject: "Math",    score: 72, flagged: false, createdAt: "2026-09-12" },
    { _id: "a2", subject: "Reading", score: 68, flagged: false, createdAt: "2026-09-10" },
    { _id: "a3", subject: "Science", score: 81, flagged: false, createdAt: "2026-09-08" },
    { _id: "a4", subject: "Math",    score: 65, flagged: false, createdAt: "2026-09-01" },
    { _id: "a5", subject: "Reading", score: 55, flagged: true,  createdAt: "2026-08-25" },
  ],
  "mock-2": [
    { _id: "b1", subject: "Math",    score: 48, flagged: true,  createdAt: "2026-09-11" },
    { _id: "b2", subject: "Reading", score: 62, flagged: false, createdAt: "2026-09-09" },
    { _id: "b3", subject: "Math",    score: 42, flagged: true,  createdAt: "2026-09-02" },
  ],
  "mock-3": [
    { _id: "c1", subject: "Math",    score: 88, flagged: false, createdAt: "2026-09-10" },
    { _id: "c2", subject: "Science", score: 82, flagged: false, createdAt: "2026-09-07" },
    { _id: "c3", subject: "Math",    score: 79, flagged: false, createdAt: "2026-09-01" },
    { _id: "c4", subject: "Science", score: 90, flagged: false, createdAt: "2026-08-28" },
  ],
};

function fallbackStudent(id) {
  return MOCK_STUDENTS[id] ?? { _id: id, name: "Unknown Student", grade: "", language: "en", cluster: "?", flagged: false };
}
function fallbackAssessments(id) {
  return MOCK_ASSESSMENTS[id] ?? [];
}

/* ── helpers ─────────────────────────────────────────────────── */
function initials(name) {
  return (name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join("");
}
// Parent-facing palette deliberately excludes alarm red (see ParentHome).
function scoreColor(s) {
  if (s >= 70) return "#1bbc9d";
  if (s >= 50) return "#4a90b8";
  return "#b9791f";
}
// Parent-facing wording: conveys the same signal without labelling the child
// as deficient (no "flagged"/"at risk"/"below grade" language for parents).
function scoreLabel(s) {
  if (s >= 70) return "Going strong";
  if (s >= 50) return "Making progress";
  return "Building foundations";
}
const LANG_LABEL = { en: "English", hi: "Hindi", ta: "Tamil", te: "Telugu", kn: "Kannada" };

/* ── sub-components ───────────────────────────────────────────── */
function SubjectRing({ subject, score }) {
  const size = 90;
  const sw = 9;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color = scoreColor(score);
  return (
    <div className="par-subject-ring">
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#eee" strokeWidth={sw} />
          <circle cx={size/2} cy={size/2} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={offset}
            transform={`rotate(-90 ${size/2} ${size/2})`}
            style={{ transition: "stroke-dashoffset 0.7s ease" }}
          />
        </svg>
        <span style={{
          position: "absolute", inset: 0, display: "flex",
          flexDirection: "column", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: 15, color: "var(--ink)", gap: 1
        }}>{score}%</span>
      </div>
      <div className="par-subject-ring-label">{subject}</div>
      <div className="par-subject-ring-status" style={{ color }}>{scoreLabel(score)}</div>
    </div>
  );
}

function TrendChart({ assessments }) {
  if (!assessments.length) return null;
  const sorted = [...assessments].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const scores = sorted.map((a) => a.score);
  const min = 0, max = 100;
  const W = 260, H = 90, PAD = 10;
  const xStep = scores.length > 1 ? (W - PAD * 2) / (scores.length - 1) : W - PAD * 2;
  const yFor = (v) => PAD + (H - PAD * 2) * (1 - (v - min) / (max - min));
  const pts = scores.map((v, i) => `${PAD + i * xStep},${yFor(v)}`).join(" ");
  const area = `M${PAD},${H} ` + scores.map((v, i) => `L${PAD + i * xStep},${yFor(v)}`).join(" ") + ` L${PAD + (scores.length - 1) * xStep},${H} Z`;

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1bbc9d" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1bbc9d" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#trendGrad)" />
      <polyline points={pts} fill="none" stroke="#1bbc9d" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {scores.map((v, i) => (
        <circle key={i} cx={PAD + i * xStep} cy={yFor(v)} r="4" fill="#1bbc9d" stroke="#fff" strokeWidth="2" />
      ))}
    </svg>
  );
}

function SummaryPanel({ studentId, studentName }) {
  const [state, setState] = useState("idle"); // idle | loading | done | error
  const [summary, setSummary] = useState(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setState("loading");
    try {
      const res = await client.post(`/api/students/${studentId}/parent-summary`);
      setSummary(res.data);
      setState("done");
    } catch {
      // fallback mock summary
      setSummary({
        summary_en: `${studentName} has been making steady progress in their assessments. They show strong performance in Science and are improving in Math. Continue to encourage daily reading practice at home.`,
        summary_localized: null,
      });
      setState("done");
    }
  }

  function copy() {
    const text = summary?.summary_en ?? "";
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="par-summary-panel">
      <div className="par-summary-header">
        <span className="par-summary-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <div>
          <div className="par-summary-title">Parent Summary</div>
          <div className="par-summary-sub">AI-generated progress update</div>
        </div>
      </div>

      {state === "idle" && (
        <button type="button" className="par-gen-btn" onClick={generate}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Generate Summary
        </button>
      )}

      {state === "loading" && (
        <div className="par-summary-loading">
          <span className="spinner" />
          Generating summary...
        </div>
      )}

      {state === "done" && summary && (
        <div className="par-summary-content">
          <p className="par-summary-text">{summary.summary_en}</p>
          {summary.summary_localized && (
            <p className="par-summary-text par-summary-text--local">{summary.summary_localized}</p>
          )}
          <div className="par-summary-actions">
            <button type="button" className="par-action-btn par-action-btn--copy" onClick={copy}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              {copied ? "Copied!" : "Copy"}
            </button>
            <button type="button" className="par-action-btn par-action-btn--sms" disabled title="Demo only">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.2l3-.01a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.09 6.09l.95-.96a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              Send SMS (Demo)
            </button>
            <button type="button" className="par-action-btn par-action-btn--regen" onClick={() => { setSummary(null); setState("idle"); }}>
              Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main component ──────────────────────────────────────────── */
export default function ParentChild() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [assessments, setAssessments] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [stuRes, assRes] = await Promise.all([
        client.get(`/api/students/${studentId}`),
        client.get(`/api/assessments?student_id=${studentId}`),
      ]);
      
      // Vite proxy returns index.html (a string) for unknown routes
      if (typeof stuRes.data === 'string' || typeof assRes.data === 'string') {
        throw new Error('API not available, received HTML fallback');
      }
      
      const asms = Array.isArray(assRes.data) ? assRes.data : (assRes.data?.assessments ?? fallbackAssessments(studentId));
      const stu = stuRes.data ?? fallbackStudent(studentId);
      // `flagged` lives on assessments, not on the student doc — derive it from the
      // most recent one, otherwise this always rendered the "all good" state.
      const latest = asms[asms.length - 1];
      setStudent({ ...stu, flagged: latest ? Boolean(latest.flagged) : Boolean(stu.flagged) });
      setAssessments(asms);
    } catch {
      setStudent(fallbackStudent(studentId));
      setAssessments(fallbackAssessments(studentId));
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  // derived
  const bySubject = useMemo(() => {
    if (!assessments || !Array.isArray(assessments)) return {};
    const map = {};
    assessments.forEach((a) => {
      if (!map[a.subject]) map[a.subject] = [];
      map[a.subject].push(a.score);
    });
    const result = {};
    Object.entries(map).forEach(([sub, scores]) => {
      result[sub] = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    });
    return result;
  }, [assessments]);

  const overallScore = useMemo(() => {
    const vals = Object.values(bySubject);
    if (!vals.length) return 0;
    return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
  }, [bySubject]);

  const recent = useMemo(() => {
    if (!assessments) return [];
    return [...assessments]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  }, [assessments]);

  if (loading) {
    return (
      <div className="par-page">
        <div className="par-topbar">
          <div className="skeleton" style={{ height: 28, width: 200 }} />
        </div>
        <div className="par-child-dash-layout">
          <div className="card nd-card" style={{ gridArea: "trend" }}><div className="skeleton" style={{ height: 260 }} /></div>
          <div className="card nd-card" style={{ gridArea: "subjects" }}><div className="skeleton" style={{ height: 260 }} /></div>
          <div className="card nd-card" style={{ gridArea: "profile" }}><div className="skeleton" style={{ height: 520 }} /></div>
        </div>
      </div>
    );
  }

  const clr = scoreColor(overallScore);

  return (
    <div className="par-page">
      {/* header */}
      <header className="par-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button type="button" className="par-back-btn" onClick={() => navigate("/parent")} title="Back">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <div>
            <h1 className="par-greeting" style={{ fontSize: "1.3rem" }}>{student?.name ?? "Student"}</h1>
            <p className="par-subtitle">Progress overview</p>
          </div>
        </div>
        <div className="par-topbar-right">
          <Link to="/parent" className="par-icon-btn" title="All children">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="9" cy="7" r="4" /><path d="M3 21v-2a4 4 0 0 1 4-4h4" />
              <circle cx="17" cy="13" r="4" /><path d="M13 21v-2a4 4 0 0 1 4-4h4v2" />
            </svg>
          </Link>
          <Link to="/" className="par-icon-btn" title="Home">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
            </svg>
          </Link>
        </div>
      </header>

      {/* Supportive note for parents — actionable, never deficit-framed. */}
      {student?.flagged && (
        <div className="par-alert-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
          </svg>
          {student.name?.split(" ")[0] || "Your child"} is building strong foundations this term —
          their educator has extra practice planned.
        </div>
      )}

      {/* 3-area grid */}
      <div className="par-child-dash-layout">

        {/* TREND — recent assessment history */}
        <section className="card nd-card" style={{ gridArea: "trend", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div className="nd-card-header">
            <h2 className="nd-section-title">Score Trend</h2>
            <span className="nd-pill">{assessments?.length ?? 0} assessments</span>
          </div>
          <div className="par-trend-chart-wrap">
            <TrendChart assessments={assessments ?? []} />
          </div>
          {/* labels */}
          <div className="par-trend-x">
            {[...assessments ?? []].sort((a,b) => new Date(a.createdAt)-new Date(b.createdAt)).map((a, i) => (
              <span key={i} className="par-trend-x-label">
                {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            ))}
          </div>
          {/* recent list */}
          <div className="nd-section-title" style={{ fontSize: "0.88rem", marginTop: "0.5rem" }}>Recent Assessments</div>
          <div className="par-assessment-list">
            {recent.length === 0 && <div style={{ color: "var(--ink-muted)", fontSize: "0.85rem" }}>No assessments yet.</div>}
            {recent.map((a) => {
              const c = scoreColor(a.score);
              return (
                <div className="par-assessment-row" key={a._id}>
                  <span className="par-assessment-subj-dot" style={{ background: c }} />
                  <div className="par-assessment-info">
                    <span className="par-assessment-subj">{a.subject}</span>
                    <span className="par-assessment-date">
                      {new Date(a.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="par-assessment-score-wrap">
                    <div className="par-assessment-bar-track">
                      <div className="par-assessment-bar-fill" style={{ width: `${a.score}%`, background: c }} />
                    </div>
                    <span className="par-assessment-score" style={{ color: c }}>{a.score}%</span>
                  </div>
                  {a.flagged && (
                    <span className="par-assessment-flag" title="Flagged">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M4 3v18M4 4h13l-2.5 3.5L17 11H4" />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* SUBJECTS — rings per subject */}
        <section className="card nd-card" style={{ gridArea: "subjects", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div className="nd-card-header">
            <h2 className="nd-section-title">Subject Breakdown</h2>
            <span className="nd-pill" style={{ color: clr, background: clr + "18" }}>
              Avg {overallScore}%
            </span>
          </div>
          {Object.keys(bySubject).length === 0 ? (
            <div style={{ color: "var(--ink-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>No data yet.</div>
          ) : (
            <div className="par-subject-rings-grid">
              {Object.entries(bySubject).map(([sub, avg]) => (
                <SubjectRing key={sub} subject={sub} score={avg} />
              ))}
            </div>
          )}
          {/* overall bar */}
          <div className="par-overall-bar-wrap">
            <div className="par-overall-bar-label">
              <span>Overall Performance</span>
              <span style={{ color: clr, fontWeight: 700 }}>{overallScore}% — {scoreLabel(overallScore)}</span>
            </div>
            <div className="par-assessment-bar-track" style={{ height: 10 }}>
              <div className="par-assessment-bar-fill" style={{ width: `${overallScore}%`, background: clr, borderRadius: 999 }} />
            </div>
          </div>
        </section>

        {/* PROFILE + SUMMARY */}
        <aside className="card nd-card nd-profile-card" style={{ gridArea: "profile" }}>
          {/* profile block */}
          <div className="nd-card-header">
            <h2 className="nd-section-title">Profile</h2>
            <span className={`par-status-badge ${student?.flagged ? "par-status-badge--risk" : "par-status-badge--ok"}`}>
              {student?.flagged ? "Extra practice this week" : "Going strong"}
            </span>
          </div>

          <div className="nd-profile-block">
            <div className="nd-profile-avatar-ring">
              <div className="nd-profile-avatar" style={{ fontSize: "1.3rem" }}>{initials(student?.name)}</div>
            </div>
            <div className="nd-profile-name" style={{ fontSize: "1rem" }}>{student?.name}</div>
            <div className="nd-profile-role">{student?.grade ?? "—"}</div>
          </div>

          {/* meta chips */}
          <div className="par-profile-chips">
            {student?.cluster && (
              <div className="par-profile-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
                </svg>
                Cluster {student.cluster}
              </div>
            )}
            {student?.language && (
              <div className="par-profile-chip">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 8l6 6M4 14l6-6 2-3" /><path d="M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
                </svg>
                {LANG_LABEL[student.language] ?? student.language}
              </div>
            )}
            <div className="par-profile-chip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              {assessments?.length ?? 0} assessments
            </div>
          </div>

          {/* divider */}
          <div style={{ borderTop: "1px solid var(--border)", margin: "0.25rem 0" }} />

          {/* AI summary panel */}
          <SummaryPanel studentId={studentId} studentName={student?.name ?? "the student"} />
        </aside>
      </div>
    </div>
  );
}
