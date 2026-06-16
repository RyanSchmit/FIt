import { DAY_MS } from "./metrics";
import { WEIGHT_DATA } from "./weightData";

/** A reusable food or meal saved to the user's library for one-tap logging. */
export interface FoodItem {
  id: string;
  name: string;
  /** Calories per serving. */
  calories: number;
  /** Protein (g) per serving. */
  protein: number;
  carbs?: number;
  fat?: number;
  /** Human label for one serving, e.g. "2 tbsp", "1 cup". */
  servingLabel?: string;
}

/** A single logged item on a given day. Calories/protein are already totalled. */
export interface LogEntry {
  id: string;
  /** Local calendar day key, "YYYY-MM-DD". */
  dateKey: string;
  name: string;
  /** Total calories for this entry (per-serving x servings). */
  calories: number;
  /** Total protein (g) for this entry. */
  protein: number;
  servings: number;
  /** Library item this entry came from, if any. */
  foodId?: string;
}

export interface NutritionSettings {
  calorieTarget: number;
  proteinTarget: number;
}

export interface DailyTotals {
  calories: number;
  protein: number;
}

/** Local-time calendar key so "today" matches the user's clock, not UTC. */
export function localDateKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function dailyTotals(entries: LogEntry[]): DailyTotals {
  return entries.reduce<DailyTotals>(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein: acc.protein + e.protein,
    }),
    { calories: 0, protein: 0 },
  );
}

export function entriesForDate(log: LogEntry[], dateKey: string): LogEntry[] {
  return log.filter((e) => e.dateKey === dateKey);
}

export interface SuggestedTargets {
  bodyWeight: number;
  maintenance: number;
  calorieTarget: number;
  proteinTarget: number;
}

/**
 * Derive a starting bulking target from the most recent body-weight reading.
 * Maintenance uses a simple bodyweight x 15 activity estimate; the bulk target
 * adds a ~400 kcal surplus (roughly +0.4 lb/week). Protein targets ~1 g/lb.
 * These are editable defaults, not prescriptions.
 */
export function suggestedTargets(): SuggestedTargets {
  const latest = WEIGHT_DATA[WEIGHT_DATA.length - 1];
  const bodyWeight = latest ? latest.bodyWeight : 160;
  const maintenance = Math.round((bodyWeight * 15) / 50) * 50;
  const calorieTarget = maintenance + 400;
  const proteinTarget = Math.round(bodyWeight);
  return { bodyWeight, maintenance, calorieTarget, proteinTarget };
}

export function defaultSettings(): NutritionSettings {
  const t = suggestedTargets();
  return { calorieTarget: t.calorieTarget, proteinTarget: t.proteinTarget };
}

/** Monday 00:00 (local) for the week containing timestamp t. */
export function startOfWeek(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  const dow = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - dow);
  return d.getTime();
}

/** Linearly interpolate body weight at an arbitrary timestamp. */
export function interpolateWeight(t: number): number | null {
  const pts = WEIGHT_DATA;
  if (pts.length === 0) return null;
  if (t <= pts[0].t) return pts[0].bodyWeight;
  if (t >= pts[pts.length - 1].t) return pts[pts.length - 1].bodyWeight;
  for (let i = 1; i < pts.length; i++) {
    if (t <= pts[i].t) {
      const a = pts[i - 1];
      const b = pts[i];
      const frac = (t - a.t) / (b.t - a.t || 1);
      return a.bodyWeight + frac * (b.bodyWeight - a.bodyWeight);
    }
  }
  return pts[pts.length - 1].bodyWeight;
}

export interface WeekIntake {
  weekStart: number;
  avgCalories: number;
  avgProtein: number;
  days: number;
}

/** Bucket log entries into weeks and average the per-day totals. */
export function weeklyAverageIntake(log: LogEntry[]): WeekIntake[] {
  if (log.length === 0) return [];

  // Sum per calendar day first, then average across the days in each week.
  const perDay = new Map<string, DailyTotals>();
  for (const e of log) {
    const cur = perDay.get(e.dateKey) ?? { calories: 0, protein: 0 };
    cur.calories += e.calories;
    cur.protein += e.protein;
    perDay.set(e.dateKey, cur);
  }

  const perWeek = new Map<
    number,
    { calories: number; protein: number; days: number }
  >();
  for (const [dateKey, totals] of perDay) {
    const t = new Date(`${dateKey}T00:00:00`).getTime();
    const wk = startOfWeek(t);
    const cur = perWeek.get(wk) ?? { calories: 0, protein: 0, days: 0 };
    cur.calories += totals.calories;
    cur.protein += totals.protein;
    cur.days += 1;
    perWeek.set(wk, cur);
  }

  return [...perWeek.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([weekStart, v]) => ({
      weekStart,
      avgCalories: v.calories / v.days,
      avgProtein: v.protein / v.days,
      days: v.days,
    }));
}

/** Body-weight change (lb) across the 7 days starting at weekStart. */
export function weightChangeForWeek(weekStart: number): number | null {
  const start = interpolateWeight(weekStart);
  const end = interpolateWeight(weekStart + 7 * DAY_MS);
  if (start == null || end == null) return null;
  return end - start;
}
