const express = require('express');
const { translateText } = require('../services/translate');

const router = express.Router();

// Manual sanity check for the MyMemory integration: GET /api/_test/translate?text=hello&lang=ta
router.get('/translate', async (req, res) => {
  const { text, lang } = req.query;
  if (!text || !lang) return res.status(400).json({ error: 'text and lang query params are required' });

  const translated = await translateText(text, lang);
  res.json({ text, lang, translated });
});

module.exports = router;
