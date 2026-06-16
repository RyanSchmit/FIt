import { useCallback, useEffect, useMemo, useState } from "react";
import {
  defaultSettings,
  type FoodItem,
  type LogEntry,
  type NutritionSettings,
} from "../lib/nutrition";

const STORAGE_KEY = "bulk-tracker:v1";

interface Persisted {
  foods: FoodItem[];
  log: LogEntry[];
  settings: NutritionSettings;
}

/** A handful of calorie-dense staples so the library is useful on first run. */
const SEED_FOODS: Omit<FoodItem, "id">[] = [
  { name: "Whole milk", calories: 150, protein: 8, servingLabel: "1 cup" },
  { name: "Peanut butter", calories: 190, protein: 7, servingLabel: "2 tbsp" },
  { name: "Olive oil", calories: 120, protein: 0, servingLabel: "1 tbsp" },
  { name: "Greek yogurt", calories: 150, protein: 17, servingLabel: "1 cup" },
  { name: "Granola", calories: 280, protein: 6, servingLabel: "1/2 cup" },
  { name: "Chicken breast", calories: 165, protein: 31, servingLabel: "4 oz" },
  { name: "White rice (cooked)", calories: 205, protein: 4, servingLabel: "1 cup" },
  { name: "Banana", calories: 105, protein: 1, servingLabel: "1 medium" },
];

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadInitial(): Persisted {
  const fallback: Persisted = {
    foods: SEED_FOODS.map((f) => ({ ...f, id: genId() })),
    log: [],
    settings: defaultSettings(),
  };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      foods: parsed.foods ?? fallback.foods,
      log: parsed.log ?? [],
      settings: { ...fallback.settings, ...parsed.settings },
    };
  } catch {
    return fallback;
  }
}

export interface NutritionStore {
  foods: FoodItem[];
  log: LogEntry[];
  settings: NutritionSettings;
  addFood: (food: Omit<FoodItem, "id">) => FoodItem;
  updateFood: (id: string, patch: Partial<Omit<FoodItem, "id">>) => void;
  removeFood: (id: string) => void;
  addEntry: (entry: Omit<LogEntry, "id">) => void;
  removeEntry: (id: string) => void;
  updateSettings: (patch: Partial<NutritionSettings>) => void;
}

export function useNutrition(): NutritionStore {
  const [state, setState] = useState<Persisted>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota / private-mode write failures; data stays in memory.
    }
  }, [state]);

  const addFood = useCallback((food: Omit<FoodItem, "id">) => {
    const created: FoodItem = { ...food, id: genId() };
    setState((s) => ({ ...s, foods: [...s.foods, created] }));
    return created;
  }, []);

  const updateFood = useCallback(
    (id: string, patch: Partial<Omit<FoodItem, "id">>) => {
      setState((s) => ({
        ...s,
        foods: s.foods.map((f) => (f.id === id ? { ...f, ...patch } : f)),
      }));
    },
    [],
  );

  const removeFood = useCallback((id: string) => {
    setState((s) => ({ ...s, foods: s.foods.filter((f) => f.id !== id) }));
  }, []);

  const addEntry = useCallback((entry: Omit<LogEntry, "id">) => {
    setState((s) => ({ ...s, log: [...s.log, { ...entry, id: genId() }] }));
  }, []);

  const removeEntry = useCallback((id: string) => {
    setState((s) => ({ ...s, log: s.log.filter((e) => e.id !== id) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<NutritionSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  return useMemo(
    () => ({
      foods: state.foods,
      log: state.log,
      settings: state.settings,
      addFood,
      updateFood,
      removeFood,
      addEntry,
      removeEntry,
      updateSettings,
    }),
    [state, addFood, updateFood, removeFood, addEntry, removeEntry, updateSettings],
  );
}
