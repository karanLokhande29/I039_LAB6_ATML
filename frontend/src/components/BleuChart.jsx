import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BleuChart({ bleu, title }) {
  const data = (bleu || []).map((b, i) => ({ epoch: i + 1, bleu: b }));
  return (
    <div style={{ width: "100%", height: 320 }}>
      <h3 style={{ margin: "0 0 0.5rem" }}>{title}</h3>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="epoch" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="bleu" name="BLEU" stroke="#059669" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
