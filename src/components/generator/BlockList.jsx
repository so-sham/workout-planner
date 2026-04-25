/**
 * @module components/generator/BlockList
 * @description Renders a titled list of warm-up or cool-down movements.
 * Each item shows its name, duration, and coaching cue.
 *
 * @param {Object} props
 * @param {string} props.title - Section title (e.g. "Warm-up", "Cool-down")
 * @param {Array<{name: string, duration: string, cue?: string}>} props.items - Movement entries
 * @returns {JSX.Element}
 */
export default function BlockList({ title, items }) {
  return (
    <div className="p-5 sm:p-6 border-t border-white/10">
      <div className="display text-xl text-white mb-3">{title}</div>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg bg-steel/60 border border-white/5 p-3">
            <div className="display text-lg text-zinc-500 w-6">{i + 1}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">{it.name}</div>
              <div className="text-xs text-zinc-500">{it.duration}</div>
              {it.cue && <div className="text-xs text-gold/80 mt-1 italic">"{it.cue}"</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
