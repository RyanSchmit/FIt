import type { ImprovementMetric } from "../lib/types";

interface Props {
  exercises: string[];
  exercise: string;
  onExercise: (name: string) => void;
  metric: ImprovementMetric;
  onMetric: (m: ImprovementMetric) => void;
  quickPicks: string[];
}

export default function Controls({
  exercises,
  exercise,
  onExercise,
  metric,
  onMetric,
  quickPicks,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {quickPicks.map((q) => (
          <button
            key={q}
            onClick={() => onExercise(q)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
              exercise === q
                ? "bg-accent text-ink-950"
                : "bg-ink-800 text-slate-300 hover:bg-ink-700"
            }`}
          >
            {q}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-slate-400">
          Exercise
          <select
            value={exercise}
            onChange={(e) => onExercise(e.target.value)}
            className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
          >
            {exercises.map((ex) => (
              <option key={ex} value={ex}>
                {ex}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-slate-400">
          Improvement metric
          <div className="flex overflow-hidden rounded-lg border border-ink-700">
            {(
              [
                ["e1rm", "Est. 1RM"],
                ["topWeight", "Top weight"],
              ] as [ImprovementMetric, string][]
            ).map(([key, label]) => (
              <button
                key={key}
                onClick={() => onMetric(key)}
                className={`flex-1 px-2 py-2 text-sm transition ${
                  metric === key
                    ? "bg-accent text-ink-950"
                    : "bg-ink-850 text-slate-300 hover:bg-ink-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </label>
      </div>
    </div>
  );
}
