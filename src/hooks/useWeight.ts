import { useCallback, useEffect, useMemo, useState } from "react";
import { WEIGHT_DATA } from "../lib/weightData";

const STORAGE_KEY = "bulk-tracker:weights:v2";
const LEGACY_STORAGE_KEY = "bulk-tracker:weights:v1";
/** Flag marking that the one-time MFP-screenshot note backfill has run. */
const NOTE_BACKFILL_KEY = "bulk-tracker:weights:note-backfill:v2";

/** Default note applied to historical points digitized from the MFP screenshot. */
const SEED_NOTE = "Estimate from myFitnessPal screenshot";

/** Pre-filled note for new weight entries. */
export const DEFAULT_WEIGHT_NOTE = "Weighed first thing after waking up";

export interface WeightEntry {
  id: string;
  recordedAt: number; // epoch ms - captures both date and time of day
  weightLb: number;
  note?: string;
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
    return {
      id: genId(),
      recordedAt: d.getTime(),
      weightLb: p.bodyWeight,
      note: SEED_NOTE,
    };
  }).sort(byRecordedAt);
}

function parseStored(raw: string): WeightEntry[] | null {
  try {
    const parsed = JSON.parse(raw) as WeightEntry[];
    if (!Array.isArray(parsed)) return null;
    return [...parsed].sort(byRecordedAt);
  } catch {
    return null;
  }
}

function loadInitial(): WeightEntry[] {
  if (typeof localStorage === "undefined") return seedEntries();
  try {
    // Load whatever data exists, preferring v2 then falling back to legacy v1.
    let entries: WeightEntry[] | null = null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) entries = parseStored(raw);
    if (!entries) {
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) entries = parseStored(legacy);
    }
    if (!entries) entries = seedEntries();
    return entries;
  } catch {
    return seedEntries();
  }
}

export interface WeightStore {
  entries: WeightEntry[];
  addEntry: (weightLb: number, recordedAt: number, note?: string) => void;
  updateEntry: (
    id: string,
    weightLb: number,
    recordedAt: number,
    note?: string,
  ) => void;
  removeEntry: (id: string) => void;
}

export function useWeight(): WeightStore {
  const [entries, setEntries] = useState<WeightEntry[]>(loadInitial);

  // One-time backfill: tag every entry missing a note with the MFP-screenshot
  // note. Runs in an effect (not the state initializer) so it executes on a
  // real mount even when Fast Refresh preserves state. Guarded by a flag so it
  // happens exactly once.
  useEffect(() => {
    if (typeof localStorage === "undefined") return;
    try {
      if (localStorage.getItem(NOTE_BACKFILL_KEY)) return;
      setEntries((prev) =>
        prev.map((e) => (e.note ? e : { ...e, note: SEED_NOTE })),
      );
      localStorage.setItem(NOTE_BACKFILL_KEY, "1");
    } catch {
      // Ignore storage failures; backfill will retry on the next load.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch {
      // Ignore quota / private-mode write failures; data stays in memory.
    }
  }, [entries]);

  const addEntry = useCallback(
    (weightLb: number, recordedAt: number, note?: string) => {
      setEntries((prev) =>
        [...prev, { id: genId(), weightLb, recordedAt, note }].sort(
          byRecordedAt,
        ),
      );
    },
    [],
  );

  const updateEntry = useCallback(
    (id: string, weightLb: number, recordedAt: number, note?: string) => {
      setEntries((prev) =>
        prev
          .map((e) =>
            e.id === id ? { ...e, weightLb, recordedAt, note } : e,
          )
          .sort(byRecordedAt),
      );
    },
    [],
  );

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return useMemo(
    () => ({ entries, addEntry, updateEntry, removeEntry }),
    [entries, addEntry, updateEntry, removeEntry],
  );
}
