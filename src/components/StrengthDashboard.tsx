import { useMemo, useState } from "react";
import Controls from "./Controls";
import FileDrop from "./FileDrop";
import ProgressionChart from "./ProgressionChart";
import StatsHeader from "./StatsHeader";
import { summarize } from "../lib/analysis";
import { buildSessions } from "../lib/metrics";
import { exercisesByFrequency } from "../lib/parse";
import type { ImprovementMetric, WorkoutSet } from "../lib/types";

const QUICK_PICKS = [
  "Squat (Barbell)",
  "Bench Press (Barbell)",
  "Shoulder Press (Machine)",
  "Romanian Deadlift (Barbell)",
  "Bent Over Row (Barbell)",
  "Deadlift (Barbell)",
];
const MIN_SESSIONS = 4;

interface Props {
  sets: WorkoutSet[];
  onCsv: (csv: string, name: string) => void;
  sourceName: string;
}

export default function StrengthDashboard({ sets, onCsv, sourceName }: Props) {
  const exercises = useMemo(() => exercisesByFrequency(sets), [sets]);

  const [exercise, setExercise] = useState<string>(() => {
    const byFreq = exercisesByFrequency(sets);
    const preferred = QUICK_PICKS.find((q) => byFreq.includes(q));
    return preferred ?? byFreq[0] ?? QUICK_PICKS[0];
  });
  const [metric, setMetric] = useState<ImprovementMetric>("e1rm");

  const sessions = useMemo(
    () => (exercise ? buildSessions(sets, exercise) : []),
    [sets, exercise],
  );

  const stats = useMemo(() => summarize(sessions, metric), [sessions, metric]);

  const enoughData = sessions.length >= MIN_SESSIONS;

  return (
    <div className="flex flex-col gap-6">
      <FileDrop onCsv={onCsv} currentName={sourceName} />

      {sets.length === 0 ? (
        <div className="rounded-2xl border border-ink-700 bg-ink-900/70 px-4 py-12 text-center text-sm text-slate-500">
          Drop a Strong CSV export above to begin.
        </div>
      ) : (
        <>
          <section className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
            <Controls
              exercises={exercises}
              exercise={exercise}
              onExercise={setExercise}
              metric={metric}
              onMetric={setMetric}
              quickPicks={QUICK_PICKS.filter((q) => exercises.includes(q))}
            />
          </section>

          <StatsHeader stats={stats} />

          {!enoughData ? (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-6 text-sm text-amber-200">
              Only {sessions.length} session(s) recorded for {exercise}. Pick a lift with at
              least {MIN_SESSIONS} sessions for a meaningful factor analysis.
            </div>
          ) : (
            <ProgressionChart sessions={sessions} metric={metric} />
          )}
        </>
      )}
    </div>
  );
}
