import { useMemo, useState } from "react";
import { usePlan } from "../../hooks/usePlan";
import { estimatedOneRepMax } from "../../lib/metrics";
import { SCHEDULE } from "../../lib/plan";
import type { WorkoutSet } from "../../lib/types";
import PlanProgressChart from "./PlanProgressChart";
import ProgramHeader from "./ProgramHeader";
import RunningPlan from "./RunningPlan";
import SessionCard from "./SessionCard";

interface Props {
  sets: WorkoutSet[];
}

// Map a tracked lift to the Strong exercise-name prefixes that represent it.
const LIFT_MATCHERS: { id: string; name: string; prefixes: string[] }[] = [
  { id: "squat", name: "Squat", prefixes: ["Squat (Barbell)"] },
  { id: "bench", name: "Bench", prefixes: ["Bench Press (Barbell)"] },
  {
    id: "deadlift",
    name: "Deadlift",
    prefixes: ["Deadlift (Barbell)", "Trap Bar Deadlift"],
  },
  {
    id: "ohp",
    name: "OHP",
    prefixes: ["Overhead Press (Barbell)", "Seated Overhead Press (Dumbbell)"],
  },
];

export default function PlanDashboard({ sets }: Props) {
  const store = usePlan();
  const [selectedWeek, setSelectedWeek] = useState(store.currentWeek);

  // Recent best e1RM per tracked lift from imported history, as a baseline.
  const recentBests = useMemo(() => {
    const out: { name: string; e1rm: number }[] = [];
    for (const m of LIFT_MATCHERS) {
      let best = 0;
      for (const s of sets) {
        if (!m.prefixes.some((p) => s.exercise.startsWith(p))) continue;
        best = Math.max(best, estimatedOneRepMax(s));
      }
      if (best > 0) out.push({ name: m.name, e1rm: Math.round(best) });
    }
    return out;
  }, [sets]);

  return (
    <div className="flex flex-col gap-6">
      <ProgramHeader
        week={selectedWeek}
        currentWeek={store.currentWeek}
        startDate={store.startDate}
        onSelectWeek={setSelectedWeek}
        onStartDateChange={store.setStartDate}
      />

      {recentBests.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-slate-500">Your all-time bests (e1RM):</span>
          {recentBests.map((b) => (
            <span
              key={b.name}
              className="rounded-full bg-ink-800 px-3 py-1 text-xs text-slate-300"
            >
              {b.name} <span className="font-semibold text-accent">{b.e1rm}</span>
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SCHEDULE.map((day) => (
          <SessionCard
            key={day.id}
            day={day}
            week={selectedWeek}
            existing={store.sessionFor(selectedWeek, day.id)}
            onSave={store.upsertSession}
            onClear={store.removeSession}
          />
        ))}
      </div>

      <RunningPlan currentWeek={store.currentWeek} selectedWeek={selectedWeek} />

      <PlanProgressChart logs={store.logs} />

      <footer className="pb-4 pt-2 text-center text-xs text-slate-600">
        Your logged sessions are saved locally in this browser. Nothing leaves your machine.
      </footer>
    </div>
  );
}
