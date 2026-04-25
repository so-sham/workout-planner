/**
 * @module components/planner/PlanCard
 * @description Summary card for a saved workout plan in the library view.
 * Shows plan name, type (single vs. multi-day), tagline, and action buttons.
 * For multi-day plans, displays per-day Start buttons.
 *
 * @param {Object} props
 * @param {Object} props.plan - Saved plan object
 * @param {Function} props.onEdit - Called to open the plan editor
 * @param {Function} props.onDuplicate - Called to duplicate the plan
 * @param {Function} props.onDelete - Called to delete the plan
 * @param {Function} props.onStart - Called with (dayPlan, meta) to start a workout
 * @returns {JSX.Element}
 */
import Icon from '../Icon';
import IconBtn from '../IconBtn';
import { DOW_LABELS, DOW_FULL } from '../../utils/helpers';

/**
 * Get a short label for a program day (e.g. "Mon", "Day 1").
 * @param {Object} d - Day object
 * @returns {string}
 */
function programDayShort(d) {
  if (d == null) return "";
  if (d.dow != null && d.dow >= 0 && d.dow < 7) return DOW_LABELS[d.dow];
  return (d.label || "Day").slice(0, 6);
}

export default function PlanCard({ plan, onEdit, onDuplicate, onDelete, onStart }) {
  const trainDays = (plan.days || []).filter((d) => !d.isRest);
  const isMulti = trainDays.length > 1;

  return (
    <div className="rounded-xl border border-white/10 bg-steel/40 p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-gold">
            {isMulti ? `${trainDays.length}-Day Program` : "Single Session"}
          </div>
          <div className="display text-xl text-white truncate">{plan.name}</div>
          {plan.tagline && <div className="text-xs text-gold/80 italic">"{plan.tagline}"</div>}
        </div>
        <div className="flex gap-1 shrink-0">
          <IconBtn title="Edit" icon="pencil" onClick={onEdit} />
          <IconBtn title="Duplicate" icon="copy" onClick={onDuplicate} />
          <IconBtn title="Delete" icon="trash" onClick={onDelete} activeColor="ember" />
        </div>
      </div>
      <div className="text-[11px] text-zinc-500 mt-2">
        {(plan.days || []).length} workout{(plan.days || []).length === 1 ? "" : "s"}
        {plan.updatedAt && ` · updated ${new Date(plan.updatedAt).toLocaleDateString()}`}
      </div>
      <div className="mt-3">
        {isMulti ? (
          <div className="flex flex-wrap gap-1.5">
            {plan.days.map((d) => (
              <button
                key={d.id}
                disabled={d.isRest}
                onClick={() => onStart(d.plan, { weeklyDay: programDayShort(d), weeklyFocus: d.focus, programDayId: d.id })}
                className={`text-[11px] uppercase tracking-widest px-2.5 py-1.5 rounded border ${d.isRest ? "border-white/5 text-zinc-600" : "border-ember/40 text-ember hover:bg-ember/10"}`}
              >
                {programDayShort(d)}{d.isRest ? " · rest" : ""}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={() => onStart(plan.days[0]?.plan, { programDayId: plan.days[0]?.id })}
            disabled={!plan.days[0]?.plan}
            className="rounded-lg bg-gradient-to-r from-ember to-emberbright text-black px-3 py-1.5 text-xs font-bold flex items-center gap-1 disabled:opacity-30"
          >
            <Icon name="play" className="w-3 h-3" /> Start
          </button>
        )}
      </div>
    </div>
  );
}
