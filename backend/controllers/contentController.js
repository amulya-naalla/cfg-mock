const Content = require('../models/Content');
const translateText = require('../utils/translateClient');

async function getContent(req, res) {
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });
  res.json(content);
}

async function translateContent(req, res) {
  const { lang } = req.body;
  const content = await Content.findById(req.params.id);
  if (!content) return res.status(404).json({ error: 'Content not found' });

  const cached = content.translations.get(lang);
  if (cached) {
    return res.json({ language: lang, body: cached });
  }

  const translated = await translateText(content.body, lang);
  content.translations.set(lang, translated);
  await content.save();

  res.json({ language: lang, body: translated });
}

module.exports = { getContent, translateContent };
