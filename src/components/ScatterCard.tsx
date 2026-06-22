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
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <div className="mb-1 flex items-baseline justify-between">
        <h3 className="font-mono text-xs uppercase tracking-[0.1em] text-brass">
          {def.label} <span className="text-steel">vs next improvement</span>
        </h3>
        <span className="font-mono text-xs text-steel-light">
          r = {r.toFixed(2)} - n = {n}
        </span>
      </div>
      <p className="mb-3 text-xs text-steel">{def.description}</p>
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 6, right: 10, bottom: 14, left: -10 }}>
          <CartesianGrid stroke="rgba(245,240,232,0.08)" />
          <XAxis
            type="number"
            dataKey="x"
            name={def.label}
            stroke="#9ca3af"
            fontSize={11}
            domain={["dataMin", "dataMax"]}
            label={{
              value: `${def.label} (${def.unit})`,
              position: "insideBottom",
              offset: -8,
              fill: "#9ca3af",
              fontSize: 11,
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Improvement"
            stroke="#9ca3af"
            fontSize={11}
            width={42}
          />
          <ZAxis range={[40, 40]} />
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
                ? [`${value.toFixed(1)} lb`, "Improvement"]
                : [value.toFixed(1), def.label]
            }
            labelFormatter={() => ""}
          />
          <Scatter dataKey="y" fill="#8a7456" isAnimationActive={false} />
          <Line
            dataKey="yLine"
            stroke={trendUp ? "#3f8557" : "#c41e3a"}
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
