import { useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WEIGHT_DATA } from "../lib/weightData";
import type { ExerciseSession, ImprovementMetric } from "../lib/types";

interface Props {
  sessions: ExerciseSession[];
  metric: ImprovementMetric;
}

export default function ProgressionChart({ sessions, metric }: Props) {
  const [showWeight, setShowWeight] = useState(true);
  const [showTrend, setShowTrend] = useState(true);
  const unit = metric === "e1rm" ? "Est. 1RM (lb)" : "Top weight (lb)";

  let best = -Infinity;
  const strengthData = sessions.map((s) => {
    const value = metric === "e1rm" ? s.e1rm : s.topWeight || s.e1rm;
    const isPr = value > best;
    if (isPr) best = value;
    return {
      t: s.date.getTime(),
      value: Math.round(value),
      pr: isPr ? Math.round(value) : null,
    };
  });

  const timeMin = strengthData[0]?.t ?? 0;
  const timeMax = strengthData[strengthData.length - 1]?.t ?? Date.now();

  const n = strengthData.length;
  const trendData =
    n >= 2
      ? (() => {
          const sx = strengthData.reduce((a, d) => a + d.t, 0);
          const sy = strengthData.reduce((a, d) => a + d.value, 0);
          const sxx = strengthData.reduce((a, d) => a + d.t * d.t, 0);
          const sxy = strengthData.reduce((a, d) => a + d.t * d.value, 0);
          const denom = n * sxx - sx * sx;
          if (denom === 0) return [];
          const slope = (n * sxy - sx * sy) / denom;
          const intercept = (sy - slope * sx) / n;
          return [
            { t: timeMin, trend: Math.round(slope * timeMin + intercept) },
            { t: timeMax, trend: Math.round(slope * timeMax + intercept) },
          ];
        })()
      : [];

  const weightData = WEIGHT_DATA.filter((p) => p.t >= timeMin && p.t <= timeMax);

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Strength progression</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded bg-[#6ea8fe]/70" /> {unit}, dots = PRs
          </span>
          <button
            onClick={() => setShowTrend((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
              showTrend
                ? "text-[#f472b6] hover:bg-[#f472b6]/10"
                : "text-slate-600 hover:bg-slate-700/40 line-through"
            }`}
          >
            <span className="inline-block h-px w-5 border-t-2 border-dashed border-current" />
            Trend
          </button>
          <button
            onClick={() => setShowWeight((v) => !v)}
            className={`flex items-center gap-1.5 rounded-md px-2 py-1 transition-colors ${
              showWeight
                ? "text-[#34d399] hover:bg-[#34d399]/10"
                : "text-slate-600 hover:bg-slate-700/40 line-through"
            }`}
          >
            <span className="inline-block h-px w-5 border-t-2 border-dashed border-current" />
            Body weight
          </button>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart margin={{ top: 10, right: 44, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6ea8fe" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#6ea8fe" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1b212c" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[timeMin, timeMax]}
            scale="time"
            tickFormatter={(t) =>
              new Date(t).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
            }
            stroke="#475569"
            fontSize={11}
            minTickGap={40}
          />
          {/* Left axis: strength */}
          <YAxis
            yAxisId="strength"
            stroke="#475569"
            fontSize={11}
            domain={["auto", "auto"]}
            width={44}
          />
          {/* Right axis: body weight — always rendered to keep layout stable */}
          <YAxis
            yAxisId="weight"
            orientation="right"
            stroke={showWeight ? "#34d399" : "transparent"}
            fontSize={11}
            domain={[135, 175]}
            width={44}
            tickFormatter={(v) => (showWeight ? `${v}` : "")}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1218",
              border: "1px solid #272f3d",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(t) => new Date(t as number).toLocaleDateString()}
            formatter={(v: number, name: string) => {
              if (name === "bodyWeight") return [`${v} lb`, "Body weight"];
              if (name === "trend") return [`${v} lb`, "Trend"];
              if (name === "value") return [`${v} lb`, unit];
              return [`${v} lb`, name];
            }}
          />
          {/* Strength area */}
          <Area
            yAxisId="strength"
            data={strengthData}
            type="monotone"
            dataKey="value"
            stroke="#6ea8fe"
            strokeWidth={2}
            fill="url(#grad)"
            dot={false}
            isAnimationActive={false}
          />
          {/* Trend line (line of best fit) */}
          {showTrend && trendData.length === 2 && (
            <Line
              yAxisId="strength"
              data={trendData}
              type="linear"
              dataKey="trend"
              stroke="#f472b6"
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              isAnimationActive={false}
            />
          )}
          {/* PR dots */}
          <Scatter
            yAxisId="strength"
            data={strengthData}
            dataKey="pr"
            fill="#fbbf24"
            isAnimationActive={false}
          />
          {/* Body weight overlay */}
          {showWeight && (
            <Line
              yAxisId="weight"
              data={weightData}
              type="monotone"
              dataKey="bodyWeight"
              stroke="#34d399"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              isAnimationActive={false}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
