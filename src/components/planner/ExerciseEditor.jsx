/**
 * @module components/planner/ExerciseEditor
 * @description Inline editor for a single main-block exercise.
 * Provides editable fields for name, sets, reps, tempo, rest, load, and cue.
 *
 * @param {Object} props
 * @param {Object} props.ex - Exercise data
 * @param {Function} props.onChange - Called with updated exercise
 * @param {Function} props.onRemove - Called to remove this exercise
 * @returns {JSX.Element}
 */
import LabeledInput from '../LabeledInput';
import Icon from '../Icon';

export default function ExerciseEditor({ ex, onChange, onRemove }) {
  /** @param {Object} p - Partial patch to merge into the exercise */
  const patch = (p) => onChange({ ...ex, ...p });

  return (
    <div className="rounded-lg border border-white/10 bg-steel/60 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <LabeledInput label="Exercise" value={ex.name || ""} onChange={(v) => patch({ name: v })} />
        <LabeledInput label="Sets" type="number" value={ex.sets || ""} onChange={(v) => patch({ sets: Number(v) || 0 })} />
        <LabeledInput label="Reps" value={ex.reps || ""} onChange={(v) => patch({ reps: v })} />
        <LabeledInput label="Tempo" value={ex.tempo || ""} onChange={(v) => patch({ tempo: v })} />
        <LabeledInput label="Rest" value={ex.rest || ""} onChange={(v) => patch({ rest: v })} />
        <LabeledInput label="Load" value={ex.load || ""} onChange={(v) => patch({ load: v })} />
      </div>
      <LabeledInput label="Cue" value={ex.cue || ""} onChange={(v) => patch({ cue: v })} />
      <button onClick={onRemove} className="mt-1 text-[11px] text-ember hover:underline flex items-center gap-1">
        <Icon name="trash" className="w-3 h-3" /> Remove
      </button>
    </div>
  );
}
