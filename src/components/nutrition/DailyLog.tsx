import { dailyTotals, type LogEntry } from "../../lib/nutrition";

interface Props {
  entries: LogEntry[];
  onRemove: (id: string) => void;
}

export default function DailyLog({ entries, onRemove }: Props) {
  const totals = dailyTotals(entries);

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Today's log</h2>
        <span className="font-mono text-xs text-slate-400">
          {Math.round(totals.calories)} kcal - {Math.round(totals.protein)}g protein
        </span>
      </div>

      {entries.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Nothing logged yet. Tap a food above or add one manually.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {entries.map((e) => (
            <li
              key={e.id}
              className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-slate-100">
                  {e.name}
                  {e.servings !== 1 && (
                    <span className="text-slate-500"> x{e.servings}</span>
                  )}
                </div>
                <div className="text-xs text-slate-500">
                  {Math.round(e.calories)} kcal - {Math.round(e.protein)}g protein
                </div>
              </div>
              <button
                onClick={() => onRemove(e.id)}
                aria-label={`Remove ${e.name}`}
                className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
