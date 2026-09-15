import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client.js';
import ParentSummaryModal from '../components/ParentSummaryModal.jsx';

export default function StudentDetail() {
  const { id } = useParams();
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    client.get(`/api/assessments?student_id=${id}`).then((res) => setAssessments(res.data));
  }, [id]);

  async function handleGenerateSummary() {
    const res = await client.post(`/api/students/${id}/parent-summary`);
    setSummary(res.data.summary);
  }

  return (
    <div>
      <h1>Student Detail</h1>
      <button onClick={handleGenerateSummary}>Generate Parent Summary</button>
      <ul>
        {assessments.map((a) => (
          <li key={a._id}>
            {a.subject}: {a.score} {a.flagged && '(flagged)'}
          </li>
        ))}
      </ul>
      <ParentSummaryModal summary={summary} onClose={() => setSummary(null)} />
    </div>
  );
}
