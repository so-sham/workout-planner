/**
 * @module components/generator/Generator
 * @description Main workout generation form and results view.
 * Manages category selection, intensity/level/cycle pickers, body-part focus,
 * plan mode (single vs. weekly), and triggers workout generation via AI or local engine.
 * Displays the generated plan preview with Start and Save actions.
 *
 * @param {Object} props
 * @param {Object} props.settings - User settings (API key, defaults, etc.)
 * @param {Function} props.setSettings - Settings updater
 * @param {Object|null} props.currentPlan - Currently generated plan (or null)
 * @param {Function} props.onGenerated - Called with the new plan after generation
 * @param {Function} props.onStart - Called to start a workout session
 * @param {Function} props.onSavePlan - Called to save a plan to library
 * @param {Function} props.showToast - Toast notification function
 * @returns {JSX.Element}
 */
import { useState, useRef } from 'react';
import { CATEGORIES, CATEGORY_GROUPS, BODY_PARTS } from '../../constants/categories';
import { INTENSITIES, LEVELS, CYCLES } from '../../constants/training';
import { PLAN_MODES } from '../../constants/plans';
import { generateWorkoutAI, generateWorkoutLocal, generateOneDay, generateWeeklyPlan, generateMultiDayProgram } from '../../utils/ai';
import Icon from '../Icon';
import PillGroup from '../PillGroup';
import SkeletonPreview from './SkeletonPreview';
import PlanPreview from './PlanPreview';
import WeeklyPlanPreview from './WeeklyPlanPreview';

