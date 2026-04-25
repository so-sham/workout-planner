/**
 * @module components/planner/Planner
 * @description Top-level Planner tab component.
 * Provides a toggle between Library and Calendar views, plus a "New Plan" button
 * that opens the PlanEditor modal.
 *
 * @param {Object} props
 * @param {number} props.refreshCounter - Triggers data reload when incremented
 * @param {Function} props.bumpRefresh - Increment the refresh counter
 * @param {Function} props.onStart - Called to start a workout session
 * @param {Function} props.showToast - Toast notification function
 * @returns {JSX.Element}
 */
import { useState, useEffect, useMemo } from 'react';
import { uid } from '../../utils/helpers';
import { loadAllPlans, savePlan, deletePlan } from '../../utils/storage';
import Icon from '../Icon';
import PlannerLibrary from './PlannerLibrary';
import PlannerCalendar from './PlannerCalendar';
import PlanEditor from './PlanEditor';

/**
 * Create a blank plan template with one empty day.
 * @returns {Object} New plan with default structure
 */
function blankPlan() {
  return {
    id: uid(),
    type: "program",
    name: "Untitled Plan",
    tagline: "Earn it.",
    days: [
      {
        id: uid(),
        label: "Day 1",
        dow: null,
        focus: "",
        isRest: false,
        plan: {
          id: uid(),
          title: "New Session",
          tagline: "",
          estimatedMinutes: 45,
          warmup: [],
          mainBlock: [],
          cooldown: [],
          finisherNote: "",
        },
      },
    ],
  };
}

export default function Planner({ refreshCounter, bumpRefresh, onStart, showToast }) {
  const [view, setView] = useState("library");
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [plans, setPlans] = useState([]);

  /** Reload plans from storage when refresh counter changes */
  useEffect(() => { setPlans(loadAllPlans()); }, [refreshCounter]);

  /** Resolve the plan being edited — either from library or a fresh blank */
  const editingPlan = useMemo(() => {
    if (!editingPlanId) return null;
    if (editingPlanId === "__new__") return blankPlan();
    return plans.find((p) => p.id === editingPlanId);
  }, [editingPlanId, plans]);

  return (
    <section className="space-y-4">
      {/* View toggle + New Plan button */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
          <button onClick={() => setView("library")} className={`px-3 py-1.5 text-xs uppercase tracking-widest rounded ${view === "library" ? "bg-gold text-ink" : "text-zinc-400"}`}>Library</button>
          <button onClick={() => setView("calendar")} className={`px-3 py-1.5 text-xs uppercase tracking-widest rounded ${view === "calendar" ? "bg-gold text-ink" : "text-zinc-400"}`}>Calendar</button>
        </div>
        <button
          onClick={() => setEditingPlanId("__new__")}
          className="rounded-lg bg-gradient-to-r from-gold to-goldbright text-ink px-3 py-1.5 text-xs font-bold flex items-center gap-1"
        >
          <Icon name="plus" className="w-3.5 h-3.5" /> New Plan
        </button>
      </div>

      {/* Active view */}
      {view === "library" ? (
        <PlannerLibrary
          plans={plans}
          onEdit={(id) => setEditingPlanId(id)}
          onDuplicate={(p) => {
            const copy = JSON.parse(JSON.stringify(p));
            copy.id = uid();
            copy.name = `${p.name} (copy)`;
            copy.days = (copy.days || []).map((d) => ({ ...d, id: uid() }));
            savePlan(copy);
            bumpRefresh();
            showToast("Plan duplicated");
          }}
          onDelete={(p) => {
            if (confirm(`Delete "${p.name}"?`)) {
              deletePlan(p.id);
              bumpRefresh();
              showToast("Plan deleted");
            }
          }}
          onStart={onStart}
        />
      ) : (
        <PlannerCalendar
          plans={plans}
          onStart={onStart}
          bumpRefresh={bumpRefresh}
          showToast={showToast}
        />
      )}

      {/* Plan editor modal */}
      {editingPlan && (
        <PlanEditor
          plan={editingPlan}
          onClose={() => setEditingPlanId(null)}
          onSave={(p) => { savePlan(p); bumpRefresh(); setEditingPlanId(null); showToast("Plan saved"); }}
        />
      )}
    </section>
  );
}
