import { useEffect, useState } from 'react';
import client from '../api/client.js';
import ClusterBarChart from '../components/ClusterBarChart.jsx';

const MOCK_SUMMARY = {
  totalStudents: 12,
  percentFlagged: 30,
  avgScoreByCluster: [
    { cluster: 'A', avg: 65 },
    { cluster: 'B', avg: 72 },
    { cluster: 'C', avg: 58 },
  ],
};

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [isMocked, setIsMocked] = useState(false);

  useEffect(() => {
    client
      .get('/api/dashboard/summary')
      .then((res) => setSummary(res.data))
      .catch(() => {
        setSummary(MOCK_SUMMARY);
        setIsMocked(true);
      });
  }, []);

  if (!summary) return <p>Loading...</p>;

  const flaggedHigh = summary.percentFlagged >= 40;

  return (
    <div>
      <h1>Leadership Dashboard</h1>
      {isMocked && <p className="content-pending">Showing mock data — backend not reachable.</p>}

      <div className="stat-row">
        <div className="stat-tile">
          <span className="stat-value">{summary.totalStudents}</span>
          <span className="stat-label">Total students</span>
        </div>
        <div className={`stat-tile ${flaggedHigh ? 'stat-tile-alert' : ''}`}>
          <span className="stat-value">{summary.percentFlagged}%</span>
          <span className="stat-label">Flagged</span>
        </div>
      </div>

      <h2>Average score by cluster</h2>
      <ClusterBarChart data={summary.avgScoreByCluster} />
    </div>
  );
}
