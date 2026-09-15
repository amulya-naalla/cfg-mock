const mongoose = require('mongoose');
const Content = require('../models/Content');
const { translateText } = require('../services/translate');
const { getStudentPace, maxDepthForPace } = require('../services/pace');

async function getContent(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid content id format' });
  }
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
  const lang = req.query.lang || req.body.lang;
  if (!lang || typeof lang !== 'string') {
    return res.status(400).json({ error: 'lang param is required' });
  }
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid content id format' });
  }

  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });

  if (typeof content.original_text !== 'string' || content.original_text.trim() === '') {
    return res.status(400).json({ error: 'Content has no original_text to translate' });
  }

  if (content.localized_text && content.localized_text[lang]) {
    return res.json(content);
  }

  const translated = await translateText(content.original_text, lang);

  content.localized_text = { ...content.localized_text, [lang]: translated };
  content.markModified('localized_text');
  await content.save();

  res.json(content);
}

// Convenience route for demo prep only — not in the API contract. Pre-translates any content
// missing a `ta` localization in one call so lessons don't need to be hit individually.
async function translateAll(req, res) {
  const lang = req.query.lang || req.body.lang || 'ta';
  const contents = await Content.find();

  const results = [];
  for (const content of contents) {
    if (content.localized_text && content.localized_text[lang]) {
      results.push({ id: content._id, status: 'cached' });
      continue;
    }
    const translated = await translateText(content.original_text, lang);
    content.localized_text = { ...content.localized_text, [lang]: translated };
    content.markModified('localized_text');
    await content.save();
    results.push({ id: content._id, status: 'translated' });
  }

  res.json({ lang, count: results.length, results });
}

async function submitQuiz(req, res) {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: 'Invalid content id format' });
  }

  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });

  if (!Array.isArray(content.quiz) || content.quiz.length === 0) {
    return res.status(400).json({ error: 'This content has no quiz' });
  }

  const { answers } = req.body;
  if (!Array.isArray(answers) || answers.length !== content.quiz.length) {
    return res.status(400).json({
      error: `answers must be an array of ${content.quiz.length} option indices`,
    });
  }

  const results = content.quiz.map((q, i) => ({ correct: answers[i] === q.correct_index }));
  const score = results.filter((r) => r.correct).length;

  res.json({ score, total: content.quiz.length, results });
}

module.exports = { getContent, translateContent, translateAll, submitQuiz };
