import type { ExerciseSession, WorkoutSet } from "./types";

/**
 * Epley estimated 1RM. For bodyweight movements (no external load) we fall
 * back to a reps-based score so progression is still tracked.
 */
export function estimatedOneRepMax(set: WorkoutSet): number {
  if (set.weight > 0) {
    return set.weight * (1 + set.reps / 30);
  }
  // Bodyweight: treat each rep as a unit of progression.
  return set.reps;
}

function startOfDay(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** Collapse a flat set list for a single exercise into per-day sessions. */
export function buildSessions(sets: WorkoutSet[], exercise: string): ExerciseSession[] {
  const relevant = sets.filter((s) => s.exercise === exercise);
  const byDay = new Map<number, WorkoutSet[]>();
  for (const s of relevant) {
    const key = startOfDay(s.date);
    const list = byDay.get(key);
    if (list) list.push(s);
    else byDay.set(key, [s]);
  }

  const sessions: ExerciseSession[] = [];
  for (const [key, daySets] of byDay) {
    let bestSet = daySets[0];
    let bestE1rm = estimatedOneRepMax(bestSet);
    let topWeight = 0;
    let volume = 0;
    let maxReps = 0;
    let loaded = false;

    for (const s of daySets) {
      const e = estimatedOneRepMax(s);
      if (e > bestE1rm) {
        bestE1rm = e;
        bestSet = s;
      }
      if (s.weight > topWeight) topWeight = s.weight;
      if (s.weight > 0) loaded = true;
      volume += (s.weight > 0 ? s.weight : 1) * s.reps;
      if (s.reps > maxReps) maxReps = s.reps;
    }

    sessions.push({
      date: new Date(key),
      exercise,
      workoutName: daySets[0].workoutName,
      sets: daySets,
      e1rm: bestE1rm,
      topWeight,
      volume,
      setCount: daySets.length,
      maxReps,
      bestSet,
      bodyweight: !loaded,
    });
  }

  sessions.sort((a, b) => a.date.getTime() - b.date.getTime());
  return sessions;
}

export const DAY_MS = 24 * 60 * 60 * 1000;

export function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / DAY_MS);
}
