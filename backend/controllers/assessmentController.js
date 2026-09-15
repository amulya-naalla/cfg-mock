const mongoose = require('mongoose');
const Assessment = require('../models/Assessment');
const Student = require('../models/Student');

const FLAG_THRESHOLD_DIFF = 15;

async function createAssessment(req, res) {
  try {
    const { student_id, subject, score, grade_level_expected, cluster, date } = req.body;

    if (!student_id || !subject || score === undefined || grade_level_expected === undefined) {
      return res.status(400).json({
        error: 'student_id, subject, score, and grade_level_expected are required',
      });
    }
    if (!mongoose.Types.ObjectId.isValid(student_id)) {
      return res.status(400).json({ error: 'Invalid student_id format' });
    }
    const studentExists = await Student.exists({ _id: student_id });
    if (!studentExists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const expected = Number(grade_level_expected);
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
