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
      <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-brass">
          Weight Over Time
        </h2>
        <p className="py-12 text-center text-sm text-steel">
          Log your first weight to see the graph.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-mono text-xs uppercase tracking-[0.14em] text-brass">
          Weight Over Time
        </h2>
        <div className="flex items-center gap-4 text-xs text-steel">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-5 rounded bg-brass/70" /> Body weight (lb)
          </span>
          <button
            onClick={() => setShowTrend((v) => !v)}
            className={`flex items-center gap-1.5 rounded-sm px-2 py-1 transition-colors ${
              showTrend
                ? "text-[#c41e3a] hover:bg-[#c41e3a]/10"
                : "text-steel hover:bg-ink-800 line-through"
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
              <stop offset="0%" stopColor="#8a7456" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#8a7456" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(245,240,232,0.08)" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={[timeMin, timeMax]}
            scale="time"
            tickFormatter={(t) =>
              new Date(t).toLocaleDateString(undefined, { month: "short", year: "2-digit" })
            }
            stroke="#9ca3af"
            fontSize={11}
            minTickGap={40}
          />
          <YAxis
            stroke="#9ca3af"
            fontSize={11}
            domain={["auto", "auto"]}
            width={44}
            tickFormatter={(v) => `${v}`}
          />
          <Tooltip
            contentStyle={{
              background: "#252b3d",
              border: "1px solid #3a4258",
              borderRadius: 2,
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
            stroke="#8a7456"
            strokeWidth={2}
            dot={{ r: 2, fill: "#8a7456" }}
            isAnimationActive={false}
          />
          {showTrend && trendData.length === 2 && (
            <Line
              data={trendData}
              type="linear"
              dataKey="trend"
              stroke="#c41e3a"
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
