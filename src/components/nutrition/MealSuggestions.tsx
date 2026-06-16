import { useMemo } from "react";
import type { FoodItem, LogEntry } from "../../lib/nutrition";
import { suggestToFill } from "../../lib/meals";

interface Props {
  remainingKcal: number;
  foods: FoodItem[];
  dateKey: string;
  onLog: (entry: Omit<LogEntry, "id">) => void;
}

export default function MealSuggestions({
  remainingKcal,
  foods,
  dateKey,
  onLog,
}: Props) {
  const suggestions = useMemo(
    () => suggestToFill(remainingKcal, foods),
    [remainingKcal, foods],
  );

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <h2 className="mb-1 text-sm font-semibold text-slate-200">Close the gap</h2>
      <p className="mb-4 text-xs text-slate-500">
        Calorie-dense ideas to hit your surplus for the rest of today.
      </p>

      {remainingKcal <= 50 ? (
        <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          You're at your calorie target for today. Nice work - this is how you grow.
        </p>
      ) : suggestions.length === 0 ? (
        <p className="text-sm text-slate-500">
          Add some foods to your library to get tailored suggestions.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {suggestions.map((s) => (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm text-slate-100">{s.label}</div>
                <div className="text-xs text-slate-500">
                  +{Math.round(s.calories)} kcal - {Math.round(s.protein)}g protein
                </div>
              </div>
              <button
                onClick={() =>
                  onLog({
                    dateKey,
                    name: s.label,
                    calories: s.calories,
                    protein: s.protein,
                    servings: s.items.reduce((n, i) => n + i.servings, 0),
                    foodId: s.items[0]?.food.id,
                  })
                }
                className="shrink-0 rounded-lg bg-ink-700 px-3 py-1.5 text-xs font-medium text-slate-100 transition hover:bg-accent hover:text-ink-950"
              >
                Log it
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
