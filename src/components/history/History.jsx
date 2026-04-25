/**
 * @module components/history/History
 * @description Workout history list with category and date-range filters.
 * Shows all logged workout sessions with expandable details.
 * Supports deleting individual records.
 *
 * @param {Object} props
 * @param {number} props.refreshCounter - Triggers data reload when incremented
 * @param {Function} props.bumpRefresh - Increment the refresh counter
 * @returns {JSX.Element}
 */
import { useState, useEffect, useMemo } from 'react';
import { CATEGORIES } from '../../constants/categories';
import { loadAllWorkouts, deleteWorkout } from '../../utils/storage';
import { guessCategory, formatDate, formatDuration } from '../../utils/helpers';
import Icon from '../Icon';

export default function History({ refreshCounter, bumpRefresh }) {
  const [items, setItems] = useState([]);
  const [filterCat, setFilterCat] = useState("all");
  const [days, setDays] = useState(90);
  const [expanded, setExpanded] = useState(null);

  /** Reload workout data when refresh counter changes */
  useEffect(() => { setItems(loadAllWorkouts()); }, [refreshCounter]);

  /** Filter workouts by category and date range */
  const filtered = useMemo(() => {
    const cutoff = Date.now() - days * 86400000;
    return items.filter((w) => {
      if ((w.finishedAt || 0) < cutoff) return false;
      if (filterCat === "all") return true;
      return guessCategory(w.plan?.title || "") === filterCat;
    });
  }, [items, filterCat, days]);

  return (
    <section className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          className="rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white"
        >
          <option value="all">All categories</option>
          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="rounded-md bg-black/40 border border-white/10 px-2 py-1.5 text-sm text-white"
        >
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
          <option value={3650}>All time</option>
        </select>
        <span className="text-xs text-zinc-500">{filtered.length} sessions</span>
      </div>

      {/* Session list */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-500 text-sm">
          No sessions logged yet. Start one from the generator.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((w) => (
            <div key={w.id} className="rounded-xl border border-white/10 bg-steel/40 overflow-hidden">
              <div
                role="button"
                tabIndex={0}
                onClick={() => setExpanded(expanded === w.id ? null : w.id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(expanded === w.id ? null : w.id); }}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-white/5 cursor-pointer"
              >
                <div className="display text-xl text-gold shrink-0 w-16">
                  {formatDate(w.date).slice(0, 6)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{w.plan?.title || "Session"}</div>
                  <div className="text-xs text-zinc-500">
                    {w.stats.setCount} sets · {w.stats.tonnage}kg · {formatDuration(w.durationMs)}
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this session?")) { deleteWorkout(w.date, w.id); bumpRefresh(); }
                  }}
                  className="text-zinc-500 hover:text-ember p-1 relative z-10"
                >
                  <Icon name="trash" className="w-4 h-4" />
                </button>
              </div>

              {/* Expanded detail */}
              {expanded === w.id && (
                <div className="border-t border-white/10 p-3 space-y-2">
                  {w.sets.map((ex, i) => (
                    <div key={i} className="rounded-md bg-black/30 p-2">
                      <div className="text-sm font-semibold text-white">{ex.substitution || ex.name}</div>
                      <div className="text-xs text-zinc-500">
                        {ex.sets.filter((s) => s.done).map((s) => `${s.weight}×${s.reps}`).join(" · ") || "—"}
                      </div>
                      {ex.note && <div className="text-[11px] text-gold/70 italic mt-1">"{ex.note}"</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
