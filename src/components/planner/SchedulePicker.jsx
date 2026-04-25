/**
 * @module components/planner/SchedulePicker
 * @description Inline widget for adding a saved plan to a specific calendar date.
 * Shows dropdowns for plan and day selection, then a "Schedule" button.
 *
 * @param {Object} props
 * @param {Object[]} props.plans - All saved plans
 * @param {Function} props.onAdd - Called with (planId, dayKey) when scheduling
 * @returns {JSX.Element|null} Returns null if no plans exist
 */
import { useState, useEffect } from 'react';
import Icon from '../Icon';
import { DOW_LABELS, DOW_FULL } from '../../utils/helpers';

/**
 * Get a full label for a program day.
 * @param {Object} d - Day object with optional dow and label fields
 * @returns {string}
 */
function programDayLabel(d) {
  if (d == null) return "";
  if (d.dow != null && d.dow >= 0 && d.dow < 7) return DOW_FULL[d.dow];
  return d.label || "Day";
}

export default function SchedulePicker({ plans, onAdd }) {
  const [planId, setPlanId] = useState(plans[0]?.id || "");
  const plan = plans.find((p) => p.id === planId);
  const [dayKey, setDayKey] = useState(plan?.days?.[0]?.id || "");

  /** Reset day selection when plan changes */
  useEffect(() => { setDayKey(plan?.days?.[0]?.id || ""); }, [planId]);

  if (plans.length === 0) return null;

  const isMulti = (plan?.days || []).length > 1;

  return (
    <div className="mt-3 border-t border-white/10 pt-3 space-y-2">
      <div className="text-[10px] uppercase tracking-widest text-gold">Add to this date</div>
      <select
        value={planId}
        onChange={(e) => setPlanId(e.target.value)}
        className="w-full rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white"
      >
        {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      {isMulti && (
        <select
          value={dayKey}
          onChange={(e) => setDayKey(e.target.value)}
          className="w-full rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white"
        >
          {plan.days.map((d) => (
            <option key={d.id} value={d.id}>
              {programDayLabel(d)}{d.isRest ? " · rest" : ""}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={() => onAdd(planId, dayKey || null)}
        className="w-full rounded-md bg-gradient-to-r from-gold to-goldbright text-ink px-3 py-2 text-sm font-bold"
      >
        Schedule
      </button>
    </div>
  );
}
