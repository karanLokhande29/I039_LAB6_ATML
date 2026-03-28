import { Link } from "react-router-dom";
import data from "../data/frontend_data_phase3.json";
import { SinglePhaseLossChart } from "../components/LossChart.jsx";
import BleuChart from "../components/BleuChart.jsx";
import MetricCard from "../components/MetricCard.jsx";
import TranslateDemo from "../components/TranslateDemo.jsx";
import { fmtLoss, fmtBleu } from "../utils/format.js";

const SAMPLES = [
  "Good morning, where are you going?",
  "I want to learn Spanish.",
  "The train arrives at noon.",
  "He works at a hospital.",
  "We are studying together.",
];

export default function Phase3() {
  return (
    <div>
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
        <Link to="/">Dashboard</Link> &gt; Phase 3
      </div>
      <h2 style={{ marginTop: 0 }}>Phase 3 — English → Spanish Translation</h2>

      <div
        style={{
          background: "#fef9c3",
          border: "1px solid #facc15",
          color: "#854d0e",
          padding: "0.75rem 1rem",
          borderRadius: 8,
          marginBottom: "1rem",
        }}
      >
        Training stopped at epoch 150 — using <strong>phase3_checkpoint_epoch150.pt</strong>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
        <MetricCard label="Final Train Loss" value={fmtLoss(data.final_train_loss)} />
        <MetricCard label="Final Val Loss" value={fmtLoss(data.final_val_loss)} />
        <MetricCard label="Final BLEU" value={fmtBleu(data.final_bleu)} />
        <MetricCard label="Epochs" value="150" />
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
          phase={3}
          fromLang="English"
          toLang="Spanish"
          endpoint="http://localhost:5001/translate/spanish"
          sampleSentences={SAMPLES}
          heading="Test the trained model"
          subheading="Phase 3 model — Bahdanau Attention, trained 150 epochs on opus_books English-Spanish dataset"
        />
      </section>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem 1.25rem",
          borderRadius: 8,
          border: "1px solid #e5e7eb",
          background: "#f9fafb",
          color: "#374151",
          lineHeight: 1.5,
        }}
      >
        <strong>Architecture note:</strong> This model uses Bahdanau (additive) attention mechanism — the decoder attends
        to different encoder hidden states at each decoding step.
      </div>
    </div>
  );
}
