import type { Insight } from "../lib/analysis";

interface Props {
  insights: Insight[];
}

const STRENGTH_BADGE: Record<Insight["strength"], string> = {
  strong: "bg-green/25 text-[#5fae77]",
  moderate: "bg-brass/20 text-brass",
  weak: "bg-steel/20 text-steel-light",
  negligible: "bg-ink-700 text-steel",
};

export default function InsightsPanel({ insights }: Props) {
  const ranked = [...insights].sort((a, b) => Math.abs(b.r) - Math.abs(a.r));

  return (
    <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
      <h2 className="mb-1 font-mono text-xs uppercase tracking-[0.14em] text-brass">
        Takeaways
      </h2>
      <p className="mb-4 text-xs text-steel">
        Ranked by strength of relationship. These are correlations from your own history, not
        proof of cause and effect.
      </p>
      <ol className="flex flex-col gap-3">
        {ranked.map((ins, i) => (
          <li
            key={ins.factorKey}
            className="flex gap-3 rounded-sm border border-cream/10 bg-ink-850 p-3"
          >
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-700 font-mono text-xs font-semibold text-brass">
              {i + 1}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-cream">{ins.headline}</span>
                <span
                  className={`rounded-sm px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${STRENGTH_BADGE[ins.strength]}`}
                >
                  {ins.strength}
                </span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-steel-light">{ins.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
