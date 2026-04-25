/**
 * @module components/progress/LiftChart
 * @description Line chart tracking a single key lift over time.
 * Plots the heaviest set weight and estimated 1RM (Epley) for each session.
 *
 * @param {Object} props
 * @param {string} props.lift - Canonical lift name (e.g. "Back Squat")
 * @param {Object[]} props.workouts - All workout records
 * @param {Object} [props.pr] - Current PR record for this lift
 * @returns {JSX.Element}
 */
import { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { normalizeExerciseName, epley } from '../../utils/helpers';

export default function LiftChart({ lift, workouts, pr }) {
  /** Extract top-set and e1RM data points for this lift from all workouts */
  const data = useMemo(() => {
    const points = [];
    for (const w of workouts) {
      for (const ex of w.sets || []) {
        const norm = normalizeExerciseName(ex.name);
        if (norm !== lift) continue;
        let topW = 0, topR = 0;
        for (const s of ex.sets || []) {
          if (!s.done) continue;
          const wt = Number(s.weight);
          const r = Number(s.reps);
          if (!wt) continue;
          if (wt > topW) { topW = wt; topR = r; }
        }
        if (topW > 0) {
          points.push({ date: w.date, top: topW, e1: epley(topW, topR) });
        }
      }
    }
    return points.sort((a, b) => a.date.localeCompare(b.date));
  }, [workouts, lift]);

  return (
    <div className="rounded-xl border border-white/10 bg-steel/40 p-4">
      <div className="flex items-baseline justify-between mb-2">
        <div className="display text-lg text-white">{lift}</div>
        {pr && <div className="text-xs text-gold">PR e1RM {pr.estimated1RM}kg · {pr.weight}×{pr.reps}</div>}
      </div>
      {data.length === 0 ? (
        <div className="text-xs text-zinc-500 italic py-6 text-center">No data yet.</div>
      ) : (
        <div className="h-40 min-h-[160px] w-full">
          <ResponsiveContainer width="100%" height="100%" minHeight={160}>
            <LineChart data={data}>
              <CartesianGrid stroke="#222" vertical={false} />
              <XAxis dataKey="date" stroke="#666" fontSize={9} />
              <YAxis stroke="#666" fontSize={9} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
              <Line type="monotone" dataKey="top" stroke="#d4af37" name="Top set" dot={false} />
              <Line type="monotone" dataKey="e1" stroke="#ff6a1a" name="e1RM" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
