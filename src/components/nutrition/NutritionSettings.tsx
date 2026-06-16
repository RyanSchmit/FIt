import { useState } from "react";
import {
  suggestedTargets,
  type NutritionSettings as Settings,
} from "../../lib/nutrition";

interface Props {
  settings: Settings;
  onChange: (patch: Partial<Settings>) => void;
}

export default function NutritionSettings({ settings, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const suggested = suggestedTargets();

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Daily targets</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {settings.calorieTarget} kcal - {settings.proteinTarget}g protein
          </p>
        </div>
        <span className="text-xs text-slate-500">{open ? "Hide" : "Edit"}</span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
              Calorie target (kcal)
              <input
                type="number"
                value={settings.calorieTarget}
                onChange={(e) =>
                  onChange({ calorieTarget: Number(e.target.value) || 0 })
                }
                className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs text-slate-400">
              Protein target (g)
              <input
                type="number"
                value={settings.proteinTarget}
                onChange={(e) =>
                  onChange({ proteinTarget: Number(e.target.value) || 0 })
                }
                className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
              />
            </label>
          </div>

          <div className="rounded-xl border border-ink-700 bg-ink-850 p-3 text-xs text-slate-400">
            Suggested from your latest body weight ({suggested.bodyWeight} lb):
            maintenance is roughly{" "}
            <span className="text-slate-200">{suggested.maintenance} kcal</span>, so a
            bulking target of{" "}
            <span className="text-slate-200">{suggested.calorieTarget} kcal</span> adds a
            ~400 kcal surplus (about +0.4 lb/week) with{" "}
            <span className="text-slate-200">{suggested.proteinTarget}g protein</span>.
            <button
              onClick={() =>
                onChange({
                  calorieTarget: suggested.calorieTarget,
                  proteinTarget: suggested.proteinTarget,
                })
              }
              className="ml-1 font-medium text-accent hover:underline"
            >
              Use suggested
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
