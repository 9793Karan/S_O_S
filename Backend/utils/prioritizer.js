// utils/prioritizer.js
const WEIGHTS = { S: 0.35, T: 0.25, V: 0.15, C: 0.15, E: 0.10 };

const maps = {
  severity:   { high: 1, medium: 0.5, low: 0.1 },
  immediacy:  { critical: 1, moderate: 0.5, low: 0.1 },
  vulnerability: { child: 1, elderly: 1, disabled: 1, adult: 0.5, minor: 0.1 },
  credibility: { high: 1, medium: 0.5, low: 0.1, verified: 1 },
  escalation: { repeated: 1, first: 0.5, addressed: 0.1 }
};

function normalizeFactor(input, map) {
  const key = String(input || '').toLowerCase();
  return map[key] ?? 0; // default to 0 if unknown
}

export function computePriority({ severity, immediacy, vulnerability, credibility, escalation }) {
  const S = normalizeFactor(severity, maps.severity);
  const T = normalizeFactor(immediacy, maps.immediacy);
  const V = normalizeFactor(vulnerability, maps.vulnerability);
  const C = normalizeFactor(credibility, maps.credibility);
  const E = normalizeFactor(escalation, maps.escalation);

  const P = +(WEIGHTS.S*S + WEIGHTS.T*T + WEIGHTS.V*V + WEIGHTS.C*C + WEIGHTS.E*E).toFixed(3);

  const { tag, color } = mapScoreToTag(P);
  return { score: P, tag, color, factors: { S, T, V, C, E } };
}

export function mapScoreToTag(P) {
  if (P >= 0.8) return { tag: 'Critical', color: '#FF3B30' };      // Red
  if (P >= 0.6) return { tag: 'High',     color: '#FF9500' };      // Orange
  if (P >= 0.4) return { tag: 'Medium',   color: '#FFCC00' };      // Yellow
  if (P >= 0.2) return { tag: 'Low',      color: '#34C759' };      // Green
  return            { tag: 'Minimal',  color: '#0A84FF' };         // Blue
}
