import { currentSplit, isRaceWeek, type SplitDay } from "../../lib/ptPlan";

function dayClasses(day: SplitDay): string {
  if (day.name === "Rest") return "opacity-55";
  if (day.name.startsWith("Race")) return "border-red bg-ink-950";
  return "";
}

export default function WeeklySplit() {
  const raceWeek = isRaceWeek();
  const split = currentSplit();

  return (
    <>
      {raceWeek ? (
        <div className="mb-3.5 rounded border border-red/35 bg-red/10 px-3.5 py-2.5 font-mono text-xs tracking-[0.03em] text-red">
          RACE WEEK — Monday's Summer Series run replaces interval day. Squat day
          shifted to Wednesday for recovery.
        </div>
      ) : (
        <div className="mb-3.5 rounded border border-cream/12 bg-cream/[0.04] px-3.5 py-2.5 font-mono text-xs tracking-[0.03em] text-steel-light">
          NO RACE THIS WEEK — standard 6-day rotation, interval session on day 2.
        </div>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-2.5">
        {split.map((s) => (
          <div
            key={s.d}
            className={`rounded border border-cream/10 bg-ink-850 px-3 py-3.5 ${dayClasses(s)}`}
          >
            <div
              className={`font-mono text-[11px] tracking-[0.08em] ${s.name.startsWith("Race") ? "text-red" : "text-brass"}`}
            >
              {s.d}
            </div>
            <div className="mb-2 mt-1.5 font-display text-base uppercase">
              {s.name}
            </div>
            <div className="text-[12.5px] leading-relaxed text-steel-light">
              {s.detail}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
