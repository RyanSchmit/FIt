import { useState } from "react";
import { localDateKey } from "../../lib/nutrition";
import { fmtRunTime } from "../../lib/ptPlan";
import type { RunLogStore } from "../../hooks/useRunLog";

interface Props {
  store: RunLogStore;
}

export default function RunLog({ store }: Props) {
  const [value, setValue] = useState("");
  const [date, setDate] = useState(() => localDateKey());

  function add() {
    const minutes = parseFloat(value);
    if (!Number.isFinite(minutes) || minutes <= 0) return;
    store.addEntry(minutes, date || localDateKey());
    setValue("");
  }

  const sorted = [...store.entries].sort((a, b) =>
    b.dateKey.localeCompare(a.dateKey),
  );

  return (
    <div className="rounded border border-cream/10 bg-ink-850 p-6">
      <div className="mb-4 grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <div>
          <label
            htmlFor="runValue"
            className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light"
          >
            Time (min.sec)
          </label>
          <input
            id="runValue"
            type="text"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. 12.30"
            className="w-full rounded-sm border border-cream/[0.18] bg-ink-950 px-2.5 py-2.5 font-mono text-sm text-cream outline-none focus:outline focus:outline-2 focus:outline-brass"
          />
        </div>
        <div>
          <label
            htmlFor="runDate"
            className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light"
          >
            Date
          </label>
          <input
            id="runDate"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-sm border border-cream/[0.18] bg-ink-950 px-2.5 py-2.5 font-mono text-sm text-cream outline-none focus:outline focus:outline-2 focus:outline-brass"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={add}
            className="rounded-sm bg-brass px-6 py-2.5 font-display text-[13px] uppercase tracking-[0.08em] text-ink-950 transition hover:bg-accent-strong"
          >
            Log Run
          </button>
        </div>
      </div>

      <table className="mt-5 w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border-b border-cream/15 px-2.5 py-2 text-left font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel">
              Date
            </th>
            <th className="border-b border-cream/15 px-2.5 py-2 text-left font-mono text-[10.5px] uppercase tracking-[0.06em] text-steel">
              1.5 Mile Time
            </th>
            <th className="border-b border-cream/15 px-2.5 py-2" />
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td
                colSpan={3}
                className="px-2.5 py-6 text-center font-mono text-steel"
              >
                No runs logged yet. Add your first 1.5-mile time above.
              </td>
            </tr>
          ) : (
            sorted.map((e) => (
              <tr key={e.id} className="hover:bg-cream/[0.03]">
                <td className="border-b border-cream/[0.06] px-2.5 py-2.5 font-mono text-cream">
                  {e.dateKey}
                </td>
                <td className="border-b border-cream/[0.06] px-2.5 py-2.5 font-mono text-cream">
                  {fmtRunTime(e.minutes)}
                </td>
                <td className="border-b border-cream/[0.06] px-2.5 py-2.5 text-right">
                  <button
                    onClick={() => store.removeEntry(e.id)}
                    className="rounded-sm border border-red/40 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.05em] text-red hover:bg-red/15"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
