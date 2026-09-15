import { useState } from 'react';
import client from '../api/client.js';

export default function ContentScreen() {
  const [contentId, setContentId] = useState('');
  const [lang, setLang] = useState('hi');
  const [content, setContent] = useState(null);

  async function handleLoad() {
    const res = await client.get(`/api/content/${contentId}`);
    setContent(res.data);
  }

  async function handleTranslate() {
    const res = await client.post(`/api/content/${contentId}/translate`, { lang });
    setContent(res.data);
  }

  return (
    <div>
      <h1>Content</h1>
      <input placeholder="Content ID" value={contentId} onChange={(e) => setContentId(e.target.value)} />
      <button onClick={handleLoad}>Load</button>
      <input placeholder="Language code" value={lang} onChange={(e) => setLang(e.target.value)} />
      <button onClick={handleTranslate}>Translate</button>
      {content && (
        <div>
          <h2>{content.title}</h2>
          <p>{content.original_text}</p>
        </div>
      )}
    </div>
  );
}
