import { useState } from 'react';
import client from '../api/client.js';

export default function NewAssessmentForm() {
  const [form, setForm] = useState({ student_id: '', subject: '', score: '', cluster: '' });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await client.post('/api/assessments', { ...form, score: Number(form.score) });
    setSubmitted(true);
  }

  return (
    <div>
      <h1>New Assessment</h1>
      <form onSubmit={handleSubmit}>
        <input name="student_id" placeholder="Student ID" value={form.student_id} onChange={handleChange} required />
        <input name="subject" placeholder="Subject" value={form.subject} onChange={handleChange} required />
        <input name="score" type="number" placeholder="Score" value={form.score} onChange={handleChange} required />
        <input name="cluster" placeholder="Cluster" value={form.cluster} onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
      {submitted && <p>Assessment submitted.</p>}
    </div>
  );
}
