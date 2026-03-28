export default function MetricCard({ label, value }) {
  return (
    <div
      style={{
        minWidth: 160,
        flex: "1 1 160px",
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fff",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700 }}>{value}</div>
    </div>
  );
}
