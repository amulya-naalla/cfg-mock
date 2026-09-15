const axios = require('axios');

const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

// Calls MyMemory. On any failure (timeout, bad response, unsupported lang),
// logs a warning and falls back to returning the original text so callers never crash.
async function translateText(text, targetLang, sourceLang = 'en') {
  if (!text || !targetLang) return text;

  try {
    const res = await axios.get(MYMEMORY_URL, {
      params: { q: text, langpair: `${sourceLang}|${targetLang}` },
      timeout: 5000,
    });

    // MyMemory returns HTTP 200 even for an invalid langpair, with an error message stuffed
    // into translatedText and responseStatus set to a non-200 code (as a string) — check that
    // explicitly or an "invalid target language" message gets returned as if it were real text.
    const status = res.data && Number(res.data.responseStatus);
    const translated = res.data && res.data.responseData && res.data.responseData.translatedText;
    if (status !== 200 || !translated) {
      throw new Error(`MyMemory did not return a valid translation (status ${status})`);
    }
    return translated;
  } catch (err) {
    console.warn(`translateText: falling back to original text (${sourceLang}->${targetLang}): ${err.message}`);
    return text;
  }
}

module.exports = { translateText };
