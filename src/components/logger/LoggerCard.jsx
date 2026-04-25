/**
 * @module components/logger/LoggerCard
 * @description Per-exercise logging card used during an active workout session.
 * Allows the user to:
 * - Mark the exercise as completed, skipped, or substituted
 * - Log weight and reps for each set
 * - Add/remove sets dynamically
 * - Add freeform notes
 *
 * @param {Object} props
 * @param {Object} props.ex - Exercise entry with prescribed data and set rows
 * @param {Function} props.onChange - Callback receiving a partial patch object
 * @returns {JSX.Element}
 */
import Icon from '../Icon';
import IconBtn from '../IconBtn';

export default function LoggerCard({ ex, onChange }) {
  /**
   * Update the exercise status (completed / skipped / substituted).
   * Prompts for a substitution name when substituting.
   * @param {string} status - New status value
   */
  const setStatus = (status) =>
    onChange({
      status,
      substitution: status === "substituted"
        ? (prompt("Replace with…", ex.substitution) || "")
        : ex.substitution,
    });

  /**
   * Patch a single set row by index.
   * @param {number} i - Set index
   * @param {Object} patch - Fields to merge into the set row
   */
  const setRow = (i, patch) =>
    onChange({ sets: ex.sets.map((s, idx) => idx === i ? { ...s, ...patch } : s) });

  /** Add a new empty set row */
  const addRow = () =>
    onChange({ sets: [...ex.sets, { weight: "", reps: "", done: false }] });

  /**
   * Remove a set row by index.
   * @param {number} i - Index of the set to remove
   */
  const removeRow = (i) =>
    onChange({ sets: ex.sets.filter((_, idx) => idx !== i) });

  // Determine border colour based on exercise status
  const statusColor =
    ex.status === "completed" ? "border-gold/50 bg-gold/5"
    : ex.status === "skipped" ? "border-ember/40 bg-ember/5"
    : ex.status === "substituted" ? "border-ember/30 bg-steel"
    : "border-white/10";

  return (
    <div className={`rounded-xl border ${statusColor} p-3 sm:p-4`}>
      {/* Exercise header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="font-bold text-white">
            {ex.status === "substituted" && ex.substitution
              ? <><span className="line-through text-zinc-500 mr-1">{ex.name}</span>{ex.substitution}</>
              : ex.name}
          </div>
          <div className="text-xs text-zinc-500">
            Prescribed: {ex.prescribed.sets}×{ex.prescribed.reps} · {ex.prescribed.load} · {ex.tempo} · {ex.rest}
          </div>
          {ex.cue && <div className="text-[11px] text-gold/80 italic mt-1">"{ex.cue}"</div>}
        </div>
        <div className="flex gap-1 shrink-0">
          <IconBtn title="Done" icon="check" onClick={() => setStatus("completed")} active={ex.status === "completed"} />
          <IconBtn title="Skip" icon="x" onClick={() => setStatus("skipped")} active={ex.status === "skipped"} activeColor="ember" />
          <IconBtn title="Substitute" icon="swap" onClick={() => setStatus("substituted")} active={ex.status === "substituted"} activeColor="ember" />
        </div>
      </div>

      {/* Set rows */}
      <div className="mt-3 space-y-1.5">
        {ex.sets.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-7 text-[10px] uppercase tracking-widest text-zinc-500">Set {i + 1}</div>
            <input
              type="number"
              placeholder="kg"
              value={s.weight}
              onChange={(e) => setRow(i, { weight: e.target.value })}
              className="flex-1 rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white outline-none focus:border-gold/60"
            />
            <input
              type="number"
              placeholder="reps"
              value={s.reps}
              onChange={(e) => setRow(i, { reps: e.target.value })}
              className="w-20 rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white outline-none focus:border-gold/60"
            />
            <button
              onClick={() => setRow(i, { done: !s.done })}
              className={`shrink-0 rounded-md border px-2 py-1.5 ${s.done ? "border-gold bg-gold text-ink" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}
            >
              <Icon name="check" className="w-4 h-4" />
            </button>
            <button
              onClick={() => removeRow(i)}
              className="text-zinc-600 hover:text-ember p-1"
              title="Remove set"
            >
              <Icon name="x" className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        <button onClick={addRow} className="text-xs text-gold hover:underline flex items-center gap-1 mt-1">
          <Icon name="plus" className="w-3 h-3" /> Add set
        </button>
      </div>

      {/* Notes */}
      <input
        placeholder="Notes (form, how it felt)…"
        value={ex.note}
        onChange={(e) => onChange({ note: e.target.value })}
        className="w-full mt-3 rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white outline-none focus:border-gold/60"
      />
    </div>
  );
}
