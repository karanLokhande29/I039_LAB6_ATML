import { useState } from "react";

export default function TranslateDemo({
  phase,
  fromLang,
  toLang,
  endpoint,
  sampleSentences = [],
  compact = false,
  heading,
  subheading,
  showSamples,
}) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ms, setMs] = useState(null);
  const [error, setError] = useState("");

  const samplesVisible = showSamples ?? !compact;
  const outBg = phase === 3 ? "#eff6ff" : "#faf5ff";

  async function runTranslate() {
    setError("");
    setLoading(true);
    const t0 = performance.now();
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      const data = await res.json().catch(() => ({}));
      const t1 = performance.now();
      setMs(Math.round(t1 - t0));
      if (!res.ok) {
        setError("bad_response");
        setOutput("");
        return;
      }
      if (data.status === "error") {
        setOutput(data.translation || "Model not loaded");
      } else {
        setOutput(data.translation || "");
      }
    } catch {
      setError("network");
      setOutput("");
      setMs(null);
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setInput("");
    setOutput("");
    setMs(null);
    setError("");
  }

  const boxPad = compact ? "0.75rem" : "1rem";
  const rows = compact ? 3 : 4;

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
      {!compact && (
        <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid #eee", background: "#f9fafb" }}>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            Try the model — {fromLang} → {toLang}
          </div>
          {heading && <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{heading}</div>}
          {subheading && <div style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>{subheading}</div>}
        </div>
      )}
      {compact && subheading && (
        <div style={{ padding: "0.5rem 0.75rem", fontSize: 13, color: "#6b7280", fontWeight: 600 }}>{subheading}</div>
      )}
      {error === "network" && (
        <div style={{ background: "#fef2f2", color: "#991b1b", padding: "0.75rem 1rem", fontSize: 14 }}>
          Translation failed — is the backend running? Start it with: <code>python3 backend/app.py</code>
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: compact ? "1fr" : "1fr 1fr",
          gap: compact ? "0.75rem" : 16,
          padding: boxPad,
        }}
      >
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{fromLang} input</div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={rows}
            placeholder="Type English text here..."
            style={{
              width: "100%",
              minHeight: compact ? 80 : 120,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
          <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={runTranslate}
              disabled={loading}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "none",
                background: "#7c3aed",
                color: "#fff",
                cursor: loading ? "wait" : "pointer",
                fontWeight: 600,
              }}
            >
              {loading ? "Translating..." : "Translate →"}
            </button>
            <button
              type="button"
              onClick={clearAll}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid #d1d5db",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>{toLang} output</div>
          <div
            style={{
              minHeight: compact ? 80 : 120,
              padding: 10,
              borderRadius: 8,
              border: "1px solid #e9d5ff",
              background: outBg,
              whiteSpace: "pre-wrap",
              fontSize: compact ? 14 : 15,
            }}
          >
            {output}
          </div>
          <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280" }}>{ms != null ? `⏱ ${ms} ms` : ""}</div>
        </div>
      </div>
      {samplesVisible && sampleSentences.length > 0 && (
        <div style={{ padding: "0 1rem 1rem" }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Quick samples</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {sampleSentences.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setInput(s)}
                style={{
                  fontSize: 13,
                  padding: "6px 10px",
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
