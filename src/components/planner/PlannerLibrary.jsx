/**
 * @module components/planner/PlannerLibrary
 * @description Library view listing all saved workout plans with search and CRUD actions.
 *
 * @param {Object} props
 * @param {Object[]} props.plans - All saved plan objects
 * @param {Function} props.onEdit - Called with plan ID to open editor
 * @param {Function} props.onDuplicate - Called with plan to duplicate
 * @param {Function} props.onDelete - Called with plan to delete
 * @param {Function} props.onStart - Called to start a workout
 * @returns {JSX.Element}
 */
import { useState, useMemo } from 'react';
import Icon from '../Icon';
import PlanCard from './PlanCard';

export default function PlannerLibrary({ plans, onEdit, onDuplicate, onDelete, onStart }) {
  const [q, setQ] = useState("");

  /** Full-text search across plan names, taglines, session titles, and exercise names */
  const filtered = useMemo(() => {
    if (!q.trim()) return plans;
    const k = q.toLowerCase();
    return plans.filter((p) => {
      if ((p.name || "").toLowerCase().includes(k)) return true;
      if ((p.tagline || "").toLowerCase().includes(k)) return true;
      for (const d of p.days || []) {
        if ((d.plan?.title || "").toLowerCase().includes(k)) return true;
        for (const e of d.plan?.mainBlock || []) {
          if ((e.name || "").toLowerCase().includes(k)) return true;
        }
      }
      return false;
    });
  }, [plans, q]);

  return (
    <div className="space-y-3">
      {/* Search bar */}
      <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
        <Icon name="search" className="w-4 h-4 text-zinc-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plans, sessions, exercises…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      {/* Plan cards */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-zinc-500 text-sm">
          {plans.length === 0 ? "No plans yet. Generate or create a plan to start your library." : "No matches for that search."}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              onEdit={() => onEdit(p.id)}
              onDuplicate={() => onDuplicate(p)}
              onDelete={() => onDelete(p)}
              onStart={onStart}
            />
          ))}
        </div>
      )}
    </div>
  );
}
