import {
  CartesianGrid,
  Line,
  ComposedChart,
  ResponsiveContainer,
  Scatter,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import type { FactorResult } from "../lib/types";

interface Props {
  result: FactorResult;
}

export default function ScatterCard({ result }: Props) {
  const { def, points, slope, intercept, r, n } = result;

  const xs = points.map((p) => p.x);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const line = [
    { x: minX, yLine: slope * minX + intercept },
    { x: maxX, yLine: slope * maxX + intercept },
  ];
  const data = [...points.map((p) => ({ ...p, yLine: null as number | null })), ...line];

  const trendUp = slope >= 0;

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-200">
          {def.label} <span className="text-slate-500">vs next improvement</span>
        </h3>
        <span className="font-mono text-xs text-slate-400">
          r = {r.toFixed(2)} - n = {n}
        </span>
      </div>
      <p className="mb-3 text-xs text-slate-500">{def.description}</p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 6, right: 10, bottom: 14, left: -10 }}>
          <CartesianGrid stroke="#1b212c" />
          <XAxis
            type="number"
            dataKey="x"
            name={def.label}
            stroke="#475569"
            fontSize={11}
            domain={["dataMin", "dataMax"]}
            label={{
              value: `${def.label} (${def.unit})`,
              position: "insideBottom",
              offset: -8,
              fill: "#64748b",
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Improvement"
            stroke="#475569"
            fontSize={11}
            width={42}
          />
          <ZAxis range={[40, 40]} />
          <Tooltip
            cursor={{ stroke: "#272f3d" }}
            contentStyle={{
              background: "#0f1218",
              border: "1px solid #272f3d",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value: number, key: string) =>
              key === "y"
                ? [`${value.toFixed(1)} lb`, "Improvement"]
                : [value.toFixed(1), def.label]
            }
            labelFormatter={() => ""}
          />
          <Scatter dataKey="y" fill="#6ea8fe" isAnimationActive={false} />
          <Line
            dataKey="yLine"
            stroke={trendUp ? "#34d399" : "#f87171"}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
