/**
 * @module components/LabeledInput
 * @description Labelled text/number input field with consistent dark-theme styling.
 * Used extensively in the plan editor and settings modal.
 *
 * @param {Object} props
 * @param {string} props.label - Label text shown above the input
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback receiving the new string value
 * @param {string} [props.type="text"] - HTML input type ("text" or "number")
 * @returns {JSX.Element}
 */
export default function LabeledInput({ label, value, onChange, type = "text" }) {
  return (
    <label className="block">
      <span className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white outline-none focus:border-gold/60"
      />
    </label>
  );
}
