/**
 * @module components/planner/PlanEditor
 * @description Full-screen modal for creating or editing a workout plan.
 * Manages multi-day programs with per-day settings, session editing,
 * and the movement picker integration.
 *
 * @param {Object} props
 * @param {Object} props.plan - Plan object to edit (or a blank plan for new)
 * @param {Function} props.onClose - Called to dismiss the editor
 * @param {Function} props.onSave - Called with the final plan to persist
 * @returns {JSX.Element}
 */
import { useState } from 'react';
import { uid, DOW_LABELS } from '../../utils/helpers';
import Icon from '../Icon';
import LabeledInput from '../LabeledInput';
import SessionEditor from './SessionEditor';
import MovementPicker from './MovementPicker';

/**
 * Get a short display label for a program day.
 * @param {Object} d - Day object
 * @returns {string}
 */
function programDayShort(d) {
  if (d == null) return "";
  if (d.dow != null && d.dow >= 0 && d.dow < 7) return DOW_LABELS[d.dow];
  return (d.label || "Day").slice(0, 6);
}

/**
 * Create a blank session template.
 * @returns {Object} Empty session with default structure
 */
function blankSession() {
  return {
    id: uid(),
    title: "New Session",
    tagline: "",
    estimatedMinutes: 45,
    warmup: [],
    mainBlock: [],
    cooldown: [],
    finisherNote: "",
  };
}

export default function PlanEditor({ plan, onClose, onSave }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(plan)));
  const [activeDayId, setActiveDayId] = useState(() => plan.days?.[0]?.id || null);
  const [pickerBlock, setPickerBlock] = useState(null);

  /** @param {Object} p - Partial patch to merge into the draft */
  const patchDraft = (p) => setDraft((d) => ({ ...d, ...p }));

  /**
   * Update a specific day within the draft.
   * @param {string} id - Day ID
   * @param {Object} p - Partial patch
   */
  const patchDay = (id, p) =>
    setDraft((d) => ({ ...d, days: d.days.map((x) => x.id === id ? { ...x, ...p } : x) }));

  /** Add a new blank workout day to the program */
  const addDay = () => {
    const id = uid();
    setDraft((d) => ({
      ...d,
      days: [...d.days, { id, label: `Day ${d.days.length + 1}`, dow: null, focus: "", isRest: false, plan: blankSession() }],
    }));
    setActiveDayId(id);
  };

  /**
   * Remove a day from the program (minimum 1 day must remain).
   * @param {string} id - Day ID to remove
   */
  const removeDay = (id) => {
    setDraft((d) => ({ ...d, days: d.days.filter((x) => x.id !== id) }));
    if (activeDayId === id) {
      const remaining = draft.days.filter((d) => d.id !== id);
      setActiveDayId(remaining[0]?.id || null);
    }
  };

  const activeDay = (draft.days || []).find((d) => d.id === activeDayId);

  /**
   * Update the active day's session.
   * @param {Object} next - New session data
   */
  const setActiveSession = (next) => {
    if (!activeDay) return;
    patchDay(activeDay.id, { plan: next });
  };

  /**
   * Add an item from the movement picker to the active day's session.
   * @param {Object} item - Item to add
   */
  const addFromPicker = (item) => {
    if (!activeDay || !pickerBlock) return;
    const session = activeDay.plan || blankSession();
    const next = { ...session, [pickerBlock]: [...(session[pickerBlock] || []), item] };
    patchDay(activeDay.id, { plan: next });
  };

  const programLabel = (draft.days || []).length > 1 ? `${draft.days.length}-Day Program` : "Single Session";

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="w-full max-w-4xl rounded-2xl border border-gold/30 bg-carbon shadow-gold overflow-hidden my-4">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3 sticky top-0 bg-carbon z-10">
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-widest text-gold">{programLabel} · Editor</div>
              <div className="display text-2xl text-white truncate">{draft.name || "Untitled Plan"}</div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={onClose} className="rounded-lg border border-white/10 px-3 py-1.5 text-sm hover:bg-white/5">Cancel</button>
              <button onClick={() => onSave(draft)} className="rounded-lg bg-gradient-to-r from-gold to-goldbright text-ink px-3 py-1.5 text-sm font-bold flex items-center gap-1">
                <Icon name="save" className="w-3.5 h-3.5" /> Save
              </button>
            </div>
          </div>

          {/* Editor body */}
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <LabeledInput label="Plan Name" value={draft.name || ""} onChange={(v) => patchDraft({ name: v })} />
              <LabeledInput label="Tagline" value={draft.tagline || ""} onChange={(v) => patchDraft({ tagline: v })} />
            </div>

            {/* Day tabs */}
            <div className="rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] uppercase tracking-widest text-gold">Workouts ({(draft.days || []).length})</div>
                <button onClick={addDay} className="text-xs rounded border border-gold/40 text-gold px-2 py-1 hover:bg-gold/10 flex items-center gap-1">
                  <Icon name="plus" className="w-3 h-3" /> Add Workout
                </button>
              </div>
              <div className="text-[10px] text-zinc-500 mb-2 italic">
                Bundle the workouts now. Assign days of the week later, from the calendar.
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(draft.days || []).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setActiveDayId(d.id)}
                    className={`text-[11px] uppercase tracking-widest px-2.5 py-1.5 rounded border ${d.id === activeDayId ? "border-gold bg-gold/20 text-gold" : d.isRest ? "border-white/5 text-zinc-600 hover:text-zinc-400" : "border-white/10 text-zinc-300 hover:bg-white/5"}`}
                    title={d.focus || d.label}
                  >
                    {programDayShort(d)}{d.isRest ? " · rest" : ""}
                  </button>
                ))}
              </div>
            </div>

            {/* Day settings */}
            {activeDay && (
              <div className="rounded-xl border border-white/10 bg-black/30 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] uppercase tracking-widest text-gold">Workout Settings</div>
                  <button
                    onClick={() => removeDay(activeDay.id)}
                    disabled={(draft.days || []).length <= 1}
                    className="text-xs text-ember disabled:opacity-30 hover:underline flex items-center gap-1"
                  >
                    <Icon name="trash" className="w-3 h-3" /> Remove Workout
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LabeledInput label="Workout Label" value={activeDay.label || ""} onChange={(v) => patchDay(activeDay.id, { label: v })} />
                  <LabeledInput label="Focus" value={activeDay.focus || ""} onChange={(v) => patchDay(activeDay.id, { focus: v })} />
                </div>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={!!activeDay.isRest}
                    onChange={(e) => patchDay(activeDay.id, { isRest: e.target.checked, plan: e.target.checked ? null : (activeDay.plan || blankSession()) })}
                  />
                  Rest day
                </label>
              </div>
            )}

            {/* Session editor */}
            {activeDay && !activeDay.isRest && activeDay.plan ? (
              <SessionEditor session={activeDay.plan} setSession={setActiveSession} onPickFor={(block) => setPickerBlock(block)} />
            ) : activeDay?.isRest ? (
              <div className="rounded-lg border border-dashed border-white/10 p-6 text-center text-sm text-zinc-500">Rest day — no session to edit.</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Movement picker overlay */}
      {pickerBlock && (
        <MovementPicker block={pickerBlock} onClose={() => setPickerBlock(null)} onPick={addFromPicker} />
      )}
    </div>
  );
}
