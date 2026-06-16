import {
  PROGRAM_WEEKS,
  RUN_DAYS,
  dayById,
  runForWeek,
} from "../../lib/plan";

interface Props {
  currentWeek: number;
  selectedWeek: number;
}

function cell(week: number, dayId: (typeof RUN_DAYS)[number]): string {
  const run = runForWeek(week, dayId);
  if (!run || run.kind === "rest") return "rest";
  const dist = run.distanceMi ? `${run.distanceMi} mi` : "";
  return run.note ? `${dist} ${run.note}`.trim() : dist;
}

export default function RunningPlan({ currentWeek, selectedWeek }: Props) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <h2 className="mb-1 text-sm font-semibold text-slate-200">
        Running progression (8 weeks to a continuous 3 miles)
      </h2>
      <p className="mb-3 text-xs text-slate-500">
        Run easy ~80% of the time - conversational pace. One quality session per week.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="px-2 py-2 font-medium">Week</th>
              {RUN_DAYS.map((d) => (
                <th key={d} className="px-2 py-2 font-medium">
                  {dayById(d).dayLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1).map((w) => {
              const isSelected = w === selectedWeek;
              const isCurrent = w === currentWeek;
              return (
                <tr
                  key={w}
                  className={`border-t border-ink-800 ${
                    isSelected ? "bg-accent/10" : ""
                  }`}
                >
                  <td className="px-2 py-2 font-medium text-slate-300">
                    <span className="flex items-center gap-1.5">
                      {w}
                      {isCurrent && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                    </span>
                  </td>
                  {RUN_DAYS.map((d) => (
                    <td key={d} className="px-2 py-2 text-slate-400">
                      {cell(w, d)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
