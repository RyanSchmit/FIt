import type { FactorResult } from "../lib/types";

interface Props {
  results: FactorResult[];
  selectedKey: string;
  onSelect: (key: string) => void;
}

function barColor(r: number): string {
  const a = Math.abs(r);
  if (a < 0.1) return "#475569";
  return r >= 0 ? "#34d399" : "#f87171";
}

export default function FactorRanking({ results, selectedKey, onSelect }: Props) {
  const max = Math.max(0.001, ...results.map((r) => Math.abs(r.r)));

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <h2 className="mb-1 text-sm font-semibold text-slate-200">
        What correlates with your gains
      </h2>
      <p className="mb-4 text-xs text-slate-500">
        Correlation (r) between each lead-up factor and how much your lift improved next.
        Green = helps, red = hurts. Click to inspect.
      </p>
      <div className="flex flex-col gap-2.5">
        {results.map((res) => {
          const pct = (Math.abs(res.r) / max) * 100;
          const active = res.def.key === selectedKey;
          return (
            <button
              key={res.def.key}
              onClick={() => onSelect(res.def.key)}
              className={`group flex items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${
                active ? "bg-ink-800" : "hover:bg-ink-850"
              }`}
            >
              <div className="w-28 shrink-0 text-sm text-slate-300">{res.def.label}</div>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-ink-850">
                <div
                  className="h-full rounded transition-all"
                  style={{ width: `${pct}%`, background: barColor(res.r) }}
                />
              </div>
              <div className="w-12 shrink-0 text-right font-mono text-sm text-slate-200">
                {res.r >= 0 ? "+" : ""}
                {res.r.toFixed(2)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
