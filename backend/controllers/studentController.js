const Student = require('../models/Student');

async function getStudents(req, res) {
  const students = await Student.find();
  res.json(students);
}

async function createStudent(req, res) {
  const student = await Student.create(req.body);
  res.status(201).json(student);
}

module.exports = { getStudents, createStudent };
