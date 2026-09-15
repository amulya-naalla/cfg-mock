const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const Session = require('../models/Session');

async function getSummary(req, res) {
  const totalStudents = await Student.countDocuments();

  const assessments = await Assessment.find();

  const flaggedStudentIds = new Set(
    assessments.filter((a) => a.flagged).map((a) => String(a.student_id))
  );
  const percentFlagged = totalStudents === 0 ? 0 : (flaggedStudentIds.size / totalStudents) * 100;

  // Verified with Backend 1: cluster lives on `students`, not `assessments` — join through student_id.
  let avgScoreByCluster = [];
  if (assessments.length > 0) {
    const students = await Student.find({}, 'cluster');
    const clusterByStudentId = new Map(students.map((s) => [String(s._id), s.cluster || 'uncategorized']));

    const clusterTotals = {};
    for (const a of assessments) {
      const cluster = clusterByStudentId.get(String(a.student_id)) || 'uncategorized';
      if (!clusterTotals[cluster]) clusterTotals[cluster] = { sum: 0, count: 0 };
      clusterTotals[cluster].sum += a.score;
      clusterTotals[cluster].count += 1;
    }
    avgScoreByCluster = Object.entries(clusterTotals).map(([cluster, { sum, count }]) => ({
      cluster,
      avg: count > 0 ? sum / count : 0,
    }));
  }

  // Same aggregation pattern as avgScoreByCluster, grouped by subject instead.
  let avgScoreBySubject = [];
  if (assessments.length > 0) {
    const subjectTotals = {};
    for (const a of assessments) {
      const subject = a.subject || 'uncategorized';
      if (!subjectTotals[subject]) subjectTotals[subject] = { sum: 0, count: 0 };
      subjectTotals[subject].sum += a.score;
      subjectTotals[subject].count += 1;
    }
    avgScoreBySubject = Object.entries(subjectTotals).map(([subject, { sum, count }]) => ({
      subject,
      avg: count > 0 ? sum / count : 0,
    }));
  }

  // Flagged count bucketed by day (assessment date, not createdAt) so leadership can see
  // whether flagging is trending up or down rather than a single point-in-time percentage.
  const flaggedByDay = {};
  for (const a of assessments) {
    if (!a.flagged) continue;
    const day = new Date(a.date).toISOString().slice(0, 10);
    flaggedByDay[day] = (flaggedByDay[day] || 0) + 1;
  }
  const flaggedOverTime = Object.entries(flaggedByDay)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  const recentSessions = await Session.find()
    .sort({ date: -1 })
    .limit(5)
    .select('cluster topic date attendance_count');

  res.json({
    totalStudents,
    percentFlagged,
    avgScoreByCluster,
    avgScoreBySubject,
    flaggedOverTime,
    recentSessions: recentSessions || [],
  });
}

module.exports = { getSummary };
