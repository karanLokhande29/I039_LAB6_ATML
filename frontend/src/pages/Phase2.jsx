import { Link } from "react-router-dom";
import phase2 from "../data/frontend_data_phase2.json";

export default function Phase2() {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        <Link to="/">Dashboard</Link> &gt; Phase 2
      </div>
      <h2 style={{ marginTop: 0 }}>Phase 2 — Performance Analysis</h2>
      <p style={{ color: "#4b5563", maxWidth: 720 }}>{phase2.note}</p>
      <p style={{ fontSize: 14, color: "#6b7280" }}>Plot file: {phase2.plot}</p>
      <img
        src="/phase2_loss_curve.png"
        alt="Phase 2 loss curve"
        style={{ maxWidth: "100%", border: "1px solid #eee", borderRadius: 8, marginTop: 16 }}
        onError={(e) => {
          e.target.style.display = "none";
        }}
      />
    </div>
  );
}
