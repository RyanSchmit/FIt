import { nutritionFor } from "../../lib/ptPlan";

interface Props {
  weightLb: number;
}

export default function NutritionTargets({ weightLb }: Props) {
  const n = nutritionFor(weightLb);
  const cards: { val: string; label: string }[] = [
    { val: String(n.calories), label: "Calories / day" },
    { val: `${n.protein}g`, label: "Protein / day" },
    { val: `${n.carbs}g`, label: "Carbs / day (approx)" },
    { val: `${n.fat}g`, label: "Fat / day (approx)" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded border border-cream/10 bg-ink-850 p-4"
        >
          <div className="font-mono text-[26px] font-bold text-brass">
            {c.val}
          </div>
          <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel-light">
            {c.label}
          </div>
        </div>
      ))}
    </div>
  );
}
