import { useMemo } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { linregress, pearson } from "../../lib/analysis";
import { estimatedOneRepMax } from "../../lib/metrics";
import {
  startOfWeek,
  weeklyAverageIntake,
  weightChangeForWeek,
  type LogEntry,
} from "../../lib/nutrition";
import type { WorkoutSet } from "../../lib/types";

interface Props {
  log: LogEntry[];
  sets: WorkoutSet[];
}

const MIN_POINTS = 3;

function strengthChangeByWeek(sets: WorkoutSet[]): Map<number, number> {
  // Best estimated 1RM (across all lifts) per week, then week-over-week change.
  const bestByWeek = new Map<number, number>();
  for (const s of sets) {
    const wk = startOfWeek(s.date.getTime());
    const e = estimatedOneRepMax(s);
    bestByWeek.set(wk, Math.max(bestByWeek.get(wk) ?? 0, e));
  }
  const weeks = [...bestByWeek.keys()].sort((a, b) => a - b);
  const change = new Map<number, number>();
  for (let i = 1; i < weeks.length; i++) {
    change.set(weeks[i], bestByWeek.get(weeks[i])! - bestByWeek.get(weeks[i - 1])!);
  }
  return change;
}

function strengthOf(r: number): string {
  const a = Math.abs(r);
  if (a < 0.1) return "negligible";
  if (a < 0.3) return "weak";
  if (a < 0.5) return "moderate";
  return "strong";
}

export default function IntakeAnalytics({ log, sets }: Props) {
  const weeks = useMemo(() => weeklyAverageIntake(log), [log]);

  const weightPoints = useMemo(() => {
    return weeks
      .map((w) => {
        const dy = weightChangeForWeek(w.weekStart);
        return dy == null
          ? null
          : { x: Math.round(w.avgCalories), y: Number(dy.toFixed(2)), weekStart: w.weekStart };
      })
      .filter((p): p is { x: number; y: number; weekStart: number } => p !== null);
  }, [weeks]);

  const strengthCorr = useMemo(() => {
    const change = strengthChangeByWeek(sets);
    const pts = weeks
      .map((w) => {
        const dy = change.get(w.weekStart);
        return dy == null ? null : { x: w.avgCalories, y: dy };
      })
      .filter((p): p is { x: number; y: number } => p !== null);
    if (pts.length < MIN_POINTS) return null;
    return { r: pearson(pts.map((p) => p.x), pts.map((p) => p.y)), n: pts.length };
  }, [weeks, sets]);

  const enough = weightPoints.length >= MIN_POINTS;

  const { r, chartData } = useMemo(() => {
    if (!enough) return { r: 0, chartData: [] as Record<string, number | null>[] };
    const xs = weightPoints.map((p) => p.x);
    const ys = weightPoints.map((p) => p.y);
    const corr = pearson(xs, ys);
    const { slope, intercept } = linregress(xs, ys);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const data: Record<string, number | null>[] = [
      ...weightPoints.map((p) => ({ x: p.x, y: p.y, yLine: null })),
      { x: minX, y: null, yLine: slope * minX + intercept },
      { x: maxX, y: null, yLine: slope * maxX + intercept },
    ];
    return { r: corr, chartData: data };
  }, [enough, weightPoints]);

  const loggedDays = useMemo(
    () => new Set(log.map((e) => e.dateKey)).size,
    [log],
  );

  return (
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-brass">
          Intake vs Results
        </h2>
        {enough && (
          <span className="font-mono text-xs text-steel-light">
            r = {r.toFixed(2)} - {weightPoints.length} weeks
          </span>
        )}
      </div>
      <p className="mb-4 text-xs text-steel">
        Weekly average daily calories vs body-weight change that week. Correlation from
        your own history, not proof of cause and effect.
      </p>

      {!enough ? (
        <div className="rounded-sm border border-cream/10 bg-ink-850 px-4 py-6 text-sm text-steel-light">
          Keep logging - this needs at least {MIN_POINTS} weeks of data to find a pattern.
          You've logged{" "}
          <span className="text-cream">{loggedDays} day(s)</span> across{" "}
          <span className="text-cream">{weeks.length} week(s)</span> so far.
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <ComposedChart data={chartData} margin={{ top: 6, right: 10, bottom: 16, left: -6 }}>
              <CartesianGrid stroke="rgba(245,240,232,0.08)" />
              <XAxis
                type="number"
                dataKey="x"
                stroke="#9ca3af"
                fontSize={11}
                domain={["dataMin - 100", "dataMax + 100"]}
                label={{
                  value: "Avg daily calories (kcal)",
                  position: "insideBottom",
                  offset: -8,
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
              />
              <YAxis
                type="number"
                dataKey="y"
                stroke="#9ca3af"
                fontSize={11}
                width={44}
                label={{
                  value: "Weight chg (lb)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "#9ca3af",
                  fontSize: 11,
                }}
              />
              <ZAxis range={[45, 45]} />
              <Tooltip
                cursor={{ stroke: "#3a4258" }}
                contentStyle={{
                  background: "#252b3d",
                  border: "1px solid #3a4258",
                  borderRadius: 2,
                  fontSize: 12,
                }}
                formatter={(value: number, key: string) =>
                  key === "y"
                    ? [`${value > 0 ? "+" : ""}${value} lb`, "Weight change"]
                    : [`${value} kcal`, "Avg intake"]
                }
                labelFormatter={() => ""}
              />
              <Scatter dataKey="y" fill="#8a7456" isAnimationActive={false} />
              <Line
                dataKey="yLine"
                stroke={r >= 0 ? "#3f8557" : "#c41e3a"}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls
              />
            </ComposedChart>
          </ResponsiveContainer>

          <div className="mt-4 flex flex-col gap-2">
            <div className="rounded-sm border border-cream/10 bg-ink-850 p-3 text-sm text-steel-light">
              {r > 0.1
                ? `A ${strengthOf(r)} positive link (r = ${r.toFixed(2)}): weeks where you averaged more calories tended to show more weight gain. Eating more is moving the needle - push the higher-calorie weeks.`
                : r < -0.1
                  ? `A ${strengthOf(r)} negative link (r = ${r.toFixed(2)}) so far - likely noise from too few weeks or weigh-in timing. Keep logging consistently.`
                  : `No clear link yet (r = ${r.toFixed(2)}). Log more weeks, especially higher-calorie ones, to see the trend.`}
            </div>
            {strengthCorr && (
              <div className="rounded-sm border border-cream/10 bg-ink-850 p-3 text-sm text-steel-light">
                Intake vs weekly strength change: {strengthOf(strengthCorr.r)} relationship
                (r = {strengthCorr.r.toFixed(2)}) across {strengthCorr.n} weeks.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
