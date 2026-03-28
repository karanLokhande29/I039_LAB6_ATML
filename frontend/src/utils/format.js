export function fmtLoss(v) {
  if (v == null || Number.isNaN(v)) return "—";
  const n = Number(v);
  if (n < 0.01) return n.toExponential(2);
  return n.toFixed(4);
}

export function fmtBleu(v) {
  if (v == null || Number.isNaN(v)) return "—";
  return Number(v).toFixed(4);
}
