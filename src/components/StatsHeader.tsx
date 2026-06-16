import type { SummaryStats } from "../lib/analysis";

interface Props {
  stats: SummaryStats;
}

function fmtDate(d: Date | null): string {
  if (!d) return "-";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850 px-4 py-3">
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function StatsHeader({ stats }: Props) {
  const unit = stats.metric === "e1rm" ? "lb e1RM" : "lb";
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Stat
        label="Current"
        value={`${Math.round(stats.currentMetric)}`}
        sub={`${unit} - ${fmtDate(stats.lastDate)}`}
      />
      <Stat
        label="All-time best"
        value={`${Math.round(stats.bestMetric)}`}
        sub={`${unit} - ${fmtDate(stats.bestDate)}`}
      />
      <Stat label="Sessions" value={`${stats.totalSessions}`} sub={`${stats.totalSets} sets total`} />
      <Stat
        label="Tracked since"
        value={fmtDate(stats.firstDate)}
        sub={`through ${fmtDate(stats.lastDate)}`}
      />
    </div>
  );
}
