import { PHASES } from "../../lib/ptPlan";

export default function PhasePlan() {
  return (
    <div className="flex flex-col">
      {PHASES.map((p) => (
        <div
          key={p.weeks}
          className="grid grid-cols-[110px_1fr] gap-5 border-b border-cream/[0.08] py-[18px] last:border-b-0"
        >
          <div className="font-mono text-[13px] tracking-[0.04em] text-brass">
            {p.weeks}
          </div>
          <div>
            <div className="mb-1.5 font-display text-lg uppercase">{p.name}</div>
            <div className="text-[13.5px] text-steel-light">{p.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
