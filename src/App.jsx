/**
 * @module App
 * @description Root application component for FORGE — AI Celebrity Personal Trainer.
 *
 * Manages:
 * - Tab-based navigation (Generate, Train, Plan, History, Progress)
 * - Global state: user settings, current generated plan, active workout session
 * - Toast notifications
 * - Settings modal
 * - Workout lifecycle (start → log → finish → save → PR detection)
 *
 * @returns {JSX.Element}
 */
import { useState, useEffect, useReducer, Suspense, lazy } from 'react';
import { loadSettings, saveSettings, savePlan, saveWorkout, loadPRs, savePR } from './utils/storage';
import { uid, todayISO, normalizeExerciseName, epley, computeStats, DOW_SHORT_TO_INDEX } from './utils/helpers';
import Icon from './components/Icon';

const Generator = lazy(() => import('./components/generator/Generator'));
const ActiveWorkout = lazy(() => import('./components/logger/ActiveWorkout'));
const Planner = lazy(() => import('./components/planner/Planner'));
const History = lazy(() => import('./components/history/History'));
const Progress = lazy(() => import('./components/progress/Progress'));
const SettingsModal = lazy(() => import('./components/settings/SettingsModal'));

export default function App() {
  // ── Global state ────────────────────────────────────────────────────────
  const [tab, setTab] = useState("generator");
  const [settings, setSettings] = useState(loadSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [activeSession, setActiveSession] = useState(null);
  const [refreshCounter, bumpRefresh] = useReducer((x) => x + 1, 0);
  const [toast, setToast] = useState(null);

  /** Persist settings to storage whenever they change */
  useEffect(() => { saveSettings(settings); }, [settings]);

  /** Auto-dismiss toast after 3.5 seconds */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  /**
   * Display a toast notification.
   * @param {string} msg - Message text
   * @param {string} [color="gold"] - Toast colour theme ("gold" or other)
   */
  const showToast = (msg, color = "gold") => setToast({ msg, color });

  /**
   * Start a new workout session from a generated or saved plan.
   * Initialises per-exercise set tracking with prescribed values.
   *
   * @param {Object} plan - Workout plan with mainBlock exercises
   * @param {Object} [meta] - Optional metadata (weeklyDay, focus, etc.)
   */
  const startWorkout = (plan, meta) => {
    if (!plan) return;
    const sets = (plan.mainBlock || []).map((ex, i) => ({
      id: uid(),
      exerciseIndex: i,
      name: ex.name,
      prescribed: { sets: ex.sets, reps: ex.reps, load: ex.load },
      cue: ex.cue,
      tempo: ex.tempo,
      rest: ex.rest,
      status: "pending",
      substitution: "",
      note: "",
      sets: Array.from({ length: Number(ex.sets) || 1 }).map(() => ({
        weight: "", reps: "", done: false,
      })),
    }));
    setActiveSession({
      id: uid(),
      plan,
      startedAt: Date.now(),
      sets,
      meta: meta || {},
    });
    setTab("logger");
  };

  /**
   * Finish and save the current workout session.
   * Computes stats, persists the record, checks for PRs, and navigates to History.
   *
   * @param {Object} session - Active session to finalise
   */
  const finishWorkout = (session) => {
    const date = todayISO();
    const stats = computeStats(session);
    const record = {
      id: session.id,
      date,
      startedAt: session.startedAt,
      finishedAt: Date.now(),
      durationMs: Date.now() - session.startedAt,
      plan: session.plan,
      sets: session.sets,
      stats,
      meta: session.meta || {},
    };
    saveWorkout(record);

    // PR detection
    const prs = loadPRs();
    const prHit = [];
    for (const ex of session.sets) {
      const norm = normalizeExerciseName(ex.name);
      if (!norm) continue;
      for (const s of ex.sets) {
        if (!s.done) continue;
        const w = Number(s.weight);
        const r = Number(s.reps);
        if (!w || !r) continue;
        const e1 = epley(w, r);
        const cur = prs[norm];
        if (!cur || e1 > cur.estimated1RM) {
          const next = { exercise: norm, weight: w, reps: r, estimated1RM: e1, date };
          savePR(norm, next);
          prs[norm] = next;
          prHit.push(norm);
        }
      }
    }

    setActiveSession(null);
    setTab("history");
    bumpRefresh();
    if (prHit.length) {
      showToast(`PR! ${prHit.join(", ")}`, "gold");
    } else {
      showToast(`Saved · ${stats.setCount} sets · ${stats.tonnage}kg`);
    }
  };

  /** Cancel the active workout session after confirmation */
  const cancelWorkout = () => {
    if (!confirm("Cancel this session? Logged sets will be lost.")) return;
    setActiveSession(null);
    setTab("generator");
  };

  /**
   * Save a generated plan to the user's library.
   * Prompts for a name and normalises the plan structure.
   *
   * @param {Object} plan - Plan to save
   * @param {string} [defaultName] - Default name for the prompt
   */
  const savePlanToLibrary = (plan, defaultName) => {
    const name = prompt("Save as…", defaultName || plan.title || "My Plan");
    if (!name) return;
    const days = plan.type === "weekly" && Array.isArray(plan.days)
      ? plan.days.map((d) => ({
          id: uid(),
          label: d.day || d.focus || "Day",
          dow: DOW_SHORT_TO_INDEX[(d.day || "").toLowerCase()] ?? null,
          focus: d.focus || "",
          isRest: !!d.isRest,
          plan: d.isRest ? null : d.plan || null,
        }))
      : [{
          id: uid(),
          label: plan.title || "Day 1",
          dow: null,
          focus: "",
          isRest: false,
          plan: { ...plan },
        }];
    const record = {
      id: uid(),
      type: "program",
      name,
      tagline: plan.tagline || "",
      days,
    };
    savePlan(record);
    bumpRefresh();
    showToast(`Saved "${name}" to library`);
  };

  /** Tab configuration for the navigation bar */
  const tabs = [
    { id: "generator", label: "Generate", icon: "flame" },
    { id: "logger", label: "Train", icon: "dumbbell", disabled: !activeSession },
    { id: "planner", label: "Plan", icon: "calendar" },
    { id: "history", label: "History", icon: "history" },
    { id: "progress", label: "Progress", icon: "chart" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-ink/85 backdrop-blur border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gold to-goldbright flex items-center justify-center text-ink">
              <Icon name="flame" className="w-4 h-4" />
            </div>
            <div>
              <div className="display text-xl text-white tracking-wider leading-none">FORGE</div>
              <div className="text-[10px] uppercase tracking-widest text-gold">AI Personal Trainer</div>
            </div>
            {activeSession && (
              <span className="ml-3 hidden sm:inline-flex items-center gap-2 text-xs text-gold">
                <span className="w-2 h-2 rounded-full bg-gold pulse-gold" />
                Session active
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-lg border border-white/10 p-2 hover:bg-white/5 text-zinc-300"
              title="Settings"
            >
              <Icon name="settings" className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="max-w-6xl mx-auto px-2 sm:px-4 flex gap-1 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              disabled={t.disabled}
              onClick={() => setTab(t.id)}
              className={`px-3 py-2 text-xs uppercase tracking-widest flex items-center gap-1.5 border-b-2 transition shrink-0 ${
                tab === t.id
                  ? "border-gold text-gold"
                  : t.disabled
                  ? "border-transparent text-zinc-700 cursor-not-allowed"
                  : "border-transparent text-zinc-400 hover:text-white"
              }`}
            >
              <Icon name={t.icon} className="w-3.5 h-3.5" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-20 text-gold/50">
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-gold to-goldbright flex items-center justify-center text-ink pulse-gold mb-4">
              <Icon name="flame" className="w-4 h-4" />
            </div>
            <p className="text-sm tracking-widest uppercase">Loading...</p>
          </div>
        }>
          {tab === "generator" && (
            <Generator
              settings={settings}
              setSettings={setSettings}
              currentPlan={currentPlan}
              onGenerated={setCurrentPlan}
              onStart={startWorkout}
              onSavePlan={savePlanToLibrary}
              showToast={showToast}
            />
          )}
          {tab === "logger" && activeSession && (
            <ActiveWorkout
              session={activeSession}
              setSession={setActiveSession}
              onFinish={finishWorkout}
              onCancel={cancelWorkout}
            />
          )}
          {tab === "planner" && (
            <Planner
              refreshCounter={refreshCounter}
              bumpRefresh={bumpRefresh}
              onStart={startWorkout}
              showToast={showToast}
            />
          )}
          {tab === "history" && <History refreshCounter={refreshCounter} bumpRefresh={bumpRefresh} />}
          {tab === "progress" && <Progress refreshCounter={refreshCounter} />}
        </Suspense>
      </main>

      {/* ── Settings Modal ─────────────────────────────────────────────── */}
      {settingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            settings={settings}
            setSettings={setSettings}
            onClose={() => setSettingsOpen(false)}
            showToast={showToast}
            bumpRefresh={bumpRefresh}
          />
        </Suspense>
      )}

      {/* ── Toast ──────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-2xl ${
            toast.color === "gold"
              ? "bg-gold text-ink"
              : "bg-steel border border-gold/30 text-white"
          }`}
        >
          {toast.msg}
        </div>
      )}
    </div>
  );
}
