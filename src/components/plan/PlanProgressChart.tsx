import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SessionLog } from "../../hooks/usePlan";

interface Props {
  logs: SessionLog[];
}

type View = "strength" | "running";

// Main lifts to chart (bench-volume is excluded; it's not a top-set effort).
const TRACKED_LIFTS: { id: string; name: string; color: string }[] = [
  { id: "squat", name: "Squat", color: "#6ea8fe" },
  { id: "bench", name: "Bench", color: "#f472b6" },
  { id: "deadlift", name: "Deadlift", color: "#34d399" },
  { id: "ohp", name: "OHP", color: "#fbbf24" },
];

function e1rm(weight: number, reps: number): number {
  if (weight <= 0 || reps <= 0) return 0;
  return Math.round(weight * (1 + reps / 30));
}

export default function PlanProgressChart({ logs }: Props) {
  const [view, setView] = useState<View>("strength");

  const strengthData = useMemo(() => {
    const byWeek = new Map<number, Record<string, number>>();
    for (const log of logs) {
      for (const lift of log.lifts) {
        if (!TRACKED_LIFTS.some((t) => t.id === lift.liftId)) continue;
        const e = e1rm(lift.weight, lift.reps);
        if (e <= 0) continue;
        const row = byWeek.get(log.week) ?? {};
        // Keep the best top-set e1RM for the week.
        row[lift.liftId] = Math.max(row[lift.liftId] ?? 0, e);
        byWeek.set(log.week, row);
      }
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, vals]) => ({ week, ...vals }));
  }, [logs]);

  const runningData = useMemo(() => {
    const byWeek = new Map<number, { distance: number; pace: number | null }>();
    for (const log of logs) {
      if (!log.run || log.run.distanceMi <= 0) continue;
      const pace = log.run.minutes > 0 ? log.run.minutes / log.run.distanceMi : null;
      const cur = byWeek.get(log.week);
      // Track the longest run of the week and its pace.
      if (!cur || log.run.distanceMi > cur.distance) {
        byWeek.set(log.week, { distance: log.run.distanceMi, pace });
      }
    }
    return [...byWeek.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([week, v]) => ({
        week,
        distance: Number(v.distance.toFixed(2)),
        pace: v.pace ? Number(v.pace.toFixed(2)) : null,
      }));
  }, [logs]);

  const hasStrength = strengthData.length > 0;
  const hasRunning = runningData.length > 0;
  const active = view === "strength" ? hasStrength : hasRunning;

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Logged progress</h2>
        <div className="flex gap-1 rounded-lg border border-ink-700 bg-ink-850 p-0.5">
          {(["strength", "running"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                view === v ? "bg-accent text-ink-950" : "text-slate-400 hover:bg-ink-800"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {!active ? (
        <div className="py-16 text-center text-sm text-slate-600">
          Log a {view === "strength" ? "lift" : "run"} to start tracking progress here.
        </div>
      ) : view === "strength" ? (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={strengthData} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#1b212c" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="#475569"
              fontSize={11}
              tickFormatter={(w) => `Wk ${w}`}
            />
            <YAxis stroke="#475569" fontSize={11} domain={["auto", "auto"]} width={44} />
            <Tooltip
              contentStyle={{
                background: "#0f1218",
                border: "1px solid #272f3d",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(w) => `Week ${w}`}
              formatter={(v: number, name: string) => [`${v} lb`, name]}
            />
            {TRACKED_LIFTS.map((lift) => (
              <Line
                key={lift.id}
                type="monotone"
                dataKey={lift.id}
                name={lift.name}
                stroke={lift.color}
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={runningData} margin={{ top: 10, right: 16, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="#1b212c" vertical={false} />
            <XAxis
              dataKey="week"
              stroke="#475569"
              fontSize={11}
              tickFormatter={(w) => `Wk ${w}`}
            />
            <YAxis
              yAxisId="dist"
              stroke="#6ea8fe"
              fontSize={11}
              domain={[0, "auto"]}
              width={44}
            />
            <YAxis
              yAxisId="pace"
              orientation="right"
              stroke="#fbbf24"
              fontSize={11}
              domain={["auto", "auto"]}
              width={44}
              reversed
            />
            <Tooltip
              contentStyle={{
                background: "#0f1218",
                border: "1px solid #272f3d",
                borderRadius: 12,
                fontSize: 12,
              }}
              labelFormatter={(w) => `Week ${w}`}
              formatter={(v: number, name: string) =>
                name === "Pace" ? [`${v} min/mi`, name] : [`${v} mi`, name]
              }
            />
            <Line
              yAxisId="dist"
              type="monotone"
              dataKey="distance"
              name="Distance"
              stroke="#6ea8fe"
              strokeWidth={2}
              dot={{ r: 3 }}
              isAnimationActive={false}
            />
            <Line
              yAxisId="pace"
              type="monotone"
              dataKey="pace"
              name="Pace"
              stroke="#fbbf24"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={{ r: 3 }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
