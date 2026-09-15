const Assessment = require('../models/Assessment');

// TODO(B): define the real flagging thresholds/rules here
function computeFlag(score) {
  return score < 50;
}

async function createAssessment(req, res) {
  const { student_id, subject, score, cluster } = req.body;
  const assessment = await Assessment.create({
    student_id,
    subject,
    score,
    cluster,
    flagged: computeFlag(score),
  });
  res.status(201).json(assessment);
}

async function getAssessments(req, res) {
  const { student_id } = req.query;
  const filter = student_id ? { student_id } : {};
  const assessments = await Assessment.find(filter);
  res.json(assessments);
}

module.exports = { createAssessment, getAssessments };
