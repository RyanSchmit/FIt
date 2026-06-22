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
    <div className="rounded-sm border border-cream/10 bg-ink-850 px-4 py-3">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-brass">
        {label}
      </div>
      <div className="mt-1 font-mono text-2xl font-bold text-cream">{value}</div>
      {sub && <div className="text-xs text-steel">{sub}</div>}
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
