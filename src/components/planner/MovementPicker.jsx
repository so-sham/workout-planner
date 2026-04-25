/**
 * @module components/planner/MovementPicker
 * @description Full-screen modal for browsing and adding exercises, warm-ups,
 * or cool-downs from the master libraries. Supports text search and category filtering.
 * Added items are tracked visually so the user can see what's been picked.
 *
 * @param {Object} props
 * @param {string} props.block - Target block ("warmup" | "mainBlock" | "cooldown")
 * @param {Function} props.onClose - Called to dismiss the picker
 * @param {Function} props.onPick - Called with the selected item to add it to the session
 * @returns {JSX.Element}
 */
import { useState, useMemo } from 'react';
import { EXERCISE_LIBRARY, WARMUP_LIBRARY, COOLDOWN_LIBRARY } from '../../constants/exercises';
import Icon from '../Icon';

export default function MovementPicker({ block, onClose, onPick }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [addedNames, setAddedNames] = useState(() => new Set());

  /**
   * Handle picking an item — adds it and tracks the name for visual feedback.
   * @param {Object} it - Item to add
   * @param {string} name - Item name for tracking
   */
  const handlePick = (it, name) => {
    onPick(it);
    setAddedNames((prev) => { const n = new Set(prev); n.add(name); return n; });
  };

  /** Build config based on which block we're picking for */
  const config = useMemo(() => {
    if (block === "mainBlock") {
      return {
        title: "Exercise Library",
        source: EXERCISE_LIBRARY,
        toItem: (ex) => ({ name: ex.name, ...ex.defaults }),
        filters: [
          { id: "all", label: "All" },
          { id: "push", label: "Push" },
          { id: "pull", label: "Pull" },
          { id: "legs", label: "Legs" },
          { id: "core", label: "Core" },
          { id: "olympic", label: "Olympic" },
          { id: "conditioning", label: "Conditioning" },
          { id: "full", label: "Full Body" },
        ],
        matchFilter: (ex, f) => {
          if (f === "all") return true;
          if (f === "olympic") return ex.pattern === "olympic";
          if (f === "conditioning") return ex.pattern === "conditioning" || ex.pattern === "plyometric";
          return (ex.parts || []).includes(f);
        },
        renderMeta: (ex) => (
          <>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{ex.parts?.slice(0, 3).join(" · ") || ex.pattern}</div>
            <div className="text-[10px] text-zinc-600">{ex.defaults.sets}×{ex.defaults.reps} · {ex.defaults.rest} · {ex.defaults.load}</div>
          </>
        ),
      };
    }
    const source = block === "warmup" ? WARMUP_LIBRARY : COOLDOWN_LIBRARY;
    return {
      title: block === "warmup" ? "Warm-up Library" : "Cool-down Library",
      source,
      toItem: (it) => ({ name: it.name, duration: it.duration, cue: it.cue }),
      filters: [],
      matchFilter: () => true,
      renderMeta: (it) => <div className="text-[10px] text-zinc-500 uppercase tracking-widest">{it.duration}</div>,
    };
  }, [block]);

  /** Filter results by search query and category filter */
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return config.source.filter((ex) => {
      if (!config.matchFilter(ex, filter)) return false;
      if (!q) return true;
      const hay = [ex.name, ex.pattern, ...(ex.parts || []), ...(ex.equipment || []), ex.cue].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [query, filter, config]);

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex items-start justify-center p-4">
        <div className="w-full max-w-2xl rounded-2xl border border-gold/40 bg-carbon shadow-gold overflow-hidden my-4">
          {/* Header */}
          <div className="p-4 border-b border-white/10 sticky top-0 bg-carbon z-10">
            <div className="text-[10px] uppercase tracking-widest text-gold">Library</div>
            <div className="display text-2xl text-white">{config.title}</div>
            {addedNames.size > 0 && (
              <div className="text-[11px] text-gold/80 mt-1">{addedNames.size} added to this section</div>
            )}
          </div>

          {/* Search & filters */}
          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2">
              <Icon name="search" className="w-4 h-4 text-zinc-500" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Search ${config.title.toLowerCase()}…`}
                className="flex-1 bg-transparent outline-none text-sm placeholder-zinc-600"
              />
              {query && <button onClick={() => setQuery("")} className="text-zinc-500 hover:text-white text-xs">clear</button>}
            </div>
            {config.filters.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {config.filters.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setFilter(f.id)}
                    className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded border ${filter === f.id ? "border-gold bg-gold/20 text-gold" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            )}

            {/* Results grid */}
            {results.length === 0 ? (
              <div className="text-sm text-zinc-500 italic py-8 text-center">No matches. Try clearing the filter.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[55vh] overflow-y-auto pr-1">
                {results.map((it, i) => {
                  const added = addedNames.has(it.name);
                  return (
                    <button
                      key={`${it.name}-${i}`}
                      onClick={() => handlePick(config.toItem(it), it.name)}
                      className={`text-left rounded-lg border p-3 transition ${added ? "border-gold/60 bg-gold/10" : "border-white/10 bg-black/30 hover:border-gold/50 hover:bg-gold/5"}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-sm font-semibold text-white">{it.name}</div>
                        {added
                          ? <Icon name="check" className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                          : <Icon name="plus" className="w-4 h-4 text-gold shrink-0 mt-0.5" />}
                      </div>
                      {config.renderMeta(it)}
                      {it.cue && <div className="text-[10px] text-gold/70 italic mt-1 line-clamp-2">"{it.cue}"</div>}
                      {added && <div className="text-[10px] text-gold mt-1 uppercase tracking-widest">Added · tap to add another</div>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 sticky bottom-0 bg-carbon">
            <button
              onClick={onClose}
              className="w-full rounded-xl bg-gradient-to-r from-ember to-emberbright text-black px-5 py-3 font-black display text-lg shadow-ember hover:brightness-110"
            >
              Done{addedNames.size > 0 ? ` · ${addedNames.size} added` : ""}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
