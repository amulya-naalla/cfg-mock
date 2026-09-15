const Student = require('../models/Student');
const Assessment = require('../models/Assessment');
const { translateText } = require('../services/translate');

async function generateParentSummary(req, res) {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });

  const [latest] = await Assessment.find({ student_id: student._id }).sort({ date: -1 }).limit(1);

  let summary_en;
  if (!latest) {
    summary_en = `${student.name} (Grade ${student.grade}) hasn't completed any assessments yet.`;
  } else {
    const note = latest.flagged ? "let's keep practicing." : 'great improvement!';
    summary_en = `${student.name} (Grade ${student.grade}) scored ${latest.score}/100 in ${latest.subject} this week — ${note}`;
  }

  const language = student.language_pref || 'en';
  const summary_localized = language === 'en' ? summary_en : await translateText(summary_en, language);

  res.json({
    studentId: student._id,
    name: student.name,
    summary_en,
    summary_localized,
    language,
  });
}

module.exports = { generateParentSummary };
