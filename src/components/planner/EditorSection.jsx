/**
 * @module components/planner/EditorSection
 * @description Collapsible section wrapper for the plan editor.
 * Shows a titled list of items (warm-up, main block, or cool-down) with
 * browse and add controls.
 *
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.items - Items in this section
 * @param {Function} props.onAdd - Called to open the movement picker for this section
 * @param {string} [props.addLabel="Add"] - Label for the browse button
 * @param {Function} props.renderItem - Render function (item, index) → JSX
 * @returns {JSX.Element}
 */
import Icon from '../Icon';

export default function EditorSection({ title, items, onAdd, addLabel = "Add", renderItem }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between mb-2 gap-2">
        <div className="display text-lg text-gold">{title}</div>
        <button
          onClick={onAdd}
          className="text-xs rounded border border-gold/40 text-gold px-2 py-1 hover:bg-gold/10 flex items-center gap-1 shrink-0"
        >
          <Icon name="search" className="w-3 h-3" /> {addLabel}
        </button>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-zinc-600 italic mb-2">Empty.</div>
      ) : (
        <div className="space-y-2 mb-2">
          {items.map((it, i) => <div key={i}>{renderItem(it, i)}</div>)}
        </div>
      )}
      <button
        onClick={onAdd}
        className="w-full rounded-lg border border-dashed border-gold/40 text-gold px-3 py-2 text-xs font-bold hover:bg-gold/10 flex items-center justify-center gap-1.5"
      >
        <Icon name="plus" className="w-4 h-4" /> Add more
      </button>
    </div>
  );
}
