import { useCallback, useEffect, useMemo, useState } from "react";
import {
  defaultSettings,
  type LogEntry,
  type NutritionSettings,
} from "../lib/nutrition";

const STORAGE_KEY = "bulk-tracker:v1";

interface Persisted {
  log: LogEntry[];
  settings: NutritionSettings;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadInitial(): Persisted {
  const fallback: Persisted = {
    log: [],
    settings: defaultSettings(),
  };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      log: parsed.log ?? [],
      settings: { ...fallback.settings, ...parsed.settings },
    };
  } catch {
    return fallback;
  }
}

export interface NutritionStore {
  log: LogEntry[];
  settings: NutritionSettings;
  /** Create or overwrite the single intake entry for a given day. */
  setDayIntake: (dateKey: string, calories: number, protein: number) => void;
  clearDay: (dateKey: string) => void;
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

  const setDayIntake = useCallback(
    (dateKey: string, calories: number, protein: number) => {
      setState((s) => {
        const rest = s.log.filter((e) => e.dateKey !== dateKey);
        return {
          ...s,
          log: [...rest, { id: genId(), dateKey, calories, protein }],
        };
      });
    },
    [],
  );

  const clearDay = useCallback((dateKey: string) => {
    setState((s) => ({ ...s, log: s.log.filter((e) => e.dateKey !== dateKey) }));
  }, []);

  const updateSettings = useCallback((patch: Partial<NutritionSettings>) => {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }, []);

  return useMemo(
    () => ({
      log: state.log,
      settings: state.settings,
      setDayIntake,
      clearDay,
      updateSettings,
    }),
    [state, setDayIntake, clearDay, updateSettings],
  );
}
