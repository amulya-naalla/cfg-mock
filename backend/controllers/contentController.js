const Content = require('../models/Content');
const { translateText } = require('../services/translate');

async function getContent(req, res) {
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });
  res.json(content);
}

async function translateContent(req, res) {
  const lang = req.query.lang || req.body.lang;
  if (!lang) return res.status(400).json({ error: 'lang param is required' });

  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });

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

module.exports = { getContent, translateContent, translateAll };
