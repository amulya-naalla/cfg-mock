const Assessment = require('../models/Assessment');

async function getStudentPace(studentId) {
  const assessments = await Assessment.find({ student_id: studentId })
    .sort({ createdAt: -1 })
    .limit(5);

  if (assessments.length === 0) return 'medium';

  const avg = assessments.reduce((sum, a) => sum + a.score, 0) / assessments.length;

  if (avg >= 75) return 'fast';
  if (avg >= 50) return 'medium';
  return 'slow';
}

function maxDepthForPace(pace) {
  const depths = { fast: 0, medium: 1, slow: 2 };
  return depths[pace] ?? 1;
}

module.exports = { getStudentPace, maxDepthForPace };
