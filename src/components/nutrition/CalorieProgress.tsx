import type { DailyTotals, NutritionSettings } from "../../lib/nutrition";

interface Props {
  totals: DailyTotals;
  settings: NutritionSettings;
}

function Bar({
  label,
  value,
  target,
  unit,
  tint,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  tint: string;
}) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const remaining = Math.max(0, Math.round(target - value));
  const over = value > target;

  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-sm">
        <span className="font-medium text-cream">{label}</span>
        <span className="font-mono text-xs text-steel-light">
          {Math.round(value)} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink-800">
        <div
          className={`h-full rounded-full ${tint} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1 text-xs">
        {over ? (
          <span className="text-[#5fae77]">
            Target hit - {Math.round(value - target)} {unit} over
          </span>
        ) : (
          <span className="text-steel">
            {remaining} {unit} left today
          </span>
        )}
      </div>
    </div>
  );
}

export default function CalorieProgress({ totals, settings }: Props) {
  return (
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-brass">
        Today
      </h2>
      <div className="flex flex-col gap-4">
        <Bar
          label="Calories"
          value={totals.calories}
          target={settings.calorieTarget}
          unit="kcal"
          tint="bg-brass"
        />
        <Bar
          label="Protein"
          value={totals.protein}
          target={settings.proteinTarget}
          unit="g"
          tint="bg-[#3f8557]"
        />
      </div>
    </div>
  );
}
