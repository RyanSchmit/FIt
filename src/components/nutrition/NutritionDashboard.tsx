import { useMemo } from "react";
import { useNutrition } from "../../hooks/useNutrition";
import { dailyTotals, entriesForDate, localDateKey } from "../../lib/nutrition";
import type { WorkoutSet } from "../../lib/types";
import CalorieProgress from "./CalorieProgress";
import DailyIntake from "./DailyIntake";
import IntakeAnalytics from "./IntakeAnalytics";
import NutritionSettings from "./NutritionSettings";

interface Props {
  sets: WorkoutSet[];
}

export default function NutritionDashboard({ sets }: Props) {
  const store = useNutrition();
  const dateKey = localDateKey();

  const todayEntry = useMemo(
    () => entriesForDate(store.log, dateKey)[0],
    [store.log, dateKey],
  );
  const totals = useMemo(
    () => dailyTotals(todayEntry ? [todayEntry] : []),
    [todayEntry],
  );

  return (
    <div className="flex flex-col gap-6">
      <NutritionSettings settings={store.settings} onChange={store.updateSettings} />

      <div className="grid gap-6 lg:grid-cols-2">
        <CalorieProgress totals={totals} settings={store.settings} />
        <DailyIntake
          entry={todayEntry}
          onSave={(calories, protein) =>
            store.setDayIntake(dateKey, calories, protein)
          }
          onClear={() => store.clearDay(dateKey)}
        />
      </div>

      <IntakeAnalytics log={store.log} sets={sets} />

      <footer className="pb-4 pt-2 text-center font-mono text-[11px] tracking-[0.04em] text-steel">
        Your calorie targets and daily intake are saved locally in this browser.
        Nothing leaves your machine.
      </footer>
    </div>
  );
}
