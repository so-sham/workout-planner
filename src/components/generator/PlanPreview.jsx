/**
 * @module components/generator/PlanPreview
 * @description Preview card for a single (non-weekly) workout plan.
 * Shows the plan title, tagline, stats, and action buttons (Start, Save).
 * Expands to show the full session body (warm-up, exercises, cool-down).
 *
 * @param {Object} props
 * @param {Object} props.plan - Generated workout plan object
 * @param {Function} props.onStart - Called when the user clicks "Start"
 * @param {Function} [props.onSave] - Called when the user clicks "Save Plan"
 * @returns {JSX.Element}
 */
import Icon from '../Icon';
import FullSessionBody from './FullSessionBody';

export default function PlanPreview({ plan, onStart, onSave }) {
  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-carbon via-steel to-carbon overflow-hidden shadow-gold">
      <div className="p-5 sm:p-6 border-b border-white/10 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="display text-3xl sm:text-4xl text-white">{plan.title}</div>
          <div className="text-gold text-sm mt-1 italic">"{plan.tagline}"</div>
          <div className="text-xs text-zinc-500 mt-2">
            ~{plan.estimatedMinutes || "?"} min · {plan.mainBlock?.length || 0} exercises
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={onStart}
            className="rounded-xl bg-gradient-to-r from-ember to-emberbright text-black px-5 py-3 font-black display text-xl shadow-ember hover:brightness-110"
          >
            <Icon name="play" className="w-4 h-4 inline mr-2 -mt-0.5" />
            Start
          </button>
          {onSave && (
            <button
              onClick={() => onSave(plan)}
              className="rounded-lg border border-gold/50 text-gold px-3 py-2 text-xs font-bold hover:bg-gold/10"
            >
              Save Plan
            </button>
          )}
        </div>
      </div>
      <FullSessionBody plan={plan} />
    </div>
  );
}
