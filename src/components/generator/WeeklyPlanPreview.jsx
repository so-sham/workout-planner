/**
 * @module components/generator/WeeklyPlanPreview
 * @description Preview card for a weekly/multi-day training plan.
 * Displays all days in an accordion layout with per-day "Start" buttons.
 * Supports adding more workouts to the plan via the "Add Another Workout" action.
 *
 * @param {Object} props
 * @param {Object} props.plan - Weekly plan with `.days` array
 * @param {Function} props.onStart - Called with (dayPlan, meta) when starting a day
 * @param {Function} [props.onSave] - Called to save the plan to library
 * @param {Function} [props.onGenerateMore] - Called to generate an additional workout
 * @param {boolean} [props.extending=false] - Whether a new day is currently being generated
 * @returns {JSX.Element}
 */
import { useState } from 'react';
import Icon from '../Icon';
import FullSessionBody from './FullSessionBody';

export default function WeeklyPlanPreview({ plan, onStart, onSave, onGenerateMore, extending }) {
  /** @type {[number|null, Function]} Index of the currently expanded day */
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="rounded-2xl border border-gold/40 bg-gradient-to-br from-carbon via-steel to-carbon overflow-hidden shadow-gold">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-white/10 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="display text-3xl sm:text-4xl text-white">{plan.title}</div>
          <div className="text-gold text-sm mt-1 italic">"{plan.tagline}"</div>
          <div className="text-xs text-zinc-500 mt-2">
            {plan.days.filter((d) => !d.isRest).length} training days ·{" "}
            {plan.days.filter((d) => d.isRest).length} rest
          </div>
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          {onGenerateMore && (
            <button
              onClick={onGenerateMore}
              disabled={extending}
              className="rounded-lg border border-ember/60 text-ember px-3 py-2 text-xs font-bold hover:bg-ember/10 disabled:opacity-50 flex items-center gap-1 justify-center"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              {extending ? "Generating…" : "Add Another Workout"}
            </button>
          )}
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

      {/* Day rows (accordion) */}
      <div className="divide-y divide-white/5">
        {plan.days.map((d, idx) => {
          const isOpen = expanded === idx;
          return (
            <div key={idx}>
              <div
                onClick={() => !d.isRest && setExpanded(isOpen ? null : idx)}
                className={`w-full flex items-center gap-3 px-5 py-4 text-left ${
                  d.isRest ? "opacity-70 cursor-default" : "cursor-pointer hover:bg-white/5"
                }`}
              >
                <div className={`display text-xl w-12 shrink-0 ${d.isRest ? "text-zinc-600" : "text-gold"}`}>
                  {d.day}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">
                    {d.isRest ? d.focus : d.plan?.title || d.focus}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {d.isRest
                      ? "Rest / mobility / sleep. Recovery is training."
                      : `${d.focus} · ${d.plan?.mainBlock?.length || 0} exercises · ~${d.plan?.estimatedMinutes || "?"} min`}
                  </div>
                </div>
                {!d.isRest && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onStart(d.plan, { weeklyDay: d.day, weeklyFocus: d.focus });
                      }}
                      className="shrink-0 rounded-lg bg-gradient-to-r from-ember to-emberbright text-black px-3 py-1.5 text-xs font-bold"
                    >
                      Start
                    </button>
                    <div className="text-zinc-500 text-xs w-4 text-right">{isOpen ? "▲" : "▼"}</div>
                  </>
                )}
              </div>
              {isOpen && !d.isRest && d.plan && (
                <div className="border-t border-white/10 bg-black/20">
                  <FullSessionBody plan={d.plan} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
