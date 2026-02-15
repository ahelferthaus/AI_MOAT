// ═══════════════════════════════════════════════════════════════
// MOAT Analyzer — Core Computation Engine
// Shared between webapp (React) and iOS (Preact/htm)
// ═══════════════════════════════════════════════════════════════

// ─── COLOR PALETTE ───
const C = {
  bg: "#0a0f1a", bgCard: "#111827", bgAlt: "#1a2332",
  text: "#e2e8f0", dim: "#8899aa", border: "#1e2d3d",
  accent: "#4da3ff", primary: "#326295",
  green: "#43b02a", greenLt: "#b3d57d",
  yellow: "#ede04b", orange: "#f39c12", red: "#e74c3c",
  grayMid: "#97999b", purple: "#a855f7", cyan: "#06b6d4",
};

const TIER_COLORS = {
  CRITICAL: C.red,
  HIGH: C.orange,
  MEDIUM: C.yellow,
  "LOW-MEDIUM": C.greenLt,
  LOW: C.green,
};

// ─── SECTOR DATABASE ───
// Keys: sc=switching costs, ne=network effects, ia=intangible assets,
//       ca=cost advantage, es=efficient scale
//       ls=labor substitution, vcd=value chain disruption, dme=data/model edge,
//       anc=autonomous/new competition, cir=customer interaction risk
const SECTOR_DB = {
  "Information Technology":    { sc:4, ne:4, ia:4, ca:3, es:2, ls:3, vcd:2, dme:3, anc:4, cir:3 },
  "Communication Services":   { sc:3, ne:5, ia:4, ca:2, es:3, ls:3, vcd:3, dme:4, anc:3, cir:4 },
  "Health Care":              { sc:3, ne:1, ia:5, ca:2, es:3, ls:2, vcd:2, dme:2, anc:3, cir:2 },
  "Financials":               { sc:3, ne:2, ia:3, ca:3, es:3, ls:5, vcd:4, dme:3, anc:4, cir:4 },
  "Consumer Staples":         { sc:2, ne:1, ia:4, ca:4, es:2, ls:2, vcd:2, dme:1, anc:2, cir:1 },
  "Industrials":              { sc:3, ne:1, ia:3, ca:4, es:3, ls:3, vcd:2, dme:2, anc:2, cir:2 },
  "Consumer Discretionary":   { sc:2, ne:2, ia:3, ca:2, es:1, ls:3, vcd:4, dme:3, anc:3, cir:3 },
  "Energy":                   { sc:1, ne:1, ia:2, ca:4, es:4, ls:1, vcd:1, dme:1, anc:1, cir:1 },
  "Utilities":                { sc:2, ne:1, ia:3, ca:3, es:5, ls:1, vcd:1, dme:1, anc:1, cir:1 },
  "Real Estate":              { sc:2, ne:1, ia:2, ca:2, es:3, ls:3, vcd:4, dme:2, anc:3, cir:3 },
  "Materials":                { sc:1, ne:1, ia:2, ca:4, es:3, ls:2, vcd:1, dme:1, anc:1, cir:1 },
};

// ─── MOAT SCORING ───
// Moat Score: weighted average of 5 competitive advantage factors (1-5 scale)
function calcMoat(d) {
  return d.sc * 0.25 + d.ne * 0.20 + d.ia * 0.25 + d.ca * 0.15 + d.es * 0.15;
}

// AI Disruption Score: weighted average of 5 AI risk factors (1-5 scale)
function calcAI(d) {
  return d.ls * 0.25 + d.vcd * 0.25 + d.dme * 0.15 + d.anc * 0.20 + d.cir * 0.15;
}

// ─── VALUATION ADJUSTMENTS ───
// Base Competitive Advantage Period (years) from moat score
function CAP(m) {
  return m >= 4 ? 22 : m >= 3.5 ? 18 : m >= 3 ? 14 : m >= 2.5 ? 10 : m >= 2 ? 7 : 4;
}

// Adjusted CAP: reduced by AI risk and business model risk
function adjCAP(c, ai, bm = 0) {
  return Math.max(2, Math.round(c * (1 - Math.max(0, (ai - 1.5) * 0.15) - bm * 0.05)));
}

// AI Premium (basis points added to discount rate)
function aiPrem(ai, bm = 0) {
  return Math.min(400, (ai >= 4 ? 300 : ai >= 3.5 ? 225 : ai >= 3 ? 150 : ai >= 2.5 ? 100 : ai >= 2 ? 50 : 0) + bm * 15);
}

// Justified P/E via multi-stage DDM approximation
// r=required return, g=long-term growth, c=competitive advantage period
function justPE(r, g, c) {
  if (r <= g) return 30;
  return Math.max(5, Math.min(50,
    (1 / (r - g)) * (1 - Math.pow((1 + g) / (1 + r), c)) +
    Math.pow((1 + g) / (1 + r), c) * (1 / (r - 0.02))
  ));
}

// Net Moat Score → Risk Tier
function tier(n) {
  return n <= -2 ? "CRITICAL" : n <= -0.5 ? "HIGH" : n <= 0.5 ? "MEDIUM" : n <= 1.5 ? "LOW-MEDIUM" : "LOW";
}

// ─── FULL COMPUTATION ───
// Takes FMP financial data + moat scores + business model risk → full valuation output
function computeAll(fmp, moat, bmRisk) {
  const ms = calcMoat(moat);
  const ai = calcAI(moat);
  const bmr = bmRisk?.compositeRisk || 0;
  const net = ms - ai - bmr * 0.3;
  const t = tier(net);
  const bCap = CAP(ms);
  const aCap = adjCAP(bCap, ai, bmr);
  const bp = aiPrem(ai, bmr);
  const wacc = Math.max(0.06, 0.045 + (fmp.beta || 1) * 0.05);
  const ltg = Math.min(0.04, Math.max(0.015, (fmp.avgRevGrowth || 0.05) * 0.4));
  const bPE = justPE(wacc, ltg, bCap);
  const aPE = justPE(wacc + bp / 10000, ltg, aCap);
  const haircut = bPE > 0 ? Math.round((1 - aPE / bPE) * 100) : 0;

  return {
    moatScore: ms, aiScore: ai, netScore: net, tier: t,
    baseCap: bCap, adjCap: aCap, aiPremBps: bp,
    wacc, ltGrowth: ltg,
    basePE: bPE, adjPE: aPE, haircut,
    bmRisk: bmr,
  };
}

// ─── SECTOR COMPOSITE COMPUTATION ───
// Computes scores for all sectors, with optional PM overrides
function computeSComp(overrides = { sectors: {}, tickers: {} }) {
  const results = {};
  for (const [sector, base] of Object.entries(SECTOR_DB)) {
    const ov = overrides.sectors?.[sector] || {};
    const merged = { ...base, ...ov };
    const ms = calcMoat(merged);
    const ai = calcAI(merged);
    const net = ms - ai;
    results[sector] = {
      moatScore: ms, aiScore: ai, netScore: net,
      tier: tier(net), baseCap: CAP(ms),
      adjCap: adjCAP(CAP(ms), ai),
      aiPremBps: aiPrem(ai),
      ...merged,
    };
  }
  return results;
}

// ─── OVERRIDE PERSISTENCE ───
function loadOverrides() {
  try {
    return JSON.parse(localStorage.getItem("pm_overrides") || '{"sectors":{},"tickers":{}}');
  } catch (e) {
    return { sectors: {}, tickers: {} };
  }
}

function saveOverrides(o) {
  localStorage.setItem("pm_overrides", JSON.stringify(o));
}
