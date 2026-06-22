import { useCallback, useEffect, useMemo, useState } from "react";
import { localDateKey } from "../lib/nutrition";

const STORAGE_KEY = "pt-prep:runs:v1";

/**
 * A logged 1.5-mile run. This is the only PT-card metric without an existing
 * data source in the app (bodyweight comes from the Weight tab, squat/bench
 * from the imported Strong CSV), so it gets its own local store.
 */
export interface RunEntry {
  id: string;
  /** Local calendar day key, "YYYY-MM-DD". */
  dateKey: string;
  /** Run time as decimal minutes (e.g. 12.3 == 12:30 via fmtRunTime). */
  minutes: number;
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function byDate(a: RunEntry, b: RunEntry): number {
  return a.dateKey.localeCompare(b.dateKey);
}

function loadInitial(): RunEntry[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as RunEntry[];
    if (!Array.isArray(parsed)) return [];
    return [...parsed].sort(byDate);
  } catch {
    return [];
  }
}

export interface RunLogStore {
  entries: RunEntry[];
  /** Most recent run time in decimal minutes, or null if none logged. */
  latest: number | null;
  addEntry: (minutes: number, dateKey?: string) => void;
  removeEntry: (id: string) => void;
}

export function useRunLog(): RunLogStore {
  const [entries, setEntries] = useState<RunEntry[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota / private-mode write failures; data stays in memory.
    }
  }, [entries]);

  const addEntry = useCallback((minutes: number, dateKey?: string) => {
    setEntries((prev) =>
      [...prev, { id: genId(), dateKey: dateKey ?? localDateKey(), minutes }].sort(
        byDate,
      ),
    );
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const latest = useMemo(
    () => (entries.length ? entries[entries.length - 1].minutes : null),
    [entries],
  );

  return useMemo(
    () => ({ entries, latest, addEntry, removeEntry }),
    [entries, latest, addEntry, removeEntry],
  );
}
