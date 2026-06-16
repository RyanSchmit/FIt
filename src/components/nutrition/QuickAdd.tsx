import { useState } from "react";
import type { FoodItem, LogEntry } from "../../lib/nutrition";

interface Props {
  foods: FoodItem[];
  dateKey: string;
  onLog: (entry: Omit<LogEntry, "id">) => void;
  onSaveFood: (food: Omit<FoodItem, "id">) => void;
}

export default function QuickAdd({ foods, dateKey, onLog, onSaveFood }: Props) {
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [servings, setServings] = useState("1");
  const [save, setSave] = useState(false);

  function logFood(food: FoodItem) {
    onLog({
      dateKey,
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      servings: 1,
      foodId: food.id,
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cal = Number(calories);
    const prot = Number(protein) || 0;
    const serv = Number(servings) || 1;
    if (!name.trim() || !Number.isFinite(cal) || cal <= 0) return;

    onLog({
      dateKey,
      name: name.trim(),
      calories: cal * serv,
      protein: prot * serv,
      servings: serv,
    });

    if (save) {
      onSaveFood({ name: name.trim(), calories: cal, protein: prot });
    }

    setName("");
    setCalories("");
    setProtein("");
    setServings("1");
    setSave(false);
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <h2 className="mb-3 text-sm font-semibold text-slate-200">Log food</h2>

      {foods.length > 0 && (
        <div className="mb-4">
          <div className="mb-2 text-xs text-slate-500">
            Tap to log one serving from your library
          </div>
          <div className="flex flex-wrap gap-2">
            {foods.map((f) => (
              <button
                key={f.id}
                onClick={() => logFood(f)}
                title={`${f.calories} kcal / ${f.protein}g protein${
                  f.servingLabel ? ` per ${f.servingLabel}` : ""
                }`}
                className="rounded-full bg-ink-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-ink-700"
              >
                {f.name}
                <span className="ml-1.5 text-slate-500">{f.calories}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className="col-span-2 flex flex-col gap-1.5 text-xs text-slate-400">
            Food
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Protein shake"
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-slate-400">
            Calories
            <input
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              inputMode="numeric"
              placeholder="kcal"
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-xs text-slate-400">
            Protein (g)
            <input
              value={protein}
              onChange={(e) => setProtein(e.target.value)}
              inputMode="numeric"
              placeholder="g"
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Servings
            <input
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              inputMode="decimal"
              className="w-16 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={save}
              onChange={(e) => setSave(e.target.checked)}
              className="h-4 w-4 rounded border-ink-600 bg-ink-850 accent-accent"
            />
            Save to library
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-accent-strong"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
