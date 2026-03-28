export default function PhaseCard({ title, badge, badgeColor, epochs, bleu, extra }) {
  return (
    <div
      style={{
        flex: "1 1 200px",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "1rem",
        background: "#fafafa",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
        <strong>{title}</strong>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 999,
            background: badgeColor === "gray" ? "#e5e7eb" : "#d1fae5",
            color: badgeColor === "gray" ? "#374151" : "#065f46",
          }}
        >
          {badge}
        </span>
      </div>
      {epochs != null && <div style={{ fontSize: 14, color: "#4b5563" }}>Epochs: {epochs}</div>}
      {bleu != null && <div style={{ fontSize: 14, color: "#4b5563" }}>BLEU: {bleu}</div>}
      {extra && <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6 }}>{extra}</div>}
    </div>
  );
}
