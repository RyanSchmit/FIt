export interface WorkoutSet {
  date: Date;
  workoutName: string;
  exercise: string;
  setOrder: number;
  weight: number;
  reps: number;
  rpe: number | null;
}

/** All sets for one exercise performed on a single workout date. */
export interface ExerciseSession {
  date: Date;
  exercise: string;
  workoutName: string;
  sets: WorkoutSet[];
  /** Best estimated 1RM across all sets in the session. */
  e1rm: number;
  /** Heaviest weight lifted in the session. */
  topWeight: number;
  /** Sum of weight x reps across all sets. */
  volume: number;
  /** Count of sets performed. */
  setCount: number;
  /** Highest rep count in any set. */
  maxReps: number;
  /** Best single set by estimated 1RM. */
  bestSet: WorkoutSet;
  /** True when the exercise is performed without external load (bodyweight). */
  bodyweight: boolean;
}

/** A single factor measured in the window leading up to a session. */
export type FactorKey =
  | "frequency"
  | "volume"
  | "sets"
  | "intensity"
  | "recovery";

export interface FactorDef {
  key: FactorKey;
  label: string;
  unit: string;
  description: string;
}

/** One observation linking trailing-window factors to the next improvement. */
export interface Observation {
  date: Date;
  factors: Record<FactorKey, number>;
  /** Absolute change in e1RM from the previous session to this one. */
  deltaE1rm: number;
  /** Percent change in e1RM relative to the previous session. */
  deltaPct: number;
}

export interface FactorResult {
  def: FactorDef;
  /** Pearson correlation coefficient with next-session improvement. */
  r: number;
  /** Number of observations used. */
  n: number;
  /** Linear regression slope (improvement per factor unit). */
  slope: number;
  intercept: number;
  /** Scatter points: factor value vs improvement. */
  points: { x: number; y: number; date: Date }[];
}

export type ImprovementMetric = "e1rm" | "topWeight";

export interface AnalysisInput {
  sessions: ExerciseSession[];
  windowDays: number;
  metric: ImprovementMetric;
}
