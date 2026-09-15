const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

async function getStudents(req, res) {
  try {
    const { cluster } = req.query;
    const filter = cluster ? { cluster } : {};
    const students = await Student.find(filter);
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getStudentById(req, res) {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    const assessments = await Assessment.find({ student_id: req.params.id }).sort({ date: -1 });
    const studentObj = student.toObject();
    studentObj.assessments = assessments;
    res.json(studentObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createStudent(req, res) {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = { getStudents, getStudentById, createStudent };
