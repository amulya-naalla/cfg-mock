const Assessment = require('../models/Assessment');

const FLAG_THRESHOLD_DIFF = 15;

async function createAssessment(req, res) {
  try {
    const { student_id, subject, score, grade_level_expected, cluster, date } = req.body;
    const expected = grade_level_expected !== undefined ? Number(grade_level_expected) : 50;
    const isFlagged = Number(score) < (expected - FLAG_THRESHOLD_DIFF);

    const assessment = await Assessment.create({
      student_id,
      date: date || new Date(),
      subject,
      score: Number(score),
      grade_level_expected: expected,
      cluster,
      flagged: isFlagged,
    });
    res.status(201).json(assessment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getAssessments(req, res) {
  try {
    const { student_id } = req.query;
    const filter = student_id ? { student_id } : {};
    const assessments = await Assessment.find(filter).sort({ date: -1 });
    res.json(assessments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = { createAssessment, getAssessments, FLAG_THRESHOLD_DIFF };
