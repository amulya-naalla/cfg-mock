import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client.js';

export default function ContentScreen() {
  const { id } = useParams();
  const [content, setContent] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setContent(null);
    setError(null);
    client
      .get(`/api/content/${id}`)
      .then((res) => setContent(res.data))
      .catch(() => setError('Could not load this lesson.'));
  }, [id]);

  if (error) return <p>{error}</p>;
  if (!content) return <p>Loading...</p>;

  const tamil = content.localized_text?.ta;

  return (
    <div>
      <h1>{content.title}</h1>
      <p className="content-meta">
        {content.subject} · Grade {content.grade_level}
      </p>

      <div className="content-columns">
        <div className="content-column">
          <h2>English</h2>
          <p>{content.original_text}</p>
        </div>
        <div className="content-column">
          <h2>Tamil</h2>
          {tamil ? <p>{tamil}</p> : <p className="content-pending">Translation pending</p>}
        </div>
      </div>
    </div>
  );
}
