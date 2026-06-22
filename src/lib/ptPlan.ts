// PT Qualification Card domain model.
// Ported from the standalone Nassau County Police Academy prep artifact.
// Goal: hit three physical standards before the academy intake date.

export const ACADEMY_START = new Date("2026-11-02T00:00:00");
export const START_DATE = new Date("2026-06-22T00:00:00");
export const TOTAL_DAYS = Math.round(
  (ACADEMY_START.getTime() - START_DATE.getTime()) / 86400000,
);

export type GoalDir = "up" | "down";

export interface Goal {
  start: number;
  target: number;
  unit: string;
  label: string;
  dir: GoalDir;
}

export type GoalKey = "weight" | "run" | "squat" | "bench";

export const GOALS: Record<GoalKey, Goal> = {
  weight: { start: 157.6, target: 180, unit: "lbs", label: "Bodyweight", dir: "up" },
  run: { start: 13.0, target: 9.0, unit: "min", label: "1.5 Mile Run", dir: "down" },
  squat: { start: 180, target: 225, unit: "lbs", label: "Squat (1RM est.)", dir: "up" },
  bench: { start: 180, target: 225, unit: "lbs", label: "Bench (1RM est.)", dir: "up" },
};

/** Whole days remaining until academy intake, clamped at zero. */
export function daysLeft(now: Date = new Date()): number {
  const diff = Math.round((ACADEMY_START.getTime() - now.getTime()) / 86400000);
  return Math.max(diff, 0);
}

/** Fraction (0-1) of the prep window that has elapsed. Drives "behind pace". */
export function pctElapsed(now: Date = new Date()): number {
  const elapsed = (now.getTime() - START_DATE.getTime()) / 86400000;
  return Math.min(Math.max(elapsed / TOTAL_DAYS, 0), 1);
}

/** Progress toward a goal as a 0-1 fraction, respecting goal direction. */
export function progressFrac(key: GoalKey, current: number): number {
  const g = GOALS[key];
  if (g.dir === "up") {
    return Math.min(Math.max((current - g.start) / (g.target - g.start), 0), 1);
  }
  return Math.min(Math.max((g.start - current) / (g.start - g.target), 0), 1);
}

export type StatusKind = "ontrack" | "behind" | "start";

export interface Status {
  cls: StatusKind;
  text: string;
}

/**
 * Compare actual progress against the linear pace required by the calendar.
 * `hasData` distinguishes "not started" from genuinely "behind".
 */
export function statusFor(
  frac: number,
  hasData: boolean,
  now: Date = new Date(),
): Status {
  const expected = pctElapsed(now);
  if (frac >= expected * 0.9) return { cls: "ontrack", text: "ON TRACK" };
  if (!hasData) return { cls: "start", text: "NOT STARTED" };
  return { cls: "behind", text: "BEHIND PACE" };
}

