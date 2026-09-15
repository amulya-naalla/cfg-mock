/**
 * Adaptive matching & dashboard derivation logic.
 *
 * Content is NOT recommended by age alone. Every recommendation blends:
 *   Age/Grade + Learning Level + Learning Gap + Language
 * so a struggling Grade-7 reader gets beginner reading content in their own
 * language, not "all Grade 7 content".
 */

import {
  SKILL_LABELS,
  LANG_LABELS,
  DIFFICULTIES,
  LocalStore,
} from '../data/mockData.js';

// Learning level -> the difficulty that fits that student right now
export const LEVEL_DIFFICULTY = {
  below: 'Beginner',
  'on-track': 'Intermediate',
  ahead: 'Advanced',
};

export const PRIORITY_META = {
  high: { label: 'High Priority', className: 'priority-high' },
  medium: { label: 'Medium Priority', className: 'priority-medium' },
  low: { label: 'Monitor', className: 'priority-low' },
};

/**
 * Priority for the "Students Needing Attention" list.
 * Returns null for students who do not need attention.
 */
export function getAttentionPriority(student) {
  const score = Number(student.last_score);
  const hasScore = Number.isFinite(score);
  if (student.flagged && (!hasScore || score < 35)) return 'high';
  if (student.flagged) return 'medium';
  if (hasScore && score < 40) return 'medium';
  if (student.primary_gap && student.learning_level === 'below') return 'medium';
  return null;
}

export function getAttentionList(students) {
  return students
    .map((s) => ({ ...s, priority: getAttentionPriority(s) }))
    .filter((s) => s.priority)
    .sort((a, b) => {
      const rank = { high: 0, medium: 1, low: 2 };
      if (rank[a.priority] !== rank[b.priority]) return rank[a.priority] - rank[b.priority];
      return (a.last_score ?? 100) - (b.last_score ?? 100);
    });
}

/**
 * Score a content item against ONE student across all adaptive factors.
 * Max ~100 for a perfect match. Returns { score, reasons[] }.
 */
export function scoreContentForStudent(content, student) {
  let score = 0;
  const reasons = [];

  // 1. Language match (strongest practical factor for community educators)
  if (student.language && content.language === student.language) {
    score += 30;
    reasons.push(`${LANG_LABELS[content.language] || content.language} language`);
  }

  // 2. Learning-gap / skill match
  if (student.primary_gap && content.skill === student.primary_gap) {
    score += 30;
    reasons.push(`targets ${SKILL_LABELS[content.skill] || content.skill}`);
  }

  // 3. Learning level -> difficulty fit (adjacent levels still get partial credit)
  const wanted = LEVEL_DIFFICULTY[student.learning_level] || 'Intermediate';
  if (content.difficulty === wanted) {
    score += 20;
    reasons.push(`${wanted.toLowerCase()} level`);
  } else {
    const delta =
      DIFFICULTIES.indexOf(content.difficulty) - DIFFICULTIES.indexOf(wanted);
    if (delta === -1) {
      score += 8;
      reasons.push('easier entry point to rebuild confidence');
    } else if (delta === 1) {
      score += 4;
      reasons.push('one step above current level (stretch)');
    }
  }

  // 4. Age fit
  const age = Number(student.age);
  if (age && content.age_min <= age && age <= content.age_max) {
    score += 12;
    reasons.push(`age ${content.age_min}–${content.age_max}`);
  }

  // 5. Grade fit
  if (student.grade && Array.isArray(content.grades) && content.grades.includes(String(student.grade))) {
    score += 8;
    reasons.push(`grade ${student.grade}`);
  }

  return { score, reasons };
}

/**
 * Best-matching content for each student who needs attention.
 * Returns [{ student, content, score, reasons }] sorted by score desc.
 */
export function getRecommendations(students, content, limit = 4) {
  const needAttention = getAttentionList(students);
  const out = [];
  needAttention.forEach((student) => {
    let best = null;
    content.forEach((c) => {
      const { score, reasons } = scoreContentForStudent(c, student);
      if (!best || score > best.score) best = { content: c, score, reasons };
    });
    if (best && best.score >= 40) {
      out.push({ student, content: best.content, score: best.score, reasons: best.reasons });
    }
  });
  return out.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Students whose latest assessment improved over the previous one.
 */
export function getImprovedStudents(students, assessments) {
  return students
    .map((s) => {
      const mine = assessments
        .filter((a) => String(a.student_id) === String(s._id))
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      if (mine.length < 2) return null;
      const prev = mine[mine.length - 2];
      const latest = mine[mine.length - 1];
      const delta = Number(latest.score) - Number(prev.score);
      if (delta <= 0) return null;
      return {
        ...s,
        improvement: delta,
        from: prev.score,
        to: latest.score,
        subject: latest.subject,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.improvement - a.improvement);
}

/**
 * Count of students per learning-gap area (for the Learning Gaps bars).
 */
export function getGapCounts(students) {
  const counts = {};
  students.forEach((s) => {
    if (s.primary_gap) counts[s.primary_gap] = (counts[s.primary_gap] || 0) + 1;
  });
  return Object.entries(SKILL_LABELS)
    .map(([key, label]) => ({ key, label, count: counts[key] || 0 }))
    .sort((a, b) => b.count - a.count);
}

/**
 * One call that derives everything the Dashboard page renders.
 */
export function deriveDashboard() {
  const students = LocalStore.getStudents();
  const assessments = LocalStore.getAssessments();
  const tasks = LocalStore.getTasks();
  const interventions = LocalStore.getInterventions();

  const attentionList = getAttentionList(students);
  const improved = getImprovedStudents(students, assessments);

  return {
    students,
    assessments,
    tasks,
    interventions,
    metrics: {
      totalStudents: students.length,
      needingAttention: attentionList.length,
      pendingTasks: tasks.filter((t) => !t.done).length,
      activeInterventions: interventions.filter((i) => i.status === 'active').length,
      showingImprovement: improved.length,
    },
    attentionList,
    gapCounts: getGapCounts(students),
    improved,
  };
}

/** Format "Grade 5 • Age 11" style meta for a student. */
export function studentMeta(student) {
  const bits = [];
  if (student.grade) bits.push(`Grade ${student.grade}`);
  if (student.age) bits.push(`Age ${student.age}`);
  return bits.join(' • ');
}
