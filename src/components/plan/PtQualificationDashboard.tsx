import { useMemo } from "react";
import { useWeight } from "../../hooks/useWeight";
import { useRunLog } from "../../hooks/useRunLog";
import { estimatedOneRepMax } from "../../lib/metrics";
import {
  GOALS,
  daysLeft,
  fmtRunTime,
  progressFrac,
  statusFor,
} from "../../lib/ptPlan";
import type { WorkoutSet } from "../../lib/types";
import NutritionTargets from "./NutritionTargets";
import PhasePlan from "./PhasePlan";
import QualCard from "./QualCard";
import RunLog from "./RunLog";
import WeeklySplit from "./WeeklySplit";

interface Props {
  sets: WorkoutSet[];
}

// Map a qual lift to the Strong exercise-name prefixes that represent it.
const LIFT_MATCHERS: { id: "squat" | "bench"; prefixes: string[] }[] = [
  { id: "squat", prefixes: ["Squat (Barbell)"] },
  { id: "bench", prefixes: ["Bench Press (Barbell)"] },
];

function bestE1rm(sets: WorkoutSet[], prefixes: string[]): number | null {
  let best = 0;
  for (const s of sets) {
    if (!prefixes.some((p) => s.exercise.startsWith(p))) continue;
    best = Math.max(best, estimatedOneRepMax(s));
  }
  return best > 0 ? Math.round(best) : null;
}

function SectionLabel({
  children,
  aside,
}: {
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="mb-[18px] mt-14 flex justify-between border-b border-cream/12 pb-2.5 font-mono text-xs uppercase tracking-[0.14em] text-brass">
      <span>{children}</span>
      {aside && <span>{aside}</span>}
    </div>
  );
}

export default function PtQualificationDashboard({ sets }: Props) {
  const weight = useWeight();
  const runLog = useRunLog();

  const latestWeight = weight.entries.length
    ? weight.entries[weight.entries.length - 1].weightLb
    : GOALS.weight.start;

  const squat = useMemo(
    () => bestE1rm(sets, LIFT_MATCHERS[0].prefixes),
    [sets],
  );
  const bench = useMemo(
    () => bestE1rm(sets, LIFT_MATCHERS[1].prefixes),
    [sets],
  );

  const runVal = runLog.latest ?? GOALS.run.start;
  const squatVal = squat ?? GOALS.squat.start;
  const benchVal = bench ?? GOALS.bench.start;

  const wFrac = progressFrac("weight", latestWeight);
  const rFrac = progressFrac("run", runVal);
  const sqFrac = progressFrac("squat", squatVal);
  const bnFrac = progressFrac("bench", benchVal);
  const strFrac = (sqFrac + bnFrac) / 2;

  const days = daysLeft();

  return (
    <div className="-mx-4 -mt-8 sm:-mx-6">
      {/* Top strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-[6px] border-brass bg-cream px-5 py-3.5 text-ink-950">
        <div className="font-mono text-[11px] tracking-[0.08em] text-steel">
          FILE: R.SCHMIT // PT-PREP-2026 // ROCKVILLE CENTRE, NY
        </div>
        <div className="flex items-baseline gap-2 font-display text-[15px] uppercase tracking-[0.04em]">
          DAYS TO ACADEMY{" "}
          <span className="font-mono text-[28px] font-bold text-red">{days}</span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-20">
        {/* Hero */}
        <header className="border-b border-cream/12 py-12">
          <div className="mb-3.5 font-mono text-xs uppercase tracking-[0.18em] text-brass">
            Nassau County Police Academy — Physical Readiness File
          </div>
          <h1 className="mb-4 font-display text-[clamp(34px,6vw,58px)] font-bold uppercase leading-[1.05] tracking-[0.01em] text-cream">
            Qualify <span className="text-brass">by</span> November
          </h1>
          <p className="max-w-2xl text-base text-steel-light">
            Three standards, one clock. 157.6 &#8594; 180 lbs. 13:00 &#8594; 9:00
            on the 1.5-mile. 180 &#8594; 225 for reps on squat and bench. Track
            every entry against the line you actually need to hit.
          </p>
        </header>

        <SectionLabel>Current Standing</SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QualCard
            title="Bodyweight"
            current={latestWeight.toFixed(1)}
            target="180"
            unit="lbs · lean gain pace"
            frac={wFrac}
            status={statusFor(wFrac, weight.entries.length > 0)}
          />
          <QualCard
            title="1.5 Mile Run"
            current={fmtRunTime(runVal)}
            target="9:00"
            unit="min:sec"
            frac={rFrac}
            status={statusFor(rFrac, runLog.entries.length > 0)}
          />
          <QualCard
            title="Squat & Bench"
            current={`${squatVal}/${benchVal}`}
            target="225/225"
            unit="est. 1RM, lbs (squat/bench)"
            frac={strFrac}
            status={statusFor(strFrac, squat !== null || bench !== null)}
          />
        </div>

        <SectionLabel
          aside={`— based on current weight (${latestWeight.toFixed(1)} lbs)`}
        >
          Nutrition Targets
        </SectionLabel>
        <NutritionTargets weightLb={latestWeight} />

        <SectionLabel>Weekly Split — This Week</SectionLabel>
        <WeeklySplit />

        <SectionLabel>Phase Plan — 20 Weeks</SectionLabel>
        <PhasePlan />

        <SectionLabel>Log a 1.5-Mile Run</SectionLabel>
        <RunLog store={runLog} />

        <footer className="mt-14 border-t border-cream/10 pt-5 font-mono text-[11px] tracking-[0.04em] text-steel">
          BODYWEIGHT PULLS FROM THE WEIGHT TAB · SQUAT/BENCH FROM YOUR IMPORTED
          STRONG HISTORY · RUNS LOGGED LOCALLY · GOALS: 180 LBS / 9:00 1.5MI /
          225 SQUAT &amp; BENCH · TARGET: NOVEMBER 2026
        </footer>
      </div>
    </div>
  );
}
