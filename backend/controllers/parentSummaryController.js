const Student = require('../models/Student');
const Assessment = require('../models/Assessment');

// TODO(C): replace with a real AI-generated summary
async function generateParentSummary(req, res) {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const assessments = await Assessment.find({ student_id: student._id });
  const summary = `${student.name} has completed ${assessments.length} assessment(s).`;

  res.json({ student_id: student._id, summary });
}

module.exports = { generateParentSummary };
