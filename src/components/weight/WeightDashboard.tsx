import { useState } from "react";
import { useWeight } from "../../hooks/useWeight";
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
  const [note, setNote] = useState("");
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
    setNote("");
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
    d > 0 ? "text-[#34d399]" : d < 0 ? "text-[#f472b6]" : "text-slate-400";

  const recent = [...entries].reverse();

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-200">Log weight</h2>
        <form onSubmit={handleAdd} className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">Weight (lb)</span>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="161"
              className="w-32 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">Date &amp; time</span>
            <input
              type="datetime-local"
              value={when}
              onChange={(e) => setWhen(e.target.value)}
              className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1">
            <span className="text-xs font-medium text-slate-400">
              Note <span className="text-slate-600">(optional)</span>
            </span>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. morning, post-workout"
              className="w-full min-w-[10rem] rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-accent-strong"
          >
            Add
          </button>
        </form>
        {errorMsg && <p className="mt-2 text-xs text-red-400">{errorMsg}</p>}

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2">
            <div className="text-xs text-slate-500">Latest</div>
            <div className="text-lg font-semibold text-slate-100">
              {latest ? `${latest.weightLb} lb` : "--"}
            </div>
          </div>
          <div className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2">
            <div className="text-xs text-slate-500">Since last</div>
            <div className={`text-lg font-semibold ${deltaColor(sincePrev)}`}>
              {prev ? fmtDelta(sincePrev) : "--"}
            </div>
          </div>
          <div className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2">
            <div className="text-xs text-slate-500">Since start</div>
            <div className={`text-lg font-semibold ${deltaColor(sinceStart)}`}>
              {first ? fmtDelta(sinceStart) : "--"}
            </div>
          </div>
          <div className="rounded-xl border border-ink-700 bg-ink-850 px-3 py-2">
            <div className="text-xs text-slate-500">Entries</div>
            <div className="text-lg font-semibold text-slate-100">{entries.length}</div>
          </div>
        </div>
      </div>

      <WeightChart entries={entries} />

      <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-200">Recent entries</h2>
        {recent.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No entries yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {recent.slice(0, 30).map((e) =>
              editingId === e.id ? (
                <li
                  key={e.id}
                  className="rounded-xl border border-accent/60 bg-ink-850 px-3 py-3"
                >
                  <form
                    onSubmit={handleSaveEdit}
                    className="flex flex-wrap items-end gap-3"
                  >
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-400">
                        Weight (lb)
                      </span>
                      <input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        value={editWeight}
                        onChange={(ev) => setEditWeight(ev.target.value)}
                        className="w-28 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-slate-400">
                        Date &amp; time
                      </span>
                      <input
                        type="datetime-local"
                        value={editWhen}
                        onChange={(ev) => setEditWhen(ev.target.value)}
                        className="rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
                      />
                    </label>
                    <label className="flex flex-1 flex-col gap-1">
                      <span className="text-xs font-medium text-slate-400">
                        Note <span className="text-slate-600">(optional)</span>
                      </span>
                      <input
                        type="text"
                        value={editNote}
                        onChange={(ev) => setEditNote(ev.target.value)}
                        placeholder="e.g. morning, post-workout"
                        className="w-full min-w-[10rem] rounded-lg border border-ink-700 bg-ink-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent"
                      />
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-ink-950 hover:bg-accent-strong"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg border border-ink-700 px-3 py-2 text-sm font-medium text-slate-300 hover:bg-ink-800"
                    >
                      Cancel
                    </button>
                    {editError && (
                      <p className="w-full text-xs text-red-400">{editError}</p>
                    )}
                  </form>
                </li>
              ) : (
                <li
                  key={e.id}
                  className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-850 px-3 py-2"
                >
                  <div className="min-w-0">
                    <div>
                      <span className="text-sm font-semibold text-slate-100">
                        {e.weightLb} lb
                      </span>
                      <span className="ml-3 text-xs text-slate-500">
                        {new Date(e.recordedAt).toLocaleString()}
                      </span>
                    </div>
                    {e.note && (
                      <p className="mt-0.5 truncate text-xs italic text-slate-400">
                        {e.note}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() =>
                        startEdit(e.id, e.weightLb, e.recordedAt, e.note)
                      }
                      className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-accent/10 hover:text-accent"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => removeEntry(e.id)}
                      className="rounded-md px-2 py-1 text-xs text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
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
