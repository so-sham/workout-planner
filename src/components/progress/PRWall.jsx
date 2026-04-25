/**
 * @module components/progress/PRWall
 * @description Weekly training volume bar chart spanning the last 8 weeks.
 * Shows total sets and tonnage (kg) per ISO-week using Recharts.
 *
 * @param {Object} props
 * @param {Object[]} props.workouts - All workout records
 * @returns {JSX.Element}
 */
import { useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Icon from '../Icon';

export default function PRWall({ workouts }) {
  /** Compute 8-week volume data aligned to ISO Monday-anchored weeks */
  const data = useMemo(() => {
    const weeks = [];
    const today = new Date();
    const day = today.getDay() || 7; // Sun=0 → 7
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day - 1));
    monday.setHours(0, 0, 0, 0);
    for (let i = 7; i >= 0; i--) {
      const start = new Date(monday); start.setDate(monday.getDate() - i * 7);
      const end = new Date(start); end.setDate(start.getDate() + 7);
      const ws = workouts.filter((w) => {
        const t = w.finishedAt || 0;
        return t >= start.getTime() && t < end.getTime();
      });
      const sets = ws.reduce((s, w) => s + (w.stats?.setCount || 0), 0);
      const tonnage = ws.reduce((s, w) => s + (w.stats?.tonnage || 0), 0);
      weeks.push({ wk: `${start.getMonth() + 1}/${start.getDate()}`, sets, tonnage });
    }
    return weeks;
  }, [workouts]);

  return (
    <div className="rounded-2xl border border-white/10 bg-steel/40 p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="trophy" className="w-5 h-5 text-gold" />
        <h2 className="display text-2xl text-white">Weekly Volume — 8 weeks</h2>
      </div>
      <div className="h-64 min-h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%" minHeight={250}>
          <BarChart data={data}>
            <CartesianGrid stroke="#222" vertical={false} />
            <XAxis dataKey="wk" stroke="#666" fontSize={10} />
            <YAxis stroke="#666" fontSize={10} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333" }} />
            <Legend />
            <Bar dataKey="sets" fill="#d4af37" name="Sets" />
            <Bar dataKey="tonnage" fill="#ff6a1a" name="Tonnage (kg)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
