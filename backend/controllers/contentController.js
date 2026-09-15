const Content = require('../models/Content');
const translateText = require('../utils/translateClient');
const { getStudentPace, maxDepthForPace } = require('../services/pace');

async function getContent(req, res) {
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });

  const { student_id: studentId } = req.query;
  if (!studentId) {
    return res.json(content);
  }

  const pace = await getStudentPace(studentId);
  const result = content.toObject();
  result.resolved_pace = pace;

  if (Array.isArray(content.steps) && content.steps.length > 0) {
    const maxDepth = maxDepthForPace(pace);
    result.resolved_steps = content.steps.filter((step) => step.depth <= maxDepth);
  } else {
    const variantText = content.variants && content.variants[pace];
    result.resolved_text = variantText || content.original_text;
  }

  res.json(result);
}

async function translateContent(req, res) {
  const { lang } = req.body;
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });

  const cached = content.localized_text.get(lang);
  if (cached) {
    return res.json({ language: lang, body: cached });
  }

  const translated = await translateText(content.original_text, lang);
  content.localized_text.set(lang, translated);
  await content.save();

  res.json({ language: lang, body: translated });
}

module.exports = { getContent, translateContent };
