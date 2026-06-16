import { useMemo, useState } from "react";
import Controls from "./Controls";
import FactorRanking from "./FactorRanking";
import InsightsPanel from "./InsightsPanel";
import ProgressionChart from "./ProgressionChart";
import ScatterCard from "./ScatterCard";
import StatsHeader from "./StatsHeader";
import {
  analyzeFactors,
  buildInsights,
  buildObservations,
  summarize,
} from "../lib/analysis";
import { buildSessions } from "../lib/metrics";
import { exercisesByFrequency } from "../lib/parse";
import type { ImprovementMetric, WorkoutSet } from "../lib/types";

const QUICK_PICKS = [
  "Squat (Barbell)",
  "Bench Press (Barbell)",
  "Shoulder Press (Machine)",
  "Romanian Deadlift (Barbell)",
  "Row (Barbell)",
  "Deadlift (Barbell)",
];
const MIN_SESSIONS = 4;

interface Props {
  sets: WorkoutSet[];
}

export default function StrengthDashboard({ sets }: Props) {
  const exercises = useMemo(() => exercisesByFrequency(sets), [sets]);

  const [exercise, setExercise] = useState<string>(() => {
    const byFreq = exercisesByFrequency(sets);
    const preferred = QUICK_PICKS.find((q) => byFreq.includes(q));
    return preferred ?? byFreq[0] ?? QUICK_PICKS[0];
  });
  const [windowDays, setWindowDays] = useState(14);
  const [metric, setMetric] = useState<ImprovementMetric>("e1rm");
  const [selectedFactor, setSelectedFactor] = useState<string>("frequency");

  const sessions = useMemo(
    () => (exercise ? buildSessions(sets, exercise) : []),
    [sets, exercise],
  );

  const observations = useMemo(
    () => buildObservations(sessions, windowDays, metric),
    [sessions, windowDays, metric],
  );

  const results = useMemo(() => analyzeFactors(observations), [observations]);
  const insights = useMemo(() => buildInsights(results), [results]);
  const stats = useMemo(() => summarize(sessions, metric), [sessions, metric]);

  const selectedResult =
    results.find((r) => r.def.key === selectedFactor) ?? results[0];

  const enoughData = sessions.length >= MIN_SESSIONS;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
        <Controls
          exercises={exercises}
          exercise={exercise}
          onExercise={setExercise}
          windowDays={windowDays}
          onWindow={setWindowDays}
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
        <>
          <ProgressionChart sessions={sessions} metric={metric} />

          <div className="grid gap-6 lg:grid-cols-2">
            <FactorRanking
              results={results}
              selectedKey={selectedResult?.def.key ?? ""}
              onSelect={setSelectedFactor}
            />
            {selectedResult && <ScatterCard result={selectedResult} />}
          </div>

          <InsightsPanel insights={insights} />
        </>
      )}

      <footer className="pb-4 pt-2 text-center text-xs text-slate-600">
        Analyzing {sessions.length} sessions of {exercise} over a {windowDays}-day lead-up
        window. Estimated 1RM uses the Epley formula.
      </footer>
    </div>
  );
}
