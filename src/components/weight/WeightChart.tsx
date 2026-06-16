import { useState } from "react";
import {
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { linregress } from "../../lib/analysis";
import type { WeightEntry } from "../../hooks/useWeight";

interface Props {
  entries: WeightEntry[];
}

export default function WeightChart({ entries }: Props) {
  const [showTrend, setShowTrend] = useState(true);

  const data = entries.map((e) => ({ t: e.recordedAt, weight: e.weightLb }));
  const timeMin = data[0]?.t ?? 0;
  const timeMax = data[data.length - 1]?.t ?? Date.now();

  const { slope, intercept } = linregress(
    data.map((d) => d.t),
    data.map((d) => d.weight),
  );
  const trendData =
    data.length >= 2
      ? [
          { t: timeMin, trend: slope * timeMin + intercept },
          { t: timeMax, trend: slope * timeMax + intercept },
        ]
      : [];

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Weight over time</h2>
        <p className="py-12 text-center text-sm text-slate-500">
          Log your first weight to see the graph.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-200">Weight over time</h2>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded bg-[#6ea8fe]/70" /> Body weight (lb)
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
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart margin={{ top: 10, right: 12, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
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
          <YAxis
            stroke="#475569"
            fontSize={11}
            domain={["auto", "auto"]}
            width={44}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#0f1218",
              border: "1px solid #272f3d",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(t) => new Date(t as number).toLocaleString()}
            formatter={(v: number, name: string) => {
              if (name === "trend") return [`${v.toFixed(1)} lb`, "Trend"];
              return [`${v} lb`, "Body weight"];
            }}
          />
          <Line
            data={data}
            type="monotone"
            dataKey="weight"
            stroke="#6ea8fe"
            strokeWidth={2}
            dot={{ r: 2, fill: "#6ea8fe" }}
            isAnimationActive={false}
          />
          {showTrend && trendData.length === 2 && (
            <Line
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
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
