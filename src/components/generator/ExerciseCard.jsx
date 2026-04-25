/**
 * @module components/generator/ExerciseCard
 * @description Displays a single exercise within the plan preview.
 * Shows the exercise name, prescribed sets × reps, tempo, rest, load, and coaching cue.
 *
 * @param {Object} props
 * @param {number} props.idx - Zero-based exercise index (displayed as 1-based)
 * @param {Object} props.ex - Exercise data from the plan's mainBlock
 * @param {string} props.ex.name - Exercise name
 * @param {number} props.ex.sets - Number of sets
 * @param {string} props.ex.reps - Rep scheme
 * @param {string} props.ex.tempo - Tempo notation
 * @param {string} props.ex.rest - Rest period
 * @param {string} props.ex.load - Load prescription
 * @param {string} [props.ex.cue] - Coaching cue
 * @returns {JSX.Element}
 */
export default function ExerciseCard({ idx, ex }) {
  return (
    <div className="rounded-xl border border-white/10 bg-steel/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-zinc-500">EXERCISE {idx + 1}</div>
          <div className="text-lg font-bold text-white">{ex.name}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="display text-2xl text-gold leading-none">
            {ex.sets}×{ex.reps}
          </div>
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1">
            {ex.tempo} · {ex.rest}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-black/30 px-2 py-1">
          <span className="text-zinc-500 mr-1">Load</span>
          <span className="text-white">{ex.load}</span>
        </div>
        {ex.cue && (
          <div className="rounded-md bg-black/30 px-2 py-1 col-span-2 sm:col-span-2">
            <span className="text-gold/80 italic">"{ex.cue}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
