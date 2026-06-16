import type { Insight } from "../lib/analysis";

interface Props {
  insights: Insight[];
}

const STRENGTH_BADGE: Record<Insight["strength"], string> = {
  strong: "bg-emerald-500/15 text-emerald-300",
  moderate: "bg-sky-500/15 text-sky-300",
  weak: "bg-slate-500/15 text-slate-300",
  negligible: "bg-ink-700 text-slate-500",
};

export default function InsightsPanel({ insights }: Props) {
  const ranked = [...insights].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <h2 className="mb-1 text-sm font-semibold text-slate-200">Takeaways</h2>
      <p className="mb-4 text-xs text-slate-500">
        Ranked by strength of relationship. These are correlations from your own history, not
        proof of cause and effect.
      </p>
      <ol className="flex flex-col gap-3">
        {ranked.map((ins, i) => (
          <li
            key={ins.factorKey}
            className="flex gap-3 rounded-xl border border-ink-700 bg-ink-850 p-3"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-700 text-xs font-semibold text-slate-300">
              {i + 1}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-slate-100">{ins.headline}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STRENGTH_BADGE[ins.strength]}`}
                >
                  {ins.strength}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-slate-400">{ins.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