/** Render a decimal minutes value (e.g. 12.3) as mm:ss. */
export function fmtRunTime(decimalMin: number): string {
  const mins = Math.floor(decimalMin);
  const secs = Math.round((decimalMin - mins) * 100);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export interface NutritionTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Lean-gain macro targets scaled off current bodyweight. */
export function nutritionFor(weightLb: number): NutritionTargets {
  const calories = Math.round(weightLb * 17.5); // moderate surplus
  return {
    calories,
    protein: Math.round(weightLb * 0.9),
    carbs: Math.round((calories * 0.4) / 4),
    fat: Math.round((calories * 0.25) / 9),
  };
}

export interface SplitDay {
  d: string;
  name: string;
  detail: string;
}

export const SPLIT_RACE_WEEK: SplitDay[] = [
  {
    d: "MON",
    name: "Race — Summer Series",
    detail:
      "LI Summer Run Series at race effort. Distance varies by week (5K-5mi) — this IS the quality run session, run it hard.",
  },
  {
    d: "TUE",
    name: "Push (light-moderate)",
    detail:
      "Bench, OHP, incline DB press. Drop top set ~10% off plan — legs from the race bleed into upper body recovery less, but keep volume sane.",
  },
  {
    d: "WED",
    name: "Legs — Squat Focus",
    detail:
      "Push this back to Wednesday so quads get 48hrs off the race before loading. Squat top set + backoffs, RDLs, core.",
  },
  {
    d: "THU",
    name: "Back + Bi",
    detail:
      "Rows, pulldowns, deadlift variant, curls. Pull volume day, unaffected by race.",
  },
  {
    d: "FRI",
    name: "Run — Easy/Recovery + PT Circuit",
    detail:
      "Easy-paced run (not tempo this week) + push-up/sit-up max-rep practice. Let the legs recover for Saturday.",
  },
  {
    d: "SAT",
    name: "Legs — Light + Long Run",
    detail:
      "Lighter squat/accessory load + aerobic long run. Two leg-demanding sessions this week (race + this) so keep volume conservative.",
  },
  {
    d: "SUN",
    name: "Rest",
    detail: "Full recovery before next Monday's race. Mobility, sleep, food prep.",
  },
];

export const SPLIT_NORMAL: SplitDay[] = [
  {
    d: "01",
    name: "Push",
    detail:
      "Bench, OHP, incline DB press, triceps. Top set + backoffs, progressive load.",
  },
  {
    d: "02",
    name: "Run — Intervals",
    detail: "400-800m repeats at target race pace. Builds VO2 + run economy.",
  },
  {
    d: "03",
    name: "Legs — Squat Focus",
    detail: "Squat top set + backoffs, RDLs, leg press, core. Heaviest leg day.",
  },
  {
    d: "04",
    name: "Back + Bi",
    detail: "Rows, pulldowns, deadlift variant, curls. Pull volume day.",
  },
  {
    d: "05",
    name: "Run — Tempo + Push-ups/Sit-ups",
    detail:
      "Tempo run + full PT-test circuit: max push-ups, max sit-ups, technique work.",
  },
  {
    d: "06",
    name: "Legs — Long Run",
    detail:
      "Lighter squat/accessory work + long steady-state run (building aerobic base).",
  },
  {
    d: "07",
    name: "Rest",
    detail: "Full recovery. Mobility, sleep, food prep for the week ahead.",
  },
];

// Mondays with a confirmed/likely Summer Series race. 6/22 was cancelled per
// organizer; series resumes the following Monday and continues weekly.
export const RACE_WEEK_MONDAYS = [
  "2026-06-29",
  "2026-07-13",
  "2026-07-20",
  "2026-08-03",
  "2026-08-10",
];

/** Local "YYYY-MM-DD" key for the Monday of the week containing `now`. */
export function getThisMonday(now: Date = new Date()): string {
  const day = now.getDay(); // 0 = Sun
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}

export function isRaceWeek(now: Date = new Date()): boolean {
  return RACE_WEEK_MONDAYS.includes(getThisMonday(now));
}

export function currentSplit(now: Date = new Date()): SplitDay[] {
  return isRaceWeek(now) ? SPLIT_RACE_WEEK : SPLIT_NORMAL;
}

export interface Phase {
  weeks: string;
  name: string;
  detail: string;
}

export const PHASES: Phase[] = [
  {
    weeks: "WK 1–6",
    name: "Base Build",
    detail:
      "Establish surplus (~+300-400 kcal), linear strength progression on squat/bench (add 5lbs/week as reps allow). Monday Summer Series races sub in for interval day when scheduled — otherwise 2x interval + 1x long run per week. Run pace target: 12:00.",
  },
  {
    weeks: "WK 7–12",
    name: "Strength Push",
    detail:
      "Continue progressive overload toward 1RM ~240-250 on squat/bench via 4-6 rep top sets. Use remaining Summer Series races as free speed/fitness checks against the 9:00 goal. Run pace target: 10:30.",
  },
  {
    weeks: "WK 13–17",
    name: "Rep Conversion",
    detail:
      "Shift squat/bench to backoff sets at 225 for reps (work up to 5x5 @ 225). Sharpen run pacing with race-pace intervals at sub-9:00 splits. Begin slight calorie trim if bodyweight gain is ahead of schedule to protect run times.",
  },
  {
    weeks: "WK 18–20",
    name: "Taper & Test",
    detail:
      "Reduce volume 30-40%, keep intensity high. Practice full PT test conditions (run, push-ups, sit-ups back-to-back) twice. Final 1RM/rep tests in week 19, full rest 48-72hrs before academy intake.",
  },
];