export default function Generator({ settings, setSettings, currentPlan, onGenerated, onStart, onSavePlan, showToast }) {
  // ── Local state for form inputs ────────────────────────────────────────
  const [categories, setCategories] = useState(settings.favoriteCategories?.length ? settings.favoriteCategories : ["barbell"]);
  const [intensity, setIntensity] = useState(settings.defaultIntensity);
  const [level, setLevel] = useState(settings.defaultLevel);
  const [cycle, setCycle] = useState(settings.defaultCycle);
  const [bodyParts, setBodyParts] = useState(settings.defaultBodyParts || ["full"]);
  const [planMode, setPlanMode] = useState(settings.defaultPlanMode || "single");
  const [daysPerWeek, setDaysPerWeek] = useState(settings.defaultDaysPerWeek || 4);
  const [sessionCount, setSessionCount] = useState(settings.defaultSessionCount || 1);
  const [loading, setLoading] = useState(false);
  const [extending, setExtending] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(null);
  const abortRef = useRef(null);

  /** Whether to use the offline coach (no API key or forced offline) */
  const useLocal = !settings.apiKey || settings.preferLocalCoach;

  /**
   * Toggle a category on/off. At least one category must remain selected.
   * @param {string} id - Category ID to toggle
   */
  const toggleCategory = (id) => {
    setCategories((curr) => {
      if (curr.includes(id)) {
        if (curr.length === 1) return curr;
        return curr.filter((c) => c !== id);
      }
      return [...curr, id];
    });
  };

  /**
   * Toggle a body-part filter. Selecting "full" clears all specific parts.
   * Selecting a specific part deselects "full". If all specific parts are
   * deselected, reverts to "full".
   * @param {string} id - Body-part ID to toggle
   */
  const toggleBodyPart = (id) => {
    setBodyParts((curr) => {
      if (id === "full") return ["full"];
      const without = curr.filter((p) => p !== "full");
      if (without.includes(id)) {
        const next = without.filter((p) => p !== id);
        return next.length ? next : ["full"];
      }
      return [...without, id];
    });
  };

  /**
   * Persist the current form choices back to settings for next session.
   */
  const persistChoices = () => {
    setSettings((s) => ({
      ...s,
      favoriteCategories: [...new Set(categories)].slice(0, 6),
      defaultIntensity: intensity,
      defaultLevel: level,
      defaultCycle: cycle,
      defaultBodyParts: bodyParts,
      defaultPlanMode: planMode,
      defaultDaysPerWeek: daysPerWeek,
      defaultSessionCount: sessionCount,
    }));
  };

  /**
   * Trigger workout generation based on the current form state.
   * Routes to single, multi-day, or weekly generation as appropriate.
   */
  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    setProgress(null);
    persistChoices();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const baseOpts = { categories, intensity, level, cycle, bodyParts };
    try {
      let plan;
      if (planMode === "weekly") {
        plan = await generateWeeklyPlan({ useLocal, apiKey: settings.apiKey, baseOpts, daysPerWeek, signal: ctrl.signal, onProgress: setProgress });
      } else if (sessionCount > 1) {
        plan = await generateMultiDayProgram({ useLocal, apiKey: settings.apiKey, baseOpts, dayCount: sessionCount, signal: ctrl.signal, onProgress: setProgress });
      } else {
        plan = useLocal
          ? await generateWorkoutLocal({ options: baseOpts })
          : await generateWorkoutAI({ apiKey: settings.apiKey, options: baseOpts, signal: ctrl.signal });
      }
      onGenerated(plan);
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || String(e));
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  /** Abort an in-progress generation request */
  const handleAbort = () => abortRef.current?.abort();

  /**
   * Add another workout day to the current plan.
   * If the current plan is a single session, promotes it to multi-day.
   */
  const handleGenerateMore = async () => {
    if (!currentPlan) return;
    setExtending(true);
    setError(null);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    const baseOpts = { categories, intensity, level, cycle, bodyParts };
    try {
      if (currentPlan.type === "weekly" && Array.isArray(currentPlan.days)) {
        const trainingDays = currentPlan.days.filter((d) => !d.isRest).length;
        const newDay = await generateOneDay({ useLocal, apiKey: settings.apiKey, baseOpts, signal: ctrl.signal, dayLabel: `Day ${trainingDays + 1}`, focus: null });
        const next = {
          ...currentPlan,
          days: [...currentPlan.days, newDay],
          title: /\d+-Session Program/.test(currentPlan.title)
            ? currentPlan.title.replace(/^\d+/, String(trainingDays + 1))
            : currentPlan.title,
        };
        onGenerated(next);
        showToast(`Added ${newDay.day}. ${next.days.length} workouts.`, "gold");
      } else {
        // Promote single → multi-day
        const day1 = { day: "Day 1", focus: currentPlan.title || "Day 1", isRest: false, plan: { ...currentPlan } };
        const newDay = await generateOneDay({ useLocal, apiKey: settings.apiKey, baseOpts, signal: ctrl.signal, dayLabel: "Day 2", focus: null });
        const cats = baseOpts.categories.map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ");
        const promoted = {
          type: "weekly",
          title: `2-Session Program — ${cats}`,
          tagline: "2 sessions. Stack the work.",
          days: [day1, newDay],
          _source: useLocal ? "local" : "ai",
        };
        onGenerated(promoted);
        showToast("Added Day 2. 2 workouts.", "gold");
      }
    } catch (e) {
      if (e.name !== "AbortError") setError(e.message || String(e));
    } finally {
      setExtending(false);
    }
  };

  return (
    <section className="space-y-6">
      {/* Status banner */}
      <div className={`rounded-2xl border p-4 sm:p-5 noise ${useLocal ? "border-ember/30 bg-ember/5" : "border-gold/30 bg-gold/5"}`}>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className={`display text-2xl ${useLocal ? "text-ember" : "text-gold"}`}>
              {useLocal ? "Offline coach engaged" : "AI coach standing by"}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {useLocal
                ? "No API key — using built-in pools. Open settings to add a key."
                : "Anthropic API key detected. Programs are written by Claude."}
            </div>
          </div>
          <div className={`text-[10px] uppercase tracking-widest ${useLocal ? "text-ember" : "text-gold"}`}>
            {useLocal ? "Offline" : "Online"}
          </div>
        </div>
      </div>

      {/* Category picker */}
      <div>
        <div className="flex items-baseline justify-between mb-1">
          <h2 className="display text-2xl text-white">Category</h2>
          <span className="text-xs text-gold">Stack your weapons · {categories.length} selected</span>
        </div>
        <div className="text-[11px] text-zinc-500 mb-3">Tap to stack multiple. At least one must stay selected.</div>
        <div className="space-y-3">
          {CATEGORY_GROUPS.map((g) => {
            const items = CATEGORIES.filter((c) => c.group === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id}>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">{g.label}</div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {items.map((c) => {
                    const i = categories.indexOf(c.id);
                    const active = i >= 0;
                    return (
                      <button
                        key={c.id}
                        onClick={() => toggleCategory(c.id)}
                        className={`relative text-left rounded-xl border p-3 transition ${active ? "border-gold/60 bg-gold/10" : "border-white/10 bg-steel/40 hover:border-white/30"}`}
                      >
                        {active && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-gold text-ink text-[10px] font-black flex items-center justify-center">
                            {i + 1}
                          </span>
                        )}
                        <div className="font-semibold text-white text-sm">{c.label}</div>
                        <div className="text-[11px] text-zinc-500 mt-0.5">{c.blurb}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Intensity / Level / Cycle */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <PillGroup title="Intensity" options={INTENSITIES} value={intensity} onChange={setIntensity} />
        <PillGroup title="Level" options={LEVELS} value={level} onChange={setLevel} />
        <PillGroup title="Cycle" options={CYCLES} value={cycle} onChange={setCycle} />
      </div>

      {/* Body-part focus */}
      <div>
        <h2 className="display text-2xl text-white mb-2">Body-Part Focus</h2>
        <div className="flex flex-wrap gap-1.5">
          {BODY_PARTS.map((b) => {
            const active = bodyParts.includes(b.id);
            return (
              <button
                key={b.id}
                onClick={() => toggleBodyPart(b.id)}
                className={`text-[11px] uppercase tracking-widest px-2.5 py-1.5 rounded border ${active ? "border-gold bg-gold/20 text-gold" : "border-white/10 text-zinc-300 hover:bg-white/5"}`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Plan mode */}
      <div>
        <h2 className="display text-2xl text-white mb-2">Plan Mode</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PLAN_MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setPlanMode(m.id)}
              className={`text-left rounded-xl border p-3 ${planMode === m.id ? "border-gold/60 bg-gold/10" : "border-white/10 bg-steel/40 hover:border-white/30"}`}
            >
              <div className="font-semibold text-white">{m.label}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{m.blurb}</div>
            </button>
          ))}
        </div>

        {planMode === "single" && (
          <div className="mt-3 rounded-xl border border-white/10 bg-steel/30 p-3">
            <div className="text-[10px] uppercase tracking-widest text-gold mb-1">Sessions to generate</div>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setSessionCount(n)}
                  className={`px-3 py-1.5 text-xs rounded border ${sessionCount === n ? "border-gold bg-gold/20 text-gold" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}
                >
                  {n} {n === 1 ? "session" : "sessions"}
                </button>
              ))}
            </div>
            <div className="mt-2 text-[11px] text-zinc-500">
              Bundle N workouts into one plan (e.g. a Hyrox prep block). Days of the week get
              assigned later from the calendar — or use "Add Another Workout" on a 2+ preview
              to extend as you go.
            </div>
          </div>
        )}

        {planMode === "weekly" && (
          <div className="mt-3 rounded-xl border border-white/10 bg-steel/30 p-3">
            <div className="text-[10px] uppercase tracking-widest text-gold mb-1">Training days per week</div>
            <div className="flex flex-wrap gap-1.5">
              {[3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  onClick={() => setDaysPerWeek(n)}
                  className={`px-3 py-1.5 text-xs rounded border ${daysPerWeek === n ? "border-gold bg-gold/20 text-gold" : "border-white/10 text-zinc-400 hover:bg-white/5"}`}
                >
                  {n} days
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Generate button */}
      <div className="flex gap-2">
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="flex-1 rounded-xl bg-gradient-to-r from-gold to-goldbright text-ink py-4 font-black display text-2xl tracking-wide shadow-gold disabled:opacity-50"
        >
          {loading
            ? (progress ? `Programming day ${progress.completed + 1}/${progress.total} — ${progress.day}…` : "Forging your session…")
            : "Generate Workout"}
        </button>
        {loading && (
          <button
            onClick={handleAbort}
            className="rounded-xl border border-ember/40 text-ember px-4 font-bold hover:bg-ember/10"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-ember/40 bg-ember/10 text-ember text-sm px-4 py-2.5">
          {error}
        </div>
      )}

      {/* Results */}
      {loading && !currentPlan && <SkeletonPreview />}

      {!loading && currentPlan && currentPlan.type === "weekly" && (
        <WeeklyPlanPreview
          plan={currentPlan}
          onStart={onStart}
          onSave={onSavePlan}
          onGenerateMore={handleGenerateMore}
          extending={extending}
        />
      )}
      {!loading && currentPlan && currentPlan.type !== "weekly" && (
        <PlanPreview plan={currentPlan} onStart={() => onStart(currentPlan)} onSave={onSavePlan} />
      )}

      {!loading && !currentPlan && (
        <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-zinc-500 text-sm">
          Dial in your inputs, then generate. The coach is warming up.
        </div>
      )}
    </section>
  );
}
