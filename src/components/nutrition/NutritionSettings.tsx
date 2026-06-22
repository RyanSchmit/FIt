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
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-brass">
            Daily Targets
          </h2>
          <p className="mt-1 text-xs text-steel">
            {settings.calorieTarget} kcal - {settings.proteinTarget}g protein
          </p>
        </div>
        <span className="font-mono text-xs uppercase text-steel-light">
          {open ? "Hide" : "Edit"}
        </span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
              Calorie target (kcal)
              <input
                type="number"
                value={settings.calorieTarget}
                onChange={(e) =>
                  onChange({ calorieTarget: Number(e.target.value) || 0 })
                }
                className="rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
              />
            </label>
            <label className="flex flex-col gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
              Protein target (g)
              <input
                type="number"
                value={settings.proteinTarget}
                onChange={(e) =>
                  onChange({ proteinTarget: Number(e.target.value) || 0 })
                }
                className="rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
              />
            </label>
          </div>

          <div className="rounded-sm border border-cream/10 bg-ink-850 p-3 text-xs text-steel-light">
            Suggested from your latest body weight ({suggested.bodyWeight} lb):
            maintenance is roughly{" "}
            <span className="text-cream">{suggested.maintenance} kcal</span>, so a
            bulking target of{" "}
            <span className="text-cream">{suggested.calorieTarget} kcal</span> adds a
            ~400 kcal surplus (about +0.4 lb/week) with{" "}
            <span className="text-cream">{suggested.proteinTarget}g protein</span>.
            <button
              onClick={() =>
                onChange({
                  calorieTarget: suggested.calorieTarget,
                  proteinTarget: suggested.proteinTarget,
                })
              }
              className="ml-1 font-medium text-brass hover:underline"
            >
              Use suggested
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
