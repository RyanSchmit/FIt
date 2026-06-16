import Papa from "papaparse";
import type { WorkoutSet } from "./types";

interface RawRow {
  Date?: string;
  "Workout Name"?: string;
  Duration?: string;
  "Exercise Name"?: string;
  "Set Order"?: string;
  Weight?: string;
  Reps?: string;
  Distance?: string;
  Seconds?: string;
  RPE?: string;
}

function toNumber(value: string | undefined): number {
  if (value == null || value.trim() === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  // Strong exports use "YYYY-MM-DD HH:mm:ss"; normalize to ISO for Safari.
  const iso = value.trim().replace(" ", "T");
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Parse a Strong CSV export string into a sorted list of working sets. */
export function parseStrongCsv(csv: string): WorkoutSet[] {
  const { data } = Papa.parse<RawRow>(csv, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const sets: WorkoutSet[] = [];
  for (const row of data) {
    const date = parseDate(row.Date);
    const exercise = row["Exercise Name"]?.trim();
    if (!date || !exercise) continue;

    const reps = toNumber(row.Reps);
    // Skip warm-up-only / empty rows that have neither reps nor distance work.
    if (reps <= 0) continue;

    const rpeRaw = row.RPE?.trim();
    sets.push({
      date,
      workoutName: row["Workout Name"]?.trim() ?? "",
      exercise,
      setOrder: toNumber(row["Set Order"]),
      weight: toNumber(row.Weight),
      reps,
      rpe: rpeRaw ? Number(rpeRaw) || null : null,
    });
  }

  sets.sort((a, b) => a.date.getTime() - b.date.getTime());
  return sets;
}

/** Distinct exercise names sorted by how often they appear. */
export function exercisesByFrequency(sets: WorkoutSet[]): string[] {
  const counts = new Map<string, number>();
  for (const s of sets) counts.set(s.exercise, (counts.get(s.exercise) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name);
}
