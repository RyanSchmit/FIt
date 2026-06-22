import type { Status } from "../../lib/ptPlan";

interface Props {
  title: string;
  current: string;
  target: string;
  unit: string;
  /** Progress 0-1. */
  frac: number;
  status: Status;
}

const BAR_COLOR: Record<Status["cls"], string> = {
  ontrack: "#2d5f3e",
  behind: "#c41e3a",
  start: "#6b7280",
};

const STATUS_COLOR: Record<Status["cls"], string> = {
  ontrack: "text-[#3f8557]",
  behind: "text-red",
  start: "text-steel",
};

export default function QualCard({
  title,
  current,
  target,
  unit,
  frac,
  status,
}: Props) {
  const qualified = frac >= 1;
  return (
    <div className="relative overflow-hidden rounded-sm bg-cream text-ink-950 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between bg-ink-950 px-4 py-3 text-cream">
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-brass">
          Qual Standard
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-brass">
          {Math.round(frac * 100)}%
        </span>
      </div>

      <div className="px-4 pb-4 pt-5">
        <div className="mb-3.5 font-display text-xl uppercase tracking-[0.02em]">
          {title}
        </div>
        <div className="mb-1 flex items-baseline gap-2.5">
          <span className="font-mono text-[34px] font-bold leading-none">
            {current}
          </span>
          <span className="text-base text-steel">&#8594;</span>
          <span className="font-mono text-lg text-steel">{target}</span>
        </div>
        <div className="mb-3.5 text-xs text-steel">{unit}</div>

        <div className="mb-2 h-2 overflow-hidden rounded bg-cream-dim">
          <div
            className="h-full rounded transition-[width] duration-300"
            style={{ width: `${frac * 100}%`, background: BAR_COLOR[status.cls] }}
          />
        </div>
        <div
          className={`font-mono text-[11px] font-semibold uppercase tracking-[0.06em] ${STATUS_COLOR[status.cls]}`}
        >
          {status.text}
        </div>
      </div>

      {qualified && (
        <div className="absolute right-3.5 top-3.5 flex h-14 w-14 -rotate-12 items-center justify-center rounded-full border-[3px] border-red opacity-85">
          <span className="text-center font-display text-[10px] uppercase leading-[1.1] text-red">
            Quali&shy;fied
          </span>
        </div>
      )}
    </div>
  );
}
