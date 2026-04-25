/**
 * @module components/PillGroup
 * @description Horizontal row of selectable "pill" buttons for single-choice options.
 * Used for Intensity, Level, and Cycle selectors in the Generator.
 *
 * @param {Object} props
 * @param {string} props.title - Section title displayed above the pills
 * @param {Array<{id: string, label: string}>} props.options - Available choices
 * @param {string} props.value - Currently selected option ID
 * @param {Function} props.onChange - Callback receiving the newly selected ID
 * @returns {JSX.Element}
 */
export default function PillGroup({ title, options, value, onChange }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">{title}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className={`text-[11px] uppercase tracking-widest px-2.5 py-1.5 rounded border ${
              value === o.id
                ? "border-gold bg-gold/20 text-gold"
                : "border-white/10 text-zinc-300 hover:bg-white/5"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
