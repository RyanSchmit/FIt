import {
  GOALPOSTS,
  PROGRAM_WEEKS,
  weekKind,
  type WeekKind,
} from "../../lib/plan";

interface Props {
  week: number;
  currentWeek: number;
  startDate: string;
  onSelectWeek: (week: number) => void;
  onStartDateChange: (dateKey: string) => void;
}

const KIND_BADGE: Record<WeekKind, string> = {
  build: "Build",
  deload: "Deload",
  test: "Test / Peak",
};

const KIND_CLASS: Record<WeekKind, string> = {
  build: "bg-accent/20 text-accent",
  deload: "bg-amber-400/20 text-amber-300",
  test: "bg-emerald-400/20 text-emerald-300",
};

export default function ProgramHeader({
  week,
  currentWeek,
  startDate,
  onSelectWeek,
  onStartDateChange,
}: Props) {
  const kind = weekKind(week);

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-50">
              Week {week} of {PROGRAM_WEEKS}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${KIND_CLASS[kind]}`}
            >
              {KIND_BADGE[kind]}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Hybrid strength + running. Weights and run targets auto-progress each week.
          </p>
        </div>
        <label className="flex flex-col gap-1 text-xs text-slate-400">
          Program start date
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {Array.from({ length: PROGRAM_WEEKS }, (_, i) => i + 1).map((w) => (
          <button
            key={w}
            onClick={() => onSelectWeek(w)}
            className={`relative h-9 w-9 rounded-lg text-sm font-medium transition ${
              w === week
                ? "bg-accent text-ink-950"
                : "bg-ink-800 text-slate-300 hover:bg-ink-700"
            }`}
            title={w === currentWeek ? "Current week" : `Week ${w}`}
          >
            {w}
            {w === currentWeek && (
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400" />
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {GOALPOSTS.map((g) => (
          <div
            key={g.label}
            className="rounded-xl bg-ink-850 px-3 py-2 text-xs"
          >
            <span className="font-semibold text-slate-300">{g.label}: </span>
            <span className="text-slate-500">{g.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
