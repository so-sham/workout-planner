/**
 * @module components/planner/SessionEditor
 * @description Editor for a single workout session within a plan.
 * Contains title, tagline, estimated minutes, finisher note fields,
 * plus section editors for warm-up, main block, and cool-down.
 *
 * @param {Object} props
 * @param {Object} props.session - Session data to edit
 * @param {Function} props.setSession - Called with updated session object
 * @param {Function} props.onPickFor - Called with block name ("warmup"/"mainBlock"/"cooldown") to open the movement picker
 * @returns {JSX.Element}
 */
import LabeledInput from '../LabeledInput';
import EditorSection from './EditorSection';
import BlockItemEditor from './BlockItemEditor';
import ExerciseEditor from './ExerciseEditor';

export default function SessionEditor({ session, setSession, onPickFor }) {
  /** @param {Object} p - Partial patch to merge into the session */
  const patch = (p) => setSession({ ...session, ...p });

  /**
   * Update a single item in a block array (warmup/mainBlock/cooldown).
   * @param {string} block - Block key
   * @param {number} idx - Item index
   * @param {Object} v - Updated item
   */
  const patchBlockItem = (block, idx, v) =>
    patch({ [block]: session[block].map((x, i) => i === idx ? v : x) });

  /**
   * Remove an item from a block array.
   * @param {string} block - Block key
   * @param {number} idx - Item index to remove
   */
  const removeBlockItem = (block, idx) =>
    patch({ [block]: session[block].filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <LabeledInput label="Session Title" value={session.title || ""} onChange={(v) => patch({ title: v })} />
        <LabeledInput label="Session Tagline" value={session.tagline || ""} onChange={(v) => patch({ tagline: v })} />
        <LabeledInput label="Estimated Minutes" type="number" value={session.estimatedMinutes || ""} onChange={(v) => patch({ estimatedMinutes: Number(v) || 0 })} />
        <LabeledInput label="Finisher Note" value={session.finisherNote || ""} onChange={(v) => patch({ finisherNote: v })} />
      </div>

      <EditorSection
        title="Warm-up"
        items={session.warmup || []}
        onAdd={() => onPickFor("warmup")}
        addLabel="Browse Warm-ups"
        renderItem={(it, idx) => (
          <BlockItemEditor item={it} onChange={(v) => patchBlockItem("warmup", idx, v)} onRemove={() => removeBlockItem("warmup", idx)} />
        )}
      />
      <EditorSection
        title="Main Block"
        items={session.mainBlock || []}
        onAdd={() => onPickFor("mainBlock")}
        addLabel="Browse Exercises"
        renderItem={(ex, idx) => (
          <ExerciseEditor ex={ex} onChange={(v) => patchBlockItem("mainBlock", idx, v)} onRemove={() => removeBlockItem("mainBlock", idx)} />
        )}
      />
      <EditorSection
        title="Cool-down"
        items={session.cooldown || []}
        onAdd={() => onPickFor("cooldown")}
        addLabel="Browse Cool-downs"
        renderItem={(it, idx) => (
          <BlockItemEditor item={it} onChange={(v) => patchBlockItem("cooldown", idx, v)} onRemove={() => removeBlockItem("cooldown", idx)} />
        )}
      />
    </div>
  );
}
