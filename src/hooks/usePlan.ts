import { useCallback, useEffect, useMemo, useState } from "react";
import { localDateKey, startOfWeek } from "../lib/nutrition";
import { PROGRAM_WEEKS, type DayId } from "../lib/plan";

const STORAGE_KEY = "training-plan:v1";

/** A single logged main-lift result within a session. */
export interface LiftLog {
  liftId: string;
  weight: number;
  reps: number;
}

/** A logged run within a session. */
export interface RunLog {
  distanceMi: number;
  minutes: number;
}

/** A completed (or in-progress) training day. */
export interface SessionLog {
  id: string;
  /** Local calendar day key, "YYYY-MM-DD". */
  dateKey: string;
  /** Program week (1-8) this session belongs to. */
  week: number;
  dayId: DayId;
  lifts: LiftLog[];
  run?: RunLog;
  done: boolean;
}

interface Persisted {
  /** Day key the program began; used to derive the current week. */
  startDate: string;
  logs: SessionLog[];
}

function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function loadInitial(): Persisted {
  const fallback: Persisted = { startDate: localDateKey(), logs: [] };
  if (typeof localStorage === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      startDate: parsed.startDate ?? fallback.startDate,
      logs: parsed.logs ?? [],
    };
  } catch {
    return fallback;
  }
}

/** Whole weeks elapsed since startDate, clamped to the 1-PROGRAM_WEEKS range. */
function deriveCurrentWeek(startDate: string): number {
  const start = startOfWeek(new Date(`${startDate}T00:00:00`).getTime());
  const now = startOfWeek(Date.now());
  const DAY_MS = 24 * 60 * 60 * 1000;
  const weeks = Math.floor((now - start) / (7 * DAY_MS)) + 1;
  return Math.min(PROGRAM_WEEKS, Math.max(1, weeks));
}

export interface PlanStore {
  startDate: string;
  logs: SessionLog[];
  currentWeek: number;
  setStartDate: (dateKey: string) => void;
  upsertSession: (session: Omit<SessionLog, "id"> & { id?: string }) => void;
  removeSession: (id: string) => void;
  sessionFor: (week: number, dayId: DayId) => SessionLog | undefined;
}

export function usePlan(): PlanStore {
  const [state, setState] = useState<Persisted>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota / private-mode write failures; data stays in memory.
    }
  }, [state]);

  const setStartDate = useCallback((dateKey: string) => {
    setState((s) => ({ ...s, startDate: dateKey }));
  }, []);

  const upsertSession = useCallback(
    (session: Omit<SessionLog, "id"> & { id?: string }) => {
      setState((s) => {
        // One session per (week, day): replace a matching entry if present.
        const existing = s.logs.find(
          (l) =>
            (session.id && l.id === session.id) ||
            (l.week === session.week && l.dayId === session.dayId),
        );
        if (existing) {
          return {
            ...s,
            logs: s.logs.map((l) =>
              l.id === existing.id ? { ...existing, ...session, id: existing.id } : l,
            ),
          };
        }
        return { ...s, logs: [...s.logs, { ...session, id: genId() }] };
      });
    },
    [],
  );

  const removeSession = useCallback((id: string) => {
    setState((s) => ({ ...s, logs: s.logs.filter((l) => l.id !== id) }));
  }, []);

  const currentWeek = useMemo(
    () => deriveCurrentWeek(state.startDate),
    [state.startDate],
  );

  const sessionFor = useCallback(
    (week: number, dayId: DayId) =>
      state.logs.find((l) => l.week === week && l.dayId === dayId),
    [state.logs],
  );

  return useMemo(
    () => ({
      startDate: state.startDate,
      logs: state.logs,
      currentWeek,
      setStartDate,
      upsertSession,
      removeSession,
      sessionFor,
    }),
    [state, currentWeek, setStartDate, upsertSession, removeSession, sessionFor],
  );
}
