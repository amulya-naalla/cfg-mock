const https = require('https');

// Wraps the MyMemory translation API (https://mymemory.translated.net/doc/spec.php)
function translateText(text, targetLang, sourceLang = 'en') {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
    text
  )}&langpair=${sourceLang}|${targetLang}`;

  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed.responseData.translatedText);
          } catch (err) {
            reject(err);
          }
        });
      })
      .on('error', reject);
  });
}

module.exports = translateText;
