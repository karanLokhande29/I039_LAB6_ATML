import { Link } from "react-router-dom";
import summary from "../data/frontend_summary.json";
import phase1 from "../data/frontend_data_phase1.json";
import phase3 from "../data/frontend_data_phase3.json";
import { CombinedLossChart } from "../components/LossChart.jsx";
import SummaryTable from "../components/SummaryTable.jsx";
import TranslateDemo from "../components/TranslateDemo.jsx";
import BackendStatusBar from "../components/BackendStatusBar.jsx";
import { fmtBleu } from "../utils/format.js";

const HINDI_SAMPLES = ["Hello, how are you?", "The weather is nice", "I love ML", "What time is it?", "She is reading a book"];
const SPANISH_SAMPLES = [
  "Good morning, where are you going?",
  "I want to learn Spanish.",
  "The train arrives at noon.",
  "He works at a hospital.",
  "We are studying together.",
];

export default function Dashboard() {
  const phases = summary.phases || [];
  const p1 = phases.find((x) => x.id === 1);
  const p3 = phases.find((x) => x.id === 3);

  return (
    <div>
      <header style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: "0 0 0.35rem", fontSize: 28 }}>ATML Lab 6 — Encoder-Decoder Results</h1>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 15 }}>B.Tech AI Sem 6 · NMIMS · Dr. Ami Munshi</p>
        <p style={{ margin: "0.5rem 0 0", color: "#9ca3af", fontSize: 13 }}>Generated: {summary.generated_at}</p>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "2rem" }}>
        <PhaseSummaryCard
          title="Phase 1"
          subtitle="Eng → Hindi"
          bleu={fmtBleu(p1?.final_bleu)}
          detail="Epochs: 300"
          to="/phase1"
        />
        <PhaseSummaryCard
          title="Phase 2"
          subtitle="Performance Analysis"
          bleu={null}
          detail="See loss curve"
          to="/phase2"
        />
        <PhaseSummaryCard
          title="Phase 3"
          subtitle="Eng → Spanish"
          bleu={fmtBleu(p3?.final_bleu)}
          detail="Epochs: 150 (checkpoint)"
          to="/phase3"
        />
      </div>

      <section style={{ marginBottom: "2.5rem" }}>
        <CombinedLossChart phase1={phase1} phase3={phase3} chartTitle="Training Loss — All Phases" />
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ margin: "0 0 1rem", fontSize: 20 }}>Quick Translation Test</h2>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "1rem" }}>
          <TranslateDemo
            phase={1}
            fromLang="English"
            toLang="Hindi"
            endpoint="http://localhost:5001/translate/hindi"
            sampleSentences={HINDI_SAMPLES}
            compact
            subheading="English → Hindi"
            showSamples={false}
          />
          <TranslateDemo
            phase={3}
            fromLang="English"
            toLang="Spanish"
            endpoint="http://localhost:5001/translate/spanish"
            sampleSentences={SPANISH_SAMPLES}
            compact
            subheading="English → Spanish"
            showSamples={false}
          />
        </div>
      </section>

      <section style={{ marginBottom: "1rem" }}>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: 20 }}>Phase 2 plot</h2>
        <p style={{ color: "#6b7280", fontSize: 14 }}>See also the dedicated Phase 2 page.</p>
        <img
          src="/phase2_loss_curve.png"
          alt="Phase 2 loss curve"
          style={{ maxWidth: "100%", border: "1px solid #eee", borderRadius: 8 }}
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      </section>

      <section>
        <h2 style={{ margin: "0 0 0.75rem", fontSize: 20 }}>Summary</h2>
        <SummaryTable phases={phases} />
      </section>

      <BackendStatusBar />
    </div>
  );
}

function PhaseSummaryCard({ title, subtitle, bleu, detail, to }) {
  return (
    <div
      style={{
        flex: "1 1 220px",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        background: "#fafafa",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div>
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
        <div style={{ color: "#4b5563", fontSize: 14 }}>{subtitle}</div>
      </div>
      <div style={{ fontSize: 13, color: "#059669", fontWeight: 700 }}>● COMPLETE</div>
      {detail && <div style={{ fontSize: 13, color: "#6b7280" }}>{detail}</div>}
      {bleu && bleu !== "—" && (
        <div style={{ fontSize: 14 }}>
          BLEU: <strong>{bleu}</strong>
        </div>
      )}
      <Link
        to={to}
        style={{
          marginTop: "auto",
          alignSelf: "flex-start",
          fontSize: 14,
          fontWeight: 600,
          color: "#5b21b6",
          textDecoration: "none",
        }}
      >
        View Details →
      </Link>
    </div>
  );
}
