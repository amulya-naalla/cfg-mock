import { useEffect, useState } from 'react';
import client from '../api/client.js';
import ClusterBarChart from '../components/ClusterBarChart.jsx';

export default function Dashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    client.get('/api/dashboard/summary').then((res) => setSummary(res.data));
  }, []);

  if (!summary) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Total assessments: {summary.totalAssessments}</p>
      <p>Flagged: {summary.flaggedCount}</p>
      <ClusterBarChart data={summary.byCluster} />
    </div>
  );
}
