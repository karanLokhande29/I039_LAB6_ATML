import { Link } from "react-router-dom";
import data from "../data/frontend_data_phase1.json";
import { SinglePhaseLossChart } from "../components/LossChart.jsx";
import BleuChart from "../components/BleuChart.jsx";
import MetricCard from "../components/MetricCard.jsx";
import TranslateDemo from "../components/TranslateDemo.jsx";
import { fmtLoss, fmtBleu } from "../utils/format.js";

const SAMPLES = [
  "Hello, how are you?",
  "The weather is very nice today.",
  "I love machine learning.",
  "What time is it?",
  "She is reading a book.",
];

export default function Phase1() {
  const checkpoints = data.checkpoints || [];

  return (
    <div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        <Link to="/">Dashboard</Link> &gt; Phase 1
      </div>
      <h2 style={{ marginTop: 0 }}>Phase 1 — English → Hindi Translation</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <MetricCard label="Final Train Loss" value={fmtLoss(data.final_train_loss)} />
        <MetricCard label="Final Val Loss" value={fmtLoss(data.final_val_loss)} />
        <MetricCard label="Final BLEU" value={fmtBleu(data.final_bleu)} />
        <MetricCard label="Epochs" value="300" />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap: "1rem",
          marginBottom: "2rem",
          alignItems: "start",
        }}
      >
        <SinglePhaseLossChart train={data.train_loss} val={data.val_loss} title="Train Loss vs Val Loss" />
        <BleuChart bleu={data.bleu} title="BLEU Score over Epochs" />
      </div>

      <section style={{ marginTop: "2rem" }}>
        <TranslateDemo
          phase={1}
          fromLang="English"
          toLang="Hindi"
          endpoint="http://localhost:5001/translate/hindi"
          sampleSentences={SAMPLES}
          heading="Test the trained model"
          subheading="Phase 1 model trained for 300 epochs on English-Hindi corpus"
        />
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h3 style={{ marginTop: 0 }}>Checkpoints</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {checkpoints.length === 0 && (
            <span style={{ color: "#9ca3af" }}>No phase1_checkpoint_epoch*.pt found</span>
          )}
          {checkpoints.map((c) => (
            <span
              key={c}
              style={{
                fontSize: 12,
                padding: "4px 10px",
                borderRadius: 999,
                background: "#f3f4f6",
                color: "#374151",
                border: "1px solid #e5e7eb",
              }}
            >
              {c}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
