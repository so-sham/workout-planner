/**
 * @module components/generator/FullSessionBody
 * @description Renders the complete body of a workout session —
 * warm-up block, main exercise block, cool-down block, and finisher note.
 * Used in both single plan preview and expanded weekly day views.
 *
 * @param {Object} props
 * @param {Object} props.plan - Workout plan object
 * @param {Array} [props.plan.warmup] - Warm-up movements
 * @param {Array} [props.plan.mainBlock] - Main exercises
 * @param {Array} [props.plan.cooldown] - Cool-down movements
 * @param {string} [props.plan.finisherNote] - Optional finisher text
 * @returns {JSX.Element}
 */
import BlockList from './BlockList';
import ExerciseCard from './ExerciseCard';

export default function FullSessionBody({ plan }) {
  return (
    <div>
      {plan.warmup?.length > 0 && (
        <BlockList title="Warm-up" items={plan.warmup} />
      )}
      <div className="p-5 sm:p-6 border-t border-white/10">
        <div className="display text-xl text-white mb-3">Main Block</div>
        <div className="grid grid-cols-1 gap-2">
          {(plan.mainBlock || []).map((ex, i) => (
            <ExerciseCard key={i} idx={i} ex={ex} />
          ))}
        </div>
      </div>
      {plan.cooldown?.length > 0 && <BlockList title="Cool-down" items={plan.cooldown} />}
      {plan.finisherNote && (
        <div className="p-5 border-t border-white/10 text-xs text-gold/80 italic">
          Finisher · {plan.finisherNote}
        </div>
      )}
    </div>
  );
}
