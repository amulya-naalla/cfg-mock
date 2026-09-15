/**
 * Student-profile derivation logic.
 *
 * The student profile is SEPARATE from the educator profile: everything here
 * reads LocalStore records for the logged-in student id (config.js STUDENT).
 *
 * Recommendations follow the same adaptive model as the educator app
 * (see utils/adaptive.js): Age/Grade + Learning Level + Performance +
 * Learning Gap + Language — never age alone.
 */

import {
  LocalStore,
  SKILL_LABELS,
  LANG_LABELS,
} from '../data/mockData.js';
import { STUDENT_PROFILE } from '../config.js';
import { scoreContentForStudent } from './adaptive.js';

/* -------------------------------------------------------------------------
 * Current student
 * ------------------------------------------------------------------------- */

export function getCurrentStudent() {
  const students = LocalStore.getStudents();
  return (
    students.find((s) => String(s._id) === String(STUDENT_PROFILE.id)) ||
    students[0] ||
    null
  );
}

/* -------------------------------------------------------------------------
 * Progress + activity
 * ------------------------------------------------------------------------- */

export function getMyProgress() {
  const student = getCurrentStudent();
  if (!student) return [];
  return LocalStore.getStudentProgress().filter(
    (p) => String(p.student_id) === String(student._id)
  );
}

/** All student-visible progress rows joined with their content items. */
export function getProgressWithContent() {
  const content = LocalStore.getContent();
  return getMyProgress()
    .map((p) => ({ ...p, content: content.find((c) => c._id === p.content_id) || null }))
    .filter((p) => p.content);
}

/** The most recent in-progress item — drives the "Continue Learning" card. */
export function getContinueItem() {
  const inProgress = getProgressWithContent()
    .filter((p) => p.status === 'in-progress')
    .sort((a, b) => (a.last_opened < b.last_opened ? 1 : -1));
  return inProgress[0] || null;
}

/** Days in a row (incl. today) with any logged activity. */
export function getStreak() {
  const log = LocalStore.getStudentActivity();
  const set = new Set(log.map((a) => a.date));
  let streak = 0;
  const d = new Date();
  for (;;) {
    const iso = d.toISOString().split('T')[0];
    if (!set.has(iso)) break;
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function sevenDaysAgo() {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Total minutes learned over the last 7 days (incl. today). */
export function getWeeklyMinutes() {
  const cutoff = sevenDaysAgo();
  return LocalStore.getStudentActivity()
    .filter((a) => new Date(a.date) >= cutoff)
    .reduce((sum, a) => sum + (Number(a.minutes) || 0), 0);
}

/* -------------------------------------------------------------------------
 * Adaptive recommendations for the logged-in student
 * ------------------------------------------------------------------------- */

/** Score every item, drop weak matches, sort best-first. */
export function getMyRecommendations(content, limit = 4) {
  const student = getCurrentStudent();
  if (!student) return [];
  return content
    .map((c) => ({ content: c, ...scoreContentForStudent(c, student) }))
    .filter((r) => r.score >= 55)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Focus areas: the student's primary learning gap first, then subjects with
 * the lowest latest assessment score. Returns [{ key, label, pct, hint }].
 */
export function getFocusAreas(student, limit = 3) {
  const areas = [];

  if (student.primary_gap && SKILL_LABELS[student.primary_gap]) {
    areas.push({
      key: student.primary_gap,
      label: SKILL_LABELS[student.primary_gap],
      pct: null,
      hint: 'Your main focus area — practice a little every day',
    });
  }

  const assessments = LocalStore.getAssessments()
    .filter((a) => String(a.student_id) === String(student._id))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Latest score per subject, weakest first
  const latestBySubject = {};
  assessments.forEach((a) => {
    latestBySubject[a.subject] = Number(a.score);
  });
  Object.entries(latestBySubject)
    .filter(([, score]) => Number.isFinite(score) && score < 60)
    .sort((a, b) => a[1] - b[1])
    .forEach(([subject, score]) => {
      if (areas.length >= limit + 2) return;
      if (areas.some((x) => x.key === subject.toLowerCase())) return;
      areas.push({
        key: subject.toLowerCase(),
        label: subject,
        pct: score,
        hint: `Last score ${score}/100 — keep practicing to reach 60`,
      });
    });

  return areas.slice(0, limit);
}

/* -------------------------------------------------------------------------
 * Achievements
 * ------------------------------------------------------------------------- */

/** Achievements sorted earned-first, then locked. */
export function getSortedAchievements() {
  return LocalStore.getStudentAchievements()
    .slice()
    .sort((a, b) => {
      if (a.earned_at && !b.earned_at) return -1;
      if (!a.earned_at && b.earned_at) return 1;
      return (a.earned_at || '') < (b.earned_at || '') ? 1 : -1;
    });
}

/* -------------------------------------------------------------------------
 * Language helpers (English / Tamil / Telugu quick selector)
 * ------------------------------------------------------------------------- */

export const QUICK_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ta', label: 'Tamil' },
  { code: 'te', label: 'Telugu' },
];

export function langLabel(code) {
  return LANG_LABELS[code] || code;
}

/* -------------------------------------------------------------------------
 * One-call derivation for the Student Dashboard
 * ------------------------------------------------------------------------- */

export function deriveStudentDashboard() {
  const student = getCurrentStudent();
  if (!student) return null;

  const content = LocalStore.getContent();
  const progressRows = getProgressWithContent();

  const completedCount = progressRows.filter((p) => p.status === 'completed').length;
  const inProgressCount = progressRows.filter((p) => p.status === 'in-progress').length;
  const overallPct = progressRows.length
    ? Math.round(
        progressRows.reduce((s, p) => s + (p.progress_pct || 0), 0) / progressRows.length
      )
    : 0;

  return {
    student,
    progressRows,
    achievements: getSortedAchievements(),
    continueItem: getContinueItem(),
    streak: getStreak(),
    weeklyMinutes: getWeeklyMinutes(),
    focusAreas: getFocusAreas(student, 3),
    recommended: getMyRecommendations(content, 4),
    metrics: {
      completedCount,
      inProgressCount,
      overallPct,
      totalRows: progressRows.length,
    },
  };
}
