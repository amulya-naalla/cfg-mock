import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function ClusterBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="cluster" label={{ value: 'Cluster', position: 'insideBottom', offset: -4 }} />
        <YAxis domain={[0, 100]} label={{ value: 'Avg score', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Bar dataKey="avg" fill="#4f46e5" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
