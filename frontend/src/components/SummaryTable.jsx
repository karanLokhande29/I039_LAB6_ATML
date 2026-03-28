import { fmtBleu } from "../utils/format.js";

export default function SummaryTable({ phases }) {
  return (
    <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
      <thead>
        <tr style={{ background: "#f3f4f6" }}>
          <th style={th}>Phase</th>
          <th style={th}>Task</th>
          <th style={th}>Epochs</th>
          <th style={th}>BLEU</th>
          <th style={th}>Status</th>
        </tr>
      </thead>
      <tbody>
        {(phases || []).map((p) => (
          <tr key={p.id} style={{ borderBottom: "1px solid #eee" }}>
            <td style={td}>{p.id}</td>
            <td style={td}>{p.name}</td>
            <td style={td}>
              {p.epochs_done != null ? `${p.epochs_done}${p.total_epochs != null ? ` / ${p.total_epochs}` : ""}` : "N/A"}
            </td>
            <td style={td}>{fmtBleu(p.final_bleu)}</td>
            <td style={td}>{p.status === "skipped" ? "SKIPPED" : "COMPLETE"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const th = { textAlign: "left", padding: "8px 12px", borderBottom: "2px solid #ddd" };
const td = { padding: "8px 12px" };
