import { useState } from "react";
import { DEFAULT_WEIGHT_NOTE, useWeight } from "../../hooks/useWeight";
import WeightChart from "./WeightChart";

/** Format a Date as the value a datetime-local input expects: "YYYY-MM-DDTHH:mm". */
function toLocalInputValue(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export default function WeightDashboard() {
  const { entries, addEntry, updateEntry, removeEntry } = useWeight();
  const [weight, setWeight] = useState("");
  const [when, setWhen] = useState(() => toLocalInputValue(new Date()));
  const [note, setNote] = useState(DEFAULT_WEIGHT_NOTE);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState("");
  const [editWhen, setEditWhen] = useState("");
  const [editNote, setEditNote] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const lb = parseFloat(weight);
    if (!Number.isFinite(lb) || lb <= 0) {
      setErrorMsg("Enter a valid weight.");
      return;
    }
    const ts = when ? new Date(when).getTime() : Date.now();
    if (!Number.isFinite(ts)) {
      setErrorMsg("Enter a valid date and time.");
      return;
    }
    const trimmed = note.trim();
    addEntry(lb, ts, trimmed || undefined);
    setWeight("");
    setWhen(toLocalInputValue(new Date()));
    setNote(DEFAULT_WEIGHT_NOTE);
    setErrorMsg(null);
  }

  function startEdit(
    id: string,
    weightLb: number,
    recordedAt: number,
    entryNote?: string,
  ) {
    setEditingId(id);
    setEditWeight(String(weightLb));
    setEditWhen(toLocalInputValue(new Date(recordedAt)));
    setEditNote(entryNote ?? "");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const lb = parseFloat(editWeight);
    if (!Number.isFinite(lb) || lb <= 0) {
      setEditError("Enter a valid weight.");
      return;
    }
    const ts = editWhen ? new Date(editWhen).getTime() : NaN;
    if (!Number.isFinite(ts)) {
      setEditError("Enter a valid date and time.");
      return;
    }
    const trimmed = editNote.trim();
    updateEntry(editingId, lb, ts, trimmed || undefined);
    setEditingId(null);
    setEditError(null);
  }

  const first = entries[0] ?? null;
  const latest = entries[entries.length - 1] ?? null;
  const prev = entries.length >= 2 ? entries[entries.length - 2] : null;
  const sinceStart = first && latest ? latest.weightLb - first.weightLb : 0;
  const sincePrev = prev && latest ? latest.weightLb - prev.weightLb : 0;

  const fmtDelta = (d: number) =>
    `${d > 0 ? "+" : d < 0 ? "" : ""}${d.toFixed(1)} lb`;
  const deltaColor = (d: number) =>
    d > 0 ? "text-[#3f8557]" : d < 0 ? "text-[#c41e3a]" : "text-steel-light";

  const recent = [...entries].reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-[0.14em] text-brass">
          Log Weight
        </h2>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">Weight (lb)</span>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="161"
              className="w-32 rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">Date &amp; time</span>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
              Note <span className="text-steel">(optional)</span>
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. morning, post-workout"
              className="w-full min-w-[10rem] rounded-sm border border-cream/[0.18] bg-ink-850 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
            />
          </label>
          <button
            type="submit"
            className="rounded-sm bg-brass px-4 py-2 font-display text-sm uppercase tracking-[0.04em] text-ink-950 hover:bg-accent-strong"
          >
            Add
          </button>
        </form>
        {errorMsg && <p className="mt-2 text-xs text-red">{errorMsg}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-sm border border-cream/10 bg-ink-850 px-3 py-2">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-brass">Latest</div>
            <div className="font-mono text-lg font-bold text-cream">
              {latest ? `${latest.weightLb} lb` : "--"}
            </div>
          </div>
          <div className="rounded-sm border border-cream/10 bg-ink-850 px-3 py-2">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-brass">Since last</div>
            <div className={`font-mono text-lg font-bold ${deltaColor(sincePrev)}`}>
              {prev ? fmtDelta(sincePrev) : "--"}
            </div>
          </div>
          <div className="rounded-sm border border-cream/10 bg-ink-850 px-3 py-2">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-brass">Since start</div>
            <div className={`font-mono text-lg font-bold ${deltaColor(sinceStart)}`}>
              {first ? fmtDelta(sinceStart) : "--"}
            </div>
          </div>
          <div className="rounded-sm border border-cream/10 bg-ink-850 px-3 py-2">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-brass">Entries</div>
            <div className="font-mono text-lg font-bold text-cream">{entries.length}</div>
          </div>
        </div>
      </div>

      <WeightChart entries={entries} />

      <div className="rounded-sm border border-cream/10 bg-ink-900 p-5">
        <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.14em] text-brass">
          Recent Entries
        </h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-steel">No entries yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.slice(0, 30).map((e) =>
              editingId === e.id ? (
                <li
                  key={e.id}
                  className="rounded-sm border border-brass/60 bg-ink-850 px-3 py-3"
                >
                  <form
                    onSubmit={handleSaveEdit}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
                        Weight (lb)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        value={editWeight}
                        onChange={(ev) => setEditWeight(ev.target.value)}
                        className="w-28 rounded-sm border border-cream/[0.18] bg-ink-900 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
                        Date &amp; time
                      </span>
                      <input
                        type="datetime-local"
                        value={editWhen}
                        onChange={(ev) => setEditWhen(ev.target.value)}
                        className="rounded-sm border border-cream/[0.18] bg-ink-900 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
                      />
                    </label>
                    <label className="flex flex-1 flex-col gap-1">
                      <span className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-steel-light">
                        Note <span className="text-steel">(optional)</span>
                      </span>
                      <input
                        type="text"
                        value={editNote}
                        onChange={(ev) => setEditNote(ev.target.value)}
                        placeholder="e.g. morning, post-workout"
                        className="w-full min-w-[10rem] rounded-sm border border-cream/[0.18] bg-ink-900 px-3 py-2 text-sm text-cream outline-none focus:border-brass"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-sm bg-brass px-3 py-2 font-display text-sm uppercase tracking-[0.04em] text-ink-950 hover:bg-accent-strong"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-sm border border-cream/[0.18] px-3 py-2 text-sm font-medium text-steel-light hover:bg-ink-800"
                    >
                      Cancel
                    </button>
                    {editError && (
                      <p className="w-full text-xs text-red">{editError}</p>
                    )}
                  </form>
                </li>
              ) : (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-sm border border-cream/10 bg-ink-850 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div>
                      <span className="font-mono text-sm font-semibold text-cream">
                        {e.weightLb} lb
                      </span>
                      <span className="ml-3 font-mono text-xs text-steel">
                        {new Date(e.recordedAt).toLocaleString()}
                      </span>
                    </div>
                    {e.note && (
                      <p className="mt-0.5 truncate text-xs italic text-steel-light">
                        {e.note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() =>
                        startEdit(e.id, e.weightLb, e.recordedAt, e.note)
                      }
                      className="rounded-sm px-2 py-1 text-xs text-steel transition-colors hover:bg-brass/10 hover:text-brass"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeEntry(e.id)}
                      className="rounded-sm px-2 py-1 text-xs text-steel transition-colors hover:bg-red/10 hover:text-red"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ),
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
