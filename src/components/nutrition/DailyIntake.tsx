import { useEffect, useState } from "react";
import type { LogEntry } from "../../lib/nutrition";

interface Props {
  entry: LogEntry | undefined;
  onSave: (calories: number, protein: number) => void;
  onClear: () => void;
}

export default function DailyIntake({ entry, onSave, onClear }: Props) {
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");

  // Keep the inputs in sync with whatever is saved for the selected day.
  useEffect(() => {
    setCalories(entry ? String(Math.round(entry.calories)) : "");
    setProtein(entry ? String(Math.round(entry.protein)) : "");
  }, [entry]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cal = Number(calories);
    const prot = Number(protein) || 0;
    if (!Number.isFinite(cal) || cal <= 0) return;
    onSave(cal, prot);
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <h2 className="mb-1 text-sm font-semibold text-slate-200">
        Today's intake
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        Log your food in MyFitnessPal, then enter the day's totals here.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-xs text-slate-400">
            Calories (kcal)
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 2800"
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-slate-400">
            Protein (g)
            <input
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 160"
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          {entry && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-accent-strong"
          >
            {entry ? "Update today" : "Save today"}
          </button>
        </div>
      </form>
    </div>
  );
}
