import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

export const GOOD = '#3f9142';
export const WARNING = '#b9791f';
export const CRITICAL = '#c1543f';

export function clusterStatus(avg) {
  if (avg >= 70) return 'good';
  if (avg >= 50) return 'watch';
  return 'risk';
}

export function colorFor(avg) {
  const status = clusterStatus(avg);
  if (status === 'good') return GOOD;
  if (status === 'watch') return WARNING;
  return CRITICAL;
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { cluster, avg } = payload[0].payload;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-cluster">Cluster {cluster}</div>
      <div>Avg score: {avg}</div>
    </div>
  );
}

export default function ClusterBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }} barCategoryGap="32%">
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3ddcd" />
        <XAxis
          dataKey="cluster"
          axisLine={{ stroke: '#c9c2ac' }}
          tickLine={false}
          tick={{ fill: '#5c6b74', fontSize: 12 }}
        />
        <YAxis
          domain={[0, 100]}
          axisLine={{ stroke: '#c9c2ac' }}
          tickLine={false}
          tick={{ fill: '#5c6b74', fontSize: 12 }}
          width={32}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(34,50,63,0.05)' }} />
        <Bar dataKey="avg" radius={[5, 5, 0, 0]} maxBarSize={44}>
          {data.map((entry) => (
            <Cell key={entry.cluster} fill={colorFor(entry.avg)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
