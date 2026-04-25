/**
 * @module components/IconBtn
 * @description Small icon-only button with active/inactive visual states.
 * Used throughout the app for compact action buttons (edit, delete, skip, etc.).
 *
 * @param {Object} props
 * @param {string} props.title - Accessible tooltip text
 * @param {string} props.icon - Icon name passed to <Icon />
 * @param {Function} props.onClick - Click handler
 * @param {boolean} [props.active=false] - Whether to show the active/highlighted state
 * @param {string} [props.activeColor="gold"] - Active highlight colour ("gold" or "ember")
 * @param {boolean} [props.disabled=false] - Disable the button
 * @returns {JSX.Element}
 */
import Icon from './Icon';

export default function IconBtn({ title, icon, onClick, active, activeColor = "gold", disabled }) {
  const c = active
    ? (activeColor === "ember" ? "border-ember/50 text-ember" : "border-gold/50 text-gold")
    : "border-white/10 text-zinc-400";

  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg border ${c} p-2 hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      <Icon name={icon} className="w-4 h-4" />
    </button>
  );
}
