// 8-week hybrid strength + running program.
// Encodes the prescriptions from TRAINING_PLAN.md plus the weekly progression math.

export const PROGRAM_WEEKS = 8;

export type WeekKind = "build" | "deload" | "test";

/** A main barbell lift with a heavy top set and back-off volume. */
export interface MainLift {
  id: string;
  name: string;
  /** Reps for the heavy top set. */
  topSetReps: number;
  /** Week-1 top-set load (lb), from TRAINING_PLAN.md. */
  baseWeight: number;
  /** Load added to the top set each build week. */
  increment: number;
  /** Back-off volume performed at ~85% of the top set. */
  backoff: { sets: number; reps: number };
}

export interface Accessory {
  name: string;
  scheme: string;
}

export type RunKind = "easy" | "long" | "intervals" | "rest";

export interface RunTarget {
  kind: RunKind;
  /** Target distance in miles (absent for pure rest). */
  distanceMi?: number;
  note?: string;
}

export type DayId = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface PlanDay {
  id: DayId;
  dayLabel: string;
  title: string;
  focus: string;
  lifts: MainLift[];
  accessories: Accessory[];
  /** Present when a run is scheduled; distance varies by week (see runForWeek). */
  hasRun: boolean;
}

/** Weekly Mon-Sun schedule. Run distances are resolved per-week via runForWeek. */
export const SCHEDULE: PlanDay[] = [
  {
    id: "mon",
    dayLabel: "Mon",
    title: "Lower - Squat priority",
    focus: "Heavy legs",
    lifts: [
      {
        id: "squat",
        name: "Squat",
        topSetReps: 4,
        baseWeight: 190,
        increment: 5,
        backoff: { sets: 4, reps: 5 },
      },
    ],
    accessories: [
      { name: "Romanian Deadlift", scheme: "3x8 @ 185" },
      { name: "Leg press or Bulgarian split squat", scheme: "3x10" },
      { name: "Hanging leg raise", scheme: "3 sets" },
    ],
    hasRun: false,
  },
  {
    id: "tue",
    dayLabel: "Tue",
    title: "Upper - Bench priority",
    focus: "Push + easy run",
    lifts: [
      {
        id: "bench",
        name: "Bench",
        topSetReps: 4,
        baseWeight: 185,
        increment: 5,
        backoff: { sets: 4, reps: 6 },
      },
    ],
    accessories: [
      { name: "Barbell Row", scheme: "4x6 @ 145" },
      { name: "Overhead Press", scheme: "3x6 @ 100" },
      { name: "Triceps pushdown + face pulls", scheme: "3 sets each" },
    ],
    hasRun: true,
  },
  {
    id: "wed",
    dayLabel: "Wed",
    title: "Rest",
    focus: "Recovery",
    lifts: [],
    accessories: [{ name: "Optional easy recovery jog/walk", scheme: "easy" }],
    hasRun: false,
  },
  {
    id: "thu",
    dayLabel: "Thu",
    title: "Lower - Deadlift priority",
    focus: "Heavy pull",
    lifts: [
      {
        id: "deadlift",
        name: "Deadlift / Trap Bar",
        topSetReps: 5,
        baseWeight: 225,
        increment: 5,
        backoff: { sets: 2, reps: 5 },
      },
    ],
    accessories: [
      { name: "Front squat or paused squat", scheme: "3x5 @ 135" },
      { name: "Leg curl + calves", scheme: "3 sets each" },
    ],
    hasRun: false,
  },
  {
    id: "fri",
    dayLabel: "Fri",
    title: "Upper - OHP priority + bench volume",
    focus: "Press + easy run",
    lifts: [
      {
        id: "ohp",
        name: "Overhead Press",
        topSetReps: 5,
        baseWeight: 105,
        increment: 5,
        backoff: { sets: 3, reps: 6 },
      },
      {
        id: "bench-volume",
        name: "Bench (volume)",
        topSetReps: 6,
        baseWeight: 150,
        increment: 0,
        backoff: { sets: 4, reps: 6 },
      },
    ],
    accessories: [
      { name: "Pull-ups / lat pulldown", scheme: "4x8" },
      { name: "Curls + lateral raises", scheme: "3 sets each" },
    ],
    hasRun: true,
  },
  {
    id: "sat",
    dayLabel: "Sat",
    title: "Optional arms + long/quality run",
    focus: "Conditioning",
    lifts: [],
    accessories: [{ name: "Optional arms / weak points", scheme: "if recovered" }],
    hasRun: true,
  },
  {
    id: "sun",
    dayLabel: "Sun",
    title: "Rest",
    focus: "Recovery",
    lifts: [],
    accessories: [],
    hasRun: false,
  },
];

