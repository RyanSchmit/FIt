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
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-brass">
        Today's Intake
      </h2>
      <p className="mb-4 text-xs text-steel">
        Log your food in MyFitnessPal, then enter the day's totals here.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
            Calories (kcal)
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 2800"
              className="rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none placeholder:text-steel focus:border-brass"
            />
          </label>
          <label className="flex flex-col gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
            Protein (g)
            <input
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              inputMode="numeric"
              placeholder="e.g. 160"
              className="rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none placeholder:text-steel focus:border-brass"
            />
          </label>
        </div>

        <div className="flex items-center justify-end gap-3">
          {entry && (
            <button
              type="button"
              onClick={onClear}
              className="rounded-sm px-3 py-2 text-sm text-steel-light transition hover:bg-red/10 hover:text-red"
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="rounded-sm bg-brass px-4 py-2 font-display text-sm uppercase tracking-[0.04em] text-ink-950 transition hover:bg-accent-strong"
          >
            {entry ? "Update today" : "Save today"}
          </button>
        </div>
      </form>
    </div>
  );
}
