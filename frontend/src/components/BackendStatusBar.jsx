import { useEffect, useState } from "react";

const HEALTH = "http://localhost:5001/health";

export default function BackendStatusBar() {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function ping() {
      try {
        const r = await fetch(HEALTH);
        const j = await r.json();
        if (!cancelled) setOk(r.ok && j.status === "ok");
      } catch {
        if (!cancelled) setOk(false);
      }
    }
    ping();
    const id = setInterval(ping, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (ok === null) {
    return (
      <div style={{ padding: "10px 0", fontSize: 14, color: "#6b7280" }}>
        Checking backend…
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        background: "#fafafa",
        marginTop: "2rem",
        fontSize: 14,
      }}
    >
      <span
        style={{
          width: 10,
          height: 10,
          borderRadius: "50%",
          background: ok ? "#22c55e" : "#ef4444",
          display: "inline-block",
        }}
      />
      {ok ? (
        <span>Backend connected</span>
      ) : (
        <span>
          Backend offline — run: <code>python3 backend/app.py</code>
        </span>
      )}
    </div>
  );
}