export function dayById(id: DayId): PlanDay {
  return SCHEDULE.find((d) => d.id === id)!;
}

/** Weeks 1-3 / 5-7 build, week 4 deload, week 8 test/peak. */
export function weekKind(week: number): WeekKind {
  if (week === 4) return "deload";
  if (week === PROGRAM_WEEKS) return "test";
  return "build";
}

function round5(n: number): number {
  return Math.round(n / 5) * 5;
}

export interface Prescription {
  reps: number;
  weight: number;
  backoffSets: number;
  backoffReps: number;
  backoffWeight: number;
}

/**
 * Resolve a lift's prescription for a given week.
 * Build weeks add `increment` per week; deload uses ~85% with one fewer back-off
 * set; the test week holds the progressed load but trims back-off volume.
 */
export function prescribedLift(lift: MainLift, week: number): Prescription {
  const kind = weekKind(week);
  const progressed = lift.baseWeight + (week - 1) * lift.increment;
  let weight = progressed;
  let backoffSets = lift.backoff.sets;

  if (kind === "deload") {
    weight = round5(progressed * 0.85);
    backoffSets = Math.max(1, lift.backoff.sets - 1);
  } else if (kind === "test") {
    backoffSets = Math.max(1, lift.backoff.sets - 1);
  }

  return {
    reps: lift.topSetReps,
    weight: round5(weight),
    backoffSets,
    backoffReps: lift.backoff.reps,
    backoffWeight: round5(weight * 0.85),
  };
}

/** Per-week running targets keyed by day. Mirrors the table in TRAINING_PLAN.md. */
const RUN_TABLE: Record<number, Partial<Record<DayId, RunTarget>>> = {
  1: {
    tue: { kind: "easy", distanceMi: 1.5, note: "run/walk" },
    fri: { kind: "easy", distanceMi: 1.5, note: "run/walk" },
    sat: { kind: "easy", distanceMi: 1.5 },
  },
  2: {
    tue: { kind: "easy", distanceMi: 1.5 },
    fri: { kind: "easy", distanceMi: 1.5 },
    sat: { kind: "long", distanceMi: 2.0 },
  },
  3: {
    tue: { kind: "easy", distanceMi: 2.0 },
    fri: { kind: "easy", distanceMi: 1.5 },
    sat: { kind: "long", distanceMi: 2.0 },
  },
  4: {
    tue: { kind: "easy", distanceMi: 1.5 },
    fri: { kind: "rest", note: "deload - rest" },
    sat: { kind: "long", distanceMi: 2.0 },
  },
  5: {
    tue: { kind: "easy", distanceMi: 2.0 },
    fri: { kind: "easy", distanceMi: 2.0 },
    sat: { kind: "long", distanceMi: 2.5 },
  },
  6: {
    tue: { kind: "easy", distanceMi: 2.0 },
    fri: { kind: "intervals", distanceMi: 1.5, note: "+ 4x400m fast" },
    sat: { kind: "long", distanceMi: 2.5 },
  },
  7: {
    tue: { kind: "easy", distanceMi: 2.5 },
    fri: { kind: "easy", distanceMi: 2.0 },
    sat: { kind: "long", distanceMi: 3.0 },
  },
  8: {
    tue: { kind: "easy", distanceMi: 2.0 },
    fri: { kind: "intervals", distanceMi: 1.5, note: "+ 4x400m fast" },
    sat: { kind: "long", distanceMi: 3.0, note: "for time" },
  },
};

export function runForWeek(week: number, dayId: DayId): RunTarget | null {
  const w = RUN_TABLE[week];
  if (!w) return null;
  return w[dayId] ?? null;
}

/** Ordered run days for the weekly running table. */
export const RUN_DAYS: DayId[] = ["tue", "fri", "sat"];

export interface Goalpost {
  label: string;
  detail: string;
}

export const GOALPOSTS: Goalpost[] = [
  { label: "Squat top set", detail: "190 -> 210+ (re-break the 205 all-time)" },
  { label: "Bench top set", detail: "185 -> 210 (beat the 2-year 205 ceiling)" },
  { label: "Deadlift", detail: "rebuild 225 -> 275+ (no ego-lifting early)" },
  { label: "Run", detail: "continuous 3 miles by week 7, sub-30:00 by week 8" },
];
