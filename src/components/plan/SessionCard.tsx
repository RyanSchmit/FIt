import { useMemo, useState } from "react";
import { localDateKey } from "../../lib/nutrition";
import {
  prescribedLift,
  runForWeek,
  type PlanDay,
} from "../../lib/plan";
import type { LiftLog, RunLog, SessionLog } from "../../hooks/usePlan";

interface Props {
  day: PlanDay;
  week: number;
  existing?: SessionLog;
  onSave: (session: Omit<SessionLog, "id"> & { id?: string }) => void;
  onClear: (id: string) => void;
}

const RUN_KIND_LABEL: Record<string, string> = {
  easy: "Easy run",
  long: "Long run",
  intervals: "Intervals",
  rest: "Rest",
};

export default function SessionCard({ day, week, existing, onSave, onClear }: Props) {
  const run = day.hasRun ? runForWeek(week, day.id) : null;
  const hasContent = day.lifts.length > 0 || (run && run.kind !== "rest");

  // Seed inputs from a prior log, otherwise from the prescription.
  const initialLifts = useMemo(() => {
    const map: Record<string, { weight: string; reps: string }> = {};
    for (const lift of day.lifts) {
      const p = prescribedLift(lift, week);
      const logged = existing?.lifts.find((l) => l.liftId === lift.id);
      map[lift.id] = {
        weight: logged ? String(logged.weight) : String(p.weight),
        reps: logged ? String(logged.reps) : String(p.reps),
      };
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day.id, week, existing?.id]);

  const [lifts, setLifts] = useState(initialLifts);
  const [runDist, setRunDist] = useState(
    existing?.run ? String(existing.run.distanceMi) : run?.distanceMi ? String(run.distanceMi) : "",
  );
  const [runMin, setRunMin] = useState(existing?.run ? String(existing.run.minutes) : "");

  const done = existing?.done ?? false;

  function setLift(id: string, field: "weight" | "reps", value: string) {
    setLifts((s) => ({ ...s, [id]: { ...s[id], [field]: value } }));
  }

  function save() {
    const liftLogs: LiftLog[] = day.lifts
      .map((lift) => ({
        liftId: lift.id,
        weight: Number(lifts[lift.id]?.weight) || 0,
        reps: Number(lifts[lift.id]?.reps) || 0,
      }))
      .filter((l) => l.weight > 0 || l.reps > 0);

    let runLog: RunLog | undefined;
    if (run && run.kind !== "rest") {
      const distanceMi = Number(runDist) || 0;
      const minutes = Number(runMin) || 0;
      if (distanceMi > 0 || minutes > 0) runLog = { distanceMi, minutes };
    }

    onSave({
      id: existing?.id,
      dateKey: existing?.dateKey ?? localDateKey(),
      week,
      dayId: day.id,
      lifts: liftLogs,
      run: runLog,
      done: true,
    });
  }

  const isRest = !hasContent;

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        done
          ? "border-accent/40 bg-accent/5"
          : "border-ink-700 bg-ink-900/70"
      }`}
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {day.dayLabel}
            </span>
            {done && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-semibold text-accent">
                Done
              </span>
            )}
          </div>
          <h3 className="mt-0.5 text-sm font-semibold text-slate-100">{day.title}</h3>
        </div>
      </div>

      {isRest ? (
        <p className="text-xs text-slate-500">
          {day.accessories[0]?.name ?? "Rest day."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {day.lifts.map((lift) => {
            const p = prescribedLift(lift, week);
            return (
              <div key={lift.id} className="rounded-xl bg-ink-850 p-3">
                <div className="mb-2 flex items-baseline justify-between">
                  <span className="text-sm font-medium text-slate-200">{lift.name}</span>
                  <span className="text-xs text-slate-400">
                    top set {p.reps} @ <span className="text-accent">{p.weight}</span>
                    {p.backoffSets > 0 && (
                      <>
                        {" "}
                        · {p.backoffSets}x{p.backoffReps} @ {p.backoffWeight}
                      </>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex flex-1 flex-col gap-1 text-[11px] text-slate-500">
                    Actual weight
                    <input
                      value={lifts[lift.id]?.weight ?? ""}
                      onChange={(e) => setLift(lift.id, "weight", e.target.value)}
                      inputMode="numeric"
                      className="rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1 text-[11px] text-slate-500">
                    Actual reps
                    <input
                      value={lifts[lift.id]?.reps ?? ""}
                      onChange={(e) => setLift(lift.id, "reps", e.target.value)}
                      inputMode="numeric"
                      className="rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent"
                    />
                  </label>
                </div>
              </div>
            );
          })}

          {run && run.kind !== "rest" && (
            <div className="rounded-xl bg-ink-850 p-3">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-sm font-medium text-slate-200">
                  {RUN_KIND_LABEL[run.kind]}
                </span>
                <span className="text-xs text-slate-400">
                  target <span className="text-accent">{run.distanceMi} mi</span>
                  {run.note ? ` · ${run.note}` : ""}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <label className="flex flex-1 flex-col gap-1 text-[11px] text-slate-500">
                  Distance (mi)
                  <input
                    value={runDist}
                    onChange={(e) => setRunDist(e.target.value)}
                    inputMode="decimal"
                    className="rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1 text-[11px] text-slate-500">
                  Time (min)
                  <input
                    value={runMin}
                    onChange={(e) => setRunMin(e.target.value)}
                    inputMode="decimal"
                    className="rounded-lg border border-ink-700 bg-ink-900 px-2.5 py-1.5 text-sm text-slate-100 outline-none focus:border-accent"
                  />
                </label>
              </div>
            </div>
          )}

          {day.accessories.length > 0 && (
            <ul className="flex flex-col gap-1 text-xs text-slate-500">
              {day.accessories.map((a) => (
                <li key={a.name} className="flex justify-between gap-2">
                  <span>{a.name}</span>
                  <span className="text-slate-600">{a.scheme}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={save}
              className="rounded-lg bg-accent px-3 py-1.5 text-xs font-semibold text-ink-950 transition hover:bg-accent-strong"
            >
              {done ? "Update" : "Mark done"}
            </button>
            {existing && (
              <button
                onClick={() => onClear(existing.id)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:bg-ink-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
