import { useCallback, useEffect, useMemo, useState } from "react";
import { WEIGHT_DATA } from "../lib/weightData";

const STORAGE_KEY = "bulk-tracker:weights:v1";

export interface WeightEntry {
  id: string;
  recordedAt: number; // epoch ms - captures both date and time of day
  weightLb: number;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function byRecordedAt(a: WeightEntry, b: WeightEntry): number {
  return a.recordedAt - b.recordedAt;
}

/** Seed historical points (anchored at noon local time) so prior data isn't lost. */
function seedEntries(): WeightEntry[] {
  return WEIGHT_DATA.map((p) => {
    const d = new Date(p.t);
    d.setHours(12, 0, 0, 0);
    return { id: genId(), recordedAt: d.getTime(), weightLb: p.bodyWeight };
  }).sort(byRecordedAt);
}

function loadInitial(): WeightEntry[] {
  if (typeof localStorage === "undefined") return seedEntries();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedEntries();
    const parsed = JSON.parse(raw) as WeightEntry[];
    if (!Array.isArray(parsed)) return seedEntries();
    return [...parsed].sort(byRecordedAt);
  } catch {
    return seedEntries();
  }
}

export interface WeightStore {
  entries: WeightEntry[];
  addEntry: (weightLb: number, recordedAt: number) => void;
  removeEntry: (id: string) => void;
}

export function useWeight(): WeightStore {
  const [entries, setEntries] = useState<WeightEntry[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota / private-mode write failures; data stays in memory.
    }
  }, [entries]);

  const addEntry = useCallback((weightLb: number, recordedAt: number) => {
    setEntries((prev) =>
      [...prev, { id: genId(), weightLb, recordedAt }].sort(byRecordedAt),
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return useMemo(
    () => ({ entries, addEntry, removeEntry }),
    [entries, addEntry, removeEntry],
  );
}
