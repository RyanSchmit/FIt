import { useEffect, useState } from "react";
import NutritionDashboard from "./components/nutrition/NutritionDashboard";
import PlanDashboard from "./components/plan/PlanDashboard";
import StrengthDashboard from "./components/StrengthDashboard";
import WeightDashboard from "./components/weight/WeightDashboard";
import { exercisesByFrequency, parseStrongCsv } from "./lib/parse";
import type { WorkoutSet } from "./lib/types";

const DEFAULT_CSV = "/strong_workouts.csv";

type Tab = "strength" | "nutrition" | "weight" | "plan";

type IconProps = { className?: string };

const Icons: Record<Tab, (props: IconProps) => JSX.Element> = {
  strength: ({ className }) => (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6.5 6.5 11 11" />
      <path d="m21 21-1-1" />
      <path d="m3 3 1 1" />
      <path d="m18 22 4-4" />
      <path d="m2 6 4-4" />
      <path d="m3 10 7-7" />
      <path d="m14 21 7-7" />
    </svg>
  ),
  nutrition: ({ className }) => (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
      <path d="M7 2v20" />
      <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" />
    </svg>
  ),
  weight: ({ className }) => (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="5" r="3" />
      <path d="M6.5 8h11l1.5 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1Z" />
    </svg>
  ),
  plan: ({ className }) => (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="m9 16 2 2 4-4" />
    </svg>
  ),
};

const TABS: { key: Tab; label: string; blurb: string }[] = [
  {
    key: "strength",
    label: "Strength",
    blurb:
      "See how your strength changes over time from your own lifting history.",
  },
  {
    key: "nutrition",
    label: "Nutrition",
    blurb:
      "Enter your daily calories and protein (logged in MyFitnessPal) against a personalized bulking target, and see how your intake tracks against weight and strength gains.",
  },
  {
    key: "weight",
    label: "Weight",
    blurb:
      "Log your body weight with the exact time of each measurement and watch the trend over time.",
  },
  {
    key: "plan",
    label: "Plan",
    blurb:
      "Follow your 8-week hybrid strength + running program. Weights and run targets auto-progress each week - tap to log your actual top sets and runs.",
  },
];

export default function App() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [sourceName, setSourceName] = useState("strong_workouts.csv");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("strength");

  function ingest(csv: string, name: string) {
    try {
      const parsed = parseStrongCsv(csv);
      if (parsed.length === 0) {
        setError("No valid workout rows found in that file.");
        return;
      }
      // Touch the frequency index so a malformed file surfaces early.
      exercisesByFrequency(parsed);
      setSets(parsed);
      setSourceName(name);
      setError(null);
    } catch (e) {
      setError(`Could not parse file: ${(e as Error).message}`);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch(DEFAULT_CSV)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        if (cancelled) return;
        ingest(text, "strong_workouts.csv");
      })
      .catch((e) => {
        if (!cancelled) setError(`Could not load bundled CSV: ${e.message}`);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = TABS.find((t) => t.key === tab)!;

  return (
    <div className="min-h-full">
      <nav className="sticky top-0 z-30 border-b border-ink-700 bg-ink-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-ink-950">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m6.5 6.5 11 11" />
                <path d="m21 21-1-1" />
                <path d="m3 3 1 1" />
                <path d="m18 22 4-4" />
                <path d="m2 6 4-4" />
                <path d="m3 10 7-7" />
                <path d="m14 21 7-7" />
              </svg>
            </span>
            <span className="text-base font-bold tracking-tight text-slate-50">
              Lift &amp; Bulk
            </span>
          </div>

          <div className="ml-2 flex items-center gap-1 overflow-x-auto">
            {TABS.map((t) => {
              const Icon = Icons[t.key];
              const isActive = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-accent text-ink-950"
                      : "text-slate-300 hover:bg-ink-800"
                  }`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                  <span className="hidden sm:inline">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <header className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-50">
            {active.label}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            {active.blurb}
          </p>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {tab === "weight" ? (
          <WeightDashboard />
        ) : tab === "strength" ? (
          loading ? (
            <div className="py-24 text-center text-slate-500">
              Loading your data...
            </div>
          ) : (
            <StrengthDashboard
              sets={sets}
              onCsv={ingest}
              sourceName={sourceName}
            />
          )
        ) : loading ? (
          <div className="py-24 text-center text-slate-500">
            Loading your data...
          </div>
        ) : sets.length === 0 ? (
          <div className="py-24 text-center text-slate-500">
            Import your Strong workout history on the Strength tab to use this
            page.
          </div>
        ) : tab === "plan" ? (
          <PlanDashboard sets={sets} />
        ) : (
          <NutritionDashboard sets={sets} />
        )}
      </div>
    </div>
  );
}
