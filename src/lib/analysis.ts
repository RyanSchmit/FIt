import { DAY_MS, daysBetween } from "./metrics";
import type {
  ExerciseSession,
  FactorDef,
  FactorKey,
  FactorResult,
  ImprovementMetric,
  Observation,
} from "./types";

export const FACTORS: FactorDef[] = [
  {
    key: "frequency",
    label: "Frequency",
    unit: "sessions/wk",
    description: "How often you trained this lift in the lead-up window.",
  },
  {
    key: "volume",
    label: "Volume",
    unit: "lb lifted",
    description: "Total weight x reps accumulated in the lead-up window.",
  },
  {
    key: "sets",
    label: "Working sets",
    unit: "sets",
    description: "Total number of sets performed in the lead-up window.",
  },
  {
    key: "intensity",
    label: "Intensity",
    unit: "% of e1RM",
    description: "How heavy your top sets were relative to your estimated max.",
  },
  {
    key: "recovery",
    label: "Recovery",
    unit: "days rest",
    description: "Days of rest since the previous session of this lift.",
  },
];

function metricValue(s: ExerciseSession, metric: ImprovementMetric): number {
  return metric === "e1rm" ? s.e1rm : s.topWeight || s.e1rm;
}

/**
 * Build one observation per session (after the first): trailing-window factors
 * paired with the improvement realized in that session vs the previous one.
 */
export function buildObservations(
  sessions: ExerciseSession[],
  windowDays: number,
  metric: ImprovementMetric,
): Observation[] {
  const observations: Observation[] = [];
  const weeks = windowDays / 7;

  for (let i = 1; i < sessions.length; i++) {
    const current = sessions[i];
    const prev = sessions[i - 1];
    const windowStart = current.date.getTime() - windowDays * DAY_MS;

    let volume = 0;
    let sets = 0;
    let count = 0;
    let intensitySum = 0;

    for (let j = i - 1; j >= 0; j--) {
      const t = sessions[j].date.getTime();
      if (t < windowStart) break;
      if (t >= current.date.getTime()) continue;
      const sess = sessions[j];
      volume += sess.volume;
      sets += sess.setCount;
      count += 1;
      const denom = sess.e1rm || 1;
      intensitySum += sess.bodyweight ? 100 : (sess.topWeight / denom) * 100;
    }

    const prevMetric = metricValue(prev, metric);
    const curMetric = metricValue(current, metric);
    const deltaE1rm = curMetric - prevMetric;
    const deltaPct = prevMetric > 0 ? (deltaE1rm / prevMetric) * 100 : 0;

    observations.push({
      date: current.date,
      factors: {
        frequency: count / weeks,
        volume,
        sets,
        intensity: count > 0 ? intensitySum / count : 0,
        recovery: daysBetween(prev.date, current.date),
      },
      deltaE1rm,
      deltaPct,
    });
  }

  return observations;
}

export function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n < 2) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let dx2 = 0;
  let dy2 = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    num += dx * dy;
    dx2 += dx * dx;
    dy2 += dy * dy;
  }
  const denom = Math.sqrt(dx2 * dy2);
  return denom === 0 ? 0 : num / denom;
}

export function linregress(
  xs: number[],
  ys: number[],
): { slope: number; intercept: number } {
  const n = xs.length;
  if (n < 2) return { slope: 0, intercept: 0 };
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    num += dx * (ys[i] - my);
    den += dx * dx;
  }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

/** Correlate each factor against next-session improvement. */
export function analyzeFactors(observations: Observation[]): FactorResult[] {
  return FACTORS.map((def) => {
    const points = observations.map((o) => ({
      x: o.factors[def.key],
      y: o.deltaE1rm,
      date: o.date,
    }));
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    const r = pearson(xs, ys);
    const { slope, intercept } = linregress(xs, ys);
    return { def, r, n: points.length, slope, intercept, points };
  }).sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}

export interface Insight {
  factorKey: FactorKey;
  headline: string;
  detail: string;
  r: number;
  strength: "negligible" | "weak" | "moderate" | "strong";
  direction: "positive" | "negative";
}

function strengthOf(r: number): Insight["strength"] {
  const a = Math.abs(r);
  if (a < 0.1) return "negligible";
  if (a < 0.3) return "weak";
  if (a < 0.5) return "moderate";
  return "strong";
}

export function buildInsights(results: FactorResult[]): Insight[] {
  return results.map((res) => {
    const direction: Insight["direction"] = res.r >= 0 ? "positive" : "negative";
    const strength = strengthOf(res.r);
    const more = direction === "positive" ? "more" : "less";
    const label = res.def.label.toLowerCase();

    let headline: string;
    if (strength === "negligible") {
      headline = `${res.def.label} shows no clear link to your gains`;
    } else {
      headline = `${more === "more" ? "More" : "Less"} ${label} tends to precede bigger gains`;
    }

    const detail =
      strength === "negligible"
        ? `Across ${res.n} sessions, ${label} had little measurable relationship (r = ${res.r.toFixed(2)}) with how much your lift improved next.`
        : `A ${strength} ${direction} relationship (r = ${res.r.toFixed(2)}) across ${res.n} sessions: sessions following ${more} ${label} in the prior window tended to improve more.`;

    return { factorKey: res.def.key, headline, detail, r: res.r, strength, direction };
  });
}

export interface SummaryStats {
  totalSessions: number;
  totalSets: number;
  currentMetric: number;
  bestMetric: number;
  bestDate: Date | null;
  firstDate: Date | null;
  lastDate: Date | null;
  metric: ImprovementMetric;
}

export function summarize(
  sessions: ExerciseSession[],
  metric: ImprovementMetric,
): SummaryStats {
  let best = 0;
  let bestDate: Date | null = null;
  let totalSets = 0;
  for (const s of sessions) {
    const v = metricValue(s, metric);
    if (v > best) {
      best = v;
      bestDate = s.date;
    }
    totalSets += s.setCount;
  }
  const last = sessions[sessions.length - 1] ?? null;
  return {
    totalSessions: sessions.length,
    totalSets,
    currentMetric: last ? metricValue(last, metric) : 0,
    bestMetric: best,
    bestDate,
    firstDate: sessions[0]?.date ?? null,
    lastDate: last?.date ?? null,
    metric,
  };
}
