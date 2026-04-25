/**
 * @module components/planner/BlockItemEditor
 * @description Inline editor for a warm-up or cool-down movement.
 * Provides editable fields for name, duration, and coaching cue.
 *
 * @param {Object} props
 * @param {Object} props.item - Movement data { name, duration, cue }
 * @param {Function} props.onChange - Called with updated item
 * @param {Function} props.onRemove - Called to remove this item
 * @returns {JSX.Element}
 */
import LabeledInput from '../LabeledInput';
import Icon from '../Icon';

export default function BlockItemEditor({ item, onChange, onRemove }) {
  /** @param {Object} p - Partial patch to merge into the item */
  const patch = (p) => onChange({ ...item, ...p });

  return (
    <div className="rounded-lg border border-white/10 bg-steel/60 p-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <LabeledInput label="Movement" value={item.name || ""} onChange={(v) => patch({ name: v })} />
        <LabeledInput label="Duration" value={item.duration || ""} onChange={(v) => patch({ duration: v })} />
        <LabeledInput label="Cue" value={item.cue || ""} onChange={(v) => patch({ cue: v })} />
      </div>
      <button onClick={onRemove} className="mt-1 text-[11px] text-ember hover:underline flex items-center gap-1">
        <Icon name="trash" className="w-3 h-3" /> Remove
      </button>
    </div>
  );
}
