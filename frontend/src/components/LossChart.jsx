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

function mergeCombined(phase1, phase3) {
  const p1t = phase1?.train_loss || [];
  const p1v = phase1?.val_loss || [];
  const p3t = phase3?.train_loss || [];
  const p3v = phase3?.val_loss || [];
  const maxLen = Math.max(p1t.length, p1v.length, p3t.length, p3v.length, 1);
  const rows = [];
  for (let i = 0; i < maxLen; i++) {
    const epoch = i + 1;
    rows.push({
      epoch,
      p1Train: p1t[i] ?? null,
      p1Val: p1v[i] ?? null,
      p3Train: p3t[i] ?? null,
      p3Val: p3v[i] ?? null,
    });
  }
  return rows;
}

export function CombinedLossChart({ phase1, phase3, chartTitle = "Training Loss — All Phases" }) {
  const data = mergeCombined(phase1, phase3);
  return (
    <section style={{ width: "100%" }}>
      <h2 style={{ margin: "0 0 0.75rem", fontSize: 20 }}>{chartTitle}</h2>
      <div style={{ width: "100%", height: 380 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="epoch" label={{ value: "Epoch", position: "insideBottomRight", offset: -4 }} />
            <YAxis label={{ value: "Loss", angle: -90, position: "insideLeft" }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="p1Train" name="Phase 1 train" stroke="#7c3aed" dot={false} strokeWidth={2} connectNulls />
            <Line
              type="monotone"
              dataKey="p1Val"
              name="Phase 1 val"
              stroke="#7c3aed"
              strokeDasharray="6 4"
              dot={false}
              strokeWidth={2}
              connectNulls
            />
            <Line type="monotone" dataKey="p3Train" name="Phase 3 train" stroke="#2563eb" dot={false} strokeWidth={2} connectNulls />
            <Line
              type="monotone"
              dataKey="p3Val"
              name="Phase 3 val"
              stroke="#2563eb"
              strokeDasharray="6 4"
              dot={false}
              strokeWidth={2}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

export function SinglePhaseLossChart({ train, val, title }) {
  const data = (train || []).map((t, i) => ({
    epoch: i + 1,
    train: t,
    val: val?.[i] ?? null,
  }));
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
          <Line type="monotone" dataKey="train" name="Train loss" stroke="#7c3aed" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="val" name="Val loss" stroke="#a78bfa" strokeDasharray="6 4" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CombinedLossChart;
