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

// Parent-facing palette deliberately excludes alarm red: the lowest band is a
// supportive amber, so a child is never presented to their parent as an error.
function scoreColor(s) {
  if (s >= 70) return "#1bbc9d";
  if (s >= 50) return "#4a90b8";
  return "#b9791f";
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

// Hackathon stopgap, NOT real auth: there's no login/session system in this MVP, so we
// simply ask for the guardian's phone number and trust it, then use it to scope which
// students this "parent" can see. A real deployment needs actual authentication here.
const PARENT_PHONE_KEY = "parentPhone";

// The API returns assessments newest-first (sorted date:-1), so index [length-1]
// is the OLDEST record. Pick by max date instead, so this stays correct
// regardless of any future change to the API's ordering.
function latestOf(list) {
  if (!Array.isArray(list) || list.length === 0) return undefined;
  return list.reduce((a, b) => (new Date(b.date) > new Date(a.date) ? b : a));
}

export default function ParentHome() {
  const [parentPhone, setParentPhone] = useState(() => {
    try {
      return localStorage.getItem(PARENT_PHONE_KEY) || "";
    } catch {
      return "";
    }
  });
  const [phoneInput, setPhoneInput] = useState("");
  const [children, setChildren] = useState(null);
  const [isMocked, setIsMocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const load = useCallback(async (phone) => {
    setLoading(true);
    setNotFound(false);
    try {
      const studentsRes = await client.get(`/api/students?guardian_contact=${encodeURIComponent(phone)}`);
      const rawStudents = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data?.students;
      if (!rawStudents?.length) {
        setChildren([]);
        setNotFound(true);
        return;
      }

      // Fetch each child's own assessments individually (not the whole system's) so no
      // other family's assessment data ever reaches this browser.
      const assessmentsByStudent = await Promise.all(
        rawStudents.map((s) => client.get(`/api/assessments?student_id=${s._id}`).catch(() => ({ data: [] })))
      );

      // The real backend returns bare student docs — no latestScore/flagged fields.
      // Derive them from that student's most recent assessment, same as the educator's list.
      const list = rawStudents.map((student, i) => {
        const studentAsms = Array.isArray(assessmentsByStudent[i].data) ? assessmentsByStudent[i].data : [];
        const latest = latestOf(studentAsms);
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

  useEffect(() => {
    if (parentPhone) load(parentPhone);
  }, [parentPhone, load]);

  function handlePhoneSubmit(e) {
    e.preventDefault();
    const trimmed = phoneInput.trim();
    if (!trimmed) return;
    try {
      localStorage.setItem(PARENT_PHONE_KEY, trimmed);
    } catch {
      // localStorage unavailable (private mode etc.) — still proceed for this session
    }
    setParentPhone(trimmed);
  }

  function handleChangeNumber() {
    try {
      localStorage.removeItem(PARENT_PHONE_KEY);
    } catch {
      // ignore
    }
    setParentPhone("");
    setChildren(null);
  }

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

  if (!parentPhone) {
    return (
      <div className="par-page par-identity-gate">
        <div className="card par-identity-card">
          <h1 className="par-greeting">Welcome 👋</h1>
          <p className="par-subtitle">Enter your phone number to see your children&rsquo;s progress.</p>
          <form onSubmit={handlePhoneSubmit} className="par-identity-form">
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              autoFocus
            />
            <button type="submit" className="btn btn-primary">Continue</button>
          </form>
          <p className="par-identity-hint">Use the phone number your child&rsquo;s educator has on file.</p>
        </div>
      </div>
    );
  }

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
          <button type="button" className="par-icon-btn" title="Not your account? Change number" onClick={handleChangeNumber}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </button>
          <Link to="/" className="par-icon-btn" title="Home">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M3 11.5 12 4l9 7.5" /><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
            </svg>
          </Link>
        </div>
      </header>

      {/* no children found for this phone number */}
      {!loading && notFound && (
        <div className="par-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4M12 17h.01" /><circle cx="12" cy="12" r="9" />
          </svg>
          No children found for {parentPhone}. <button type="button" onClick={handleChangeNumber} className="par-link-btn">Try a different number</button>
        </div>
      )}

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
            <span className="par-stat-chip-lbl">Going strong</span>
          </div>
          <div className="par-stat-chip par-stat-chip--red">
            <span className="par-stat-chip-num">{children.filter((c) => c.flagged).length}</span>
            <span className="par-stat-chip-lbl">Extra practice</span>
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
                    Extra practice
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
