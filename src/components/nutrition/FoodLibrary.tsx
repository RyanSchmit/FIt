import { useState } from "react";
import type { FoodItem } from "../../lib/nutrition";

interface Props {
  foods: FoodItem[];
  onAdd: (food: Omit<FoodItem, "id">) => void;
  onUpdate: (id: string, patch: Partial<Omit<FoodItem, "id">>) => void;
  onRemove: (id: string) => void;
}

interface Draft {
  name: string;
  calories: string;
  protein: string;
  servingLabel: string;
}

const EMPTY: Draft = { name: "", calories: "", protein: "", servingLabel: "" };

export default function FoodLibrary({ foods, onAdd, onUpdate, onRemove }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);

  function commit(e: React.FormEvent) {
    e.preventDefault();
    const cal = Number(draft.calories);
    const prot = Number(draft.protein) || 0;
    if (!draft.name.trim() || !Number.isFinite(cal) || cal <= 0) return;

    const payload = {
      name: draft.name.trim(),
      calories: cal,
      protein: prot,
      servingLabel: draft.servingLabel.trim() || undefined,
    };

    if (editingId) onUpdate(editingId, payload);
    else onAdd(payload);

    setDraft(EMPTY);
    setEditingId(null);
  }

  function startEdit(food: FoodItem) {
    setEditingId(food.id);
    setDraft({
      name: food.name,
      calories: String(food.calories),
      protein: String(food.protein),
      servingLabel: food.servingLabel ?? "",
    });
    setOpen(true);
  }

  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-sm font-semibold text-slate-200">
          Food library{" "}
          <span className="font-normal text-slate-500">({foods.length})</span>
        </h2>
        <span className="text-xs text-slate-500">{open ? "Hide" : "Manage"}</span>
      </button>

      {open && (
        <div className="mt-4 flex flex-col gap-4">
          <form onSubmit={commit} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="Name"
                className="col-span-2 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
              />
              <input
                value={draft.calories}
                onChange={(e) => setDraft({ ...draft, calories: e.target.value })}
                inputMode="numeric"
                placeholder="kcal/serving"
                className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
              />
              <input
                value={draft.protein}
                onChange={(e) => setDraft({ ...draft, protein: e.target.value })}
                inputMode="numeric"
                placeholder="protein g"
                className="rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                value={draft.servingLabel}
                onChange={(e) =>
                  setDraft({ ...draft, servingLabel: e.target.value })
                }
                placeholder="Serving label (optional), e.g. 2 tbsp"
                className="flex-1 rounded-lg border border-ink-700 bg-ink-850 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-600 focus:border-accent"
              />
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(EMPTY);
                    setEditingId(null);
                  }}
                  className="rounded-lg px-3 py-2 text-sm text-slate-400 transition hover:bg-ink-800"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-accent-strong"
              >
                {editingId ? "Save" : "Add food"}
              </button>
            </div>
          </form>

          <ul className="flex flex-col gap-2">
            {foods.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-slate-100">
                    {f.name}
                    {f.servingLabel && (
                      <span className="text-slate-500"> - {f.servingLabel}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {f.calories} kcal - {f.protein}g protein
                  </div>
                </div>
                <button
                  onClick={() => startEdit(f)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-400 transition hover:bg-ink-700 hover:text-slate-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemove(f.id)}
                  className="shrink-0 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-red-500/10 hover:text-red-300"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
