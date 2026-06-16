import { useMemo } from "react";
import { useNutrition } from "../../hooks/useNutrition";
import { dailyTotals, entriesForDate, localDateKey } from "../../lib/nutrition";
import type { WorkoutSet } from "../../lib/types";
import CalorieProgress from "./CalorieProgress";
import DailyLog from "./DailyLog";
import FoodLibrary from "./FoodLibrary";
import IntakeAnalytics from "./IntakeAnalytics";
import MealSuggestions from "./MealSuggestions";
import NutritionSettings from "./NutritionSettings";
import QuickAdd from "./QuickAdd";

interface Props {
  sets: WorkoutSet[];
}

export default function NutritionDashboard({ sets }: Props) {
  const store = useNutrition();
  const dateKey = localDateKey();

  const todayEntries = useMemo(
    () => entriesForDate(store.log, dateKey),
    [store.log, dateKey],
  );
  const totals = useMemo(() => dailyTotals(todayEntries), [todayEntries]);
  const remaining = Math.max(0, store.settings.calorieTarget - totals.calories);

  return (
    <div className="flex flex-col gap-6">
      <NutritionSettings settings={store.settings} onChange={store.updateSettings} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CalorieProgress totals={totals} settings={store.settings} />
        <MealSuggestions
          remainingKcal={remaining}
          foods={store.foods}
          dateKey={dateKey}
          onLog={store.addEntry}
        />
      </div>

      <QuickAdd
        foods={store.foods}
        dateKey={dateKey}
        onLog={store.addEntry}
        onSaveFood={store.addFood}
      />

      <DailyLog entries={todayEntries} onRemove={store.removeEntry} />

      <FoodLibrary
        foods={store.foods}
        onAdd={store.addFood}
        onUpdate={store.updateFood}
        onRemove={store.removeFood}
      />

      <IntakeAnalytics log={store.log} sets={sets} />

      <footer className="pb-4 pt-2 text-center text-xs text-slate-600">
        Calories and your food library are saved locally in this browser. Nothing leaves
        your machine.
      </footer>
    </div>
  );
}
