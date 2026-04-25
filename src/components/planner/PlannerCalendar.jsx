/**
 * @module components/planner/PlannerCalendar
 * @description Monthly calendar view showing scheduled workouts.
 * Displays a navigable month grid with plan indicators per day.
 * Side panel shows the selected day's schedule with Start and Remove actions.
 *
 * @param {Object} props
 * @param {Object[]} props.plans - All saved plans
 * @param {Function} props.onStart - Called to start a workout
 * @param {Function} props.bumpRefresh - Refresh counter incrementer
 * @param {Function} props.showToast - Toast notification function
 * @returns {JSX.Element}
 */
import { useState, useEffect, useMemo } from 'react';
import { todayISO, formatDate, DOW_LABELS, DOW_FULL } from '../../utils/helpers';
import { loadAllSchedule, addToSchedule, removeFromSchedule } from '../../utils/storage';
import Icon from '../Icon';
import SchedulePicker from './SchedulePicker';

/**
 * Get a short label for a program day.
 * @param {Object} d - Day object
 * @returns {string}
 */
function programDayShort(d) {
  if (d == null) return "";
  if (d.dow != null && d.dow >= 0 && d.dow < 7) return DOW_LABELS[d.dow];
  return (d.label || "Day").slice(0, 6);
}

/**
 * Get a full label for a program day.
 * @param {Object} d - Day object
 * @returns {string}
 */
function programDayLabel(d) {
  if (d == null) return "";
  if (d.dow != null && d.dow >= 0 && d.dow < 7) return DOW_FULL[d.dow];
  return d.label || "Day";
}

export default function PlannerCalendar({ plans, onStart, bumpRefresh, showToast }) {
  /** Current month cursor for navigation */
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selected, setSelected] = useState(todayISO());
  const [scheduleMap, setScheduleMap] = useState({});

  /** Reload schedule data on refresh */
  useEffect(() => { setScheduleMap(loadAllSchedule()); }, [bumpRefresh]);

  const monthStart = useMemo(() => new Date(cursor), [cursor]);

  /** Generate the calendar grid cells for the current month */
  const monthGrid = useMemo(() => {
    const first = new Date(monthStart);
    const startDow = first.getDay(); // Sun=0
    const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(first.getFullYear(), first.getMonth(), d);
      cells.push(dt.toISOString().slice(0, 10));
    }
    return cells;
  }, [monthStart]);

  /**
   * Resolve a schedule entry to its plan and day data.
   * @param {Object} entry - Schedule entry
   * @returns {{record: Object, day: Object}|null}
   */
  const planFromRecord = (entry) => {
    const p = plans.find((x) => x.id === entry.planId);
    if (!p) return null;
    const days = p.days || [];
    if (!entry.dayKey) return { record: p, day: days[0] };
    const day = days.find((d) => d.id === entry.dayKey)
      || days.find((d) => programDayShort(d) === entry.dayKey || d.label === entry.dayKey);
    return { record: p, day: day || days[0] };
  };

  const entries = scheduleMap[selected] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Calendar grid */}
      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-steel/40 p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() - 1); setCursor(d); }}
            className="rounded border border-white/10 px-2 py-1 text-sm hover:bg-white/5"
          >‹</button>
          <div className="display text-xl text-white">
            {monthStart.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </div>
          <button
            onClick={() => { const d = new Date(cursor); d.setMonth(d.getMonth() + 1); setCursor(d); }}
            className="rounded border border-white/10 px-2 py-1 text-sm hover:bg-white/5"
          >›</button>
        </div>
        <div className="grid grid-cols-7 text-[10px] uppercase tracking-widest text-zinc-500 mb-1">
          {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d} className="text-center py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {monthGrid.map((iso, i) => {
            if (!iso) return <div key={i} />;
            const isToday = iso === todayISO();
            const isSelected = iso === selected;
            const list = scheduleMap[iso] || [];
            return (
              <button
                key={iso}
                onClick={() => setSelected(iso)}
                className={`aspect-square rounded-md border p-1 text-left flex flex-col gap-1 hover:bg-white/5 ${
                  isSelected ? "border-gold ring-1 ring-gold" : isToday ? "border-ember/60" : "border-white/10"
                }`}
              >
                <div className={`text-xs font-bold ${isToday ? "text-ember" : "text-white"}`}>{iso.slice(8)}</div>
                <div className="space-y-0.5 overflow-hidden">
                  {list.slice(0, 2).map((e) => {
                    const p = plans.find((x) => x.id === e.planId);
                    return <div key={e.id} className="text-[9px] truncate text-gold">{p?.name || "—"}</div>;
                  })}
                  {list.length > 2 && <div className="text-[9px] text-zinc-500">+{list.length - 2}</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day panel */}
      <div className="rounded-2xl border border-white/10 bg-steel/40 p-3 sm:p-4">
        <div className="display text-lg text-white mb-2">{formatDate(selected)}</div>
        {entries.length === 0 ? (
          <div className="text-xs text-zinc-500 italic">Nothing scheduled.</div>
        ) : (
          <div className="space-y-2">
            {entries.map((e) => {
              const r = planFromRecord(e);
              if (!r) return (
                <div key={e.id} className="rounded-md border border-white/10 p-2 text-xs text-zinc-500 italic">(deleted plan)</div>
              );
              return (
                <div key={e.id} className="rounded-md border border-white/10 bg-black/30 p-2 flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">{r.record.name}</div>
                    <div className="text-[11px] text-zinc-500 truncate">{programDayLabel(r.day)} · {r.day?.focus || (r.day?.plan?.title || "Session")}</div>
                  </div>
                  {!r.day?.isRest && r.day?.plan && (
                    <button
                      onClick={() => onStart(r.day.plan, { weeklyDay: programDayShort(r.day), weeklyFocus: r.day.focus, programDayId: r.day.id })}
                      className="rounded bg-gradient-to-r from-ember to-emberbright text-black px-2 py-1 text-xs font-bold"
                    >
                      Start
                    </button>
                  )}
                  <button
                    onClick={() => { removeFromSchedule(selected, e.id); bumpRefresh(); }}
                    className="text-zinc-500 hover:text-ember p-1"
                  >
                    <Icon name="x" className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <SchedulePicker plans={plans} onAdd={(planId, dayKey) => { addToSchedule(selected, planId, dayKey); bumpRefresh(); showToast("Scheduled"); }} />
      </div>
    </div>
  );
}
