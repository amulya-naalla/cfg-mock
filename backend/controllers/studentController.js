const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

async function getStudents(req, res) {
  try {
    const { search, district, cluster, grade, language, language_pref, flagged } = req.query;
    const filter = {};

    if (cluster) filter.cluster = cluster;
    if (district) filter.district = district;
    if (grade) filter.grade = Number(grade);

    const lang = language_pref || language;
    if (lang) filter.language_pref = lang;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { guardian_name: { $regex: search, $options: 'i' } },
      ];
    }

    if (flagged === 'true' || flagged === true) {
      const flaggedAssessments = await Assessment.distinct('student_id', { flagged: true });
      filter._id = { $in: flaggedAssessments };
    }

    const students = await Student.find(filter).sort({ name: 1 });
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
