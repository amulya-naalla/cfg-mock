const mongoose = require('mongoose');
const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

async function getStudents(req, res) {
  try {
    const { cluster, guardian_contact } = req.query;
    const filter = {};
    if (cluster) filter.cluster = cluster;
    if (guardian_contact) filter.guardian_contact = guardian_contact;
    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentById(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid student id format' });
    }
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const assessments = await Assessment.find({ student_id: req.params.id }).sort({ date: -1 });
    const studentObj = student.toObject();
    studentObj.assessments = assessments;
    studentObj.scoreTrend = [...assessments]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((a) => ({ date: a.date, score: a.score, subject: a.subject }));
    res.json(studentObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createStudent(req, res) {
  const { name, grade } = req.body;
  if (!name || grade === undefined || grade === null) {
    return res.status(400).json({ error: 'name and grade are required' });
  }

  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getStudents, getStudentById, createStudent };
