/**
 * @module components/logger/ActiveWorkout
 * @description Active workout session view.
 * Displays an elapsed timer, set-completion progress bar, per-exercise logging cards,
 * and Finish / Cancel controls. This is the primary "training mode" screen.
 *
 * @param {Object} props
 * @param {Object} props.session - Active session state
 * @param {Function} props.setSession - Session state updater
 * @param {Function} props.onFinish - Called with the session to finish and save
 * @param {Function} props.onCancel - Called to cancel the active session
 * @returns {JSX.Element}
 */
import { useState, useEffect } from 'react';
import { formatDuration } from '../../utils/helpers';
import Icon from '../Icon';
import LoggerCard from './LoggerCard';

export default function ActiveWorkout({ session, setSession, onFinish, onCancel }) {
  /** Ticking clock for elapsed time display */
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const totalSets = session.sets.reduce((s, ex) => s + ex.sets.length, 0);
  const doneSets = session.sets.reduce((s, ex) => s + ex.sets.filter((x) => x.done).length, 0);

  /**
   * Update a specific exercise entry by index.
   * @param {number} i - Exercise index
   * @param {Object} patch - Fields to merge into the exercise entry
   */
  const updateExercise = (i, patch) => {
    setSession({
      ...session,
      sets: session.sets.map((ex, idx) => idx === i ? { ...ex, ...patch } : ex),
    });
  };

  return (
    <section className="space-y-4">
      {/* Sticky session header */}
      <div className="rounded-2xl border border-gold/30 bg-carbon p-4 sm:p-5 sticky top-[88px] z-30">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="display text-2xl sm:text-3xl text-white truncate">{session.plan.title}</div>
            <div className="text-[11px] text-gold uppercase tracking-widest mt-1">In session</div>
          </div>
          <div className="text-right">
            <div className="display text-2xl text-gold leading-none">{formatDuration(now - session.startedAt)}</div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">Elapsed</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gold to-goldbright"
              style={{ width: `${Math.min(100, (doneSets / Math.max(1, totalSets)) * 100)}%` }}
            />
          </div>
          <div className="text-xs text-zinc-500 mt-1.5">{doneSets}/{totalSets} sets</div>
        </div>

        {/* Action buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onFinish(session)}
            className="flex-1 rounded-lg bg-gradient-to-r from-gold to-goldbright text-ink py-2.5 font-bold text-sm"
          >
            Finish & Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg border border-ember/40 text-ember px-4 text-sm font-bold hover:bg-ember/10"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Exercise cards */}
      <div className="space-y-3">
        {session.sets.map((ex, i) => (
          <LoggerCard key={ex.id} ex={ex} onChange={(patch) => updateExercise(i, patch)} />
        ))}
      </div>
    </section>
  );
}
