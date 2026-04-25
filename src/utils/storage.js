/**
 * @module utils/storage
 * @description Persistence layer for all app data.
 * Wraps localStorage behind a `window.storage` shim and provides typed
 * CRUD functions for settings, workout plans, schedules, workout logs, and PRs.
 *
 * All data is stored as JSON in localStorage. Keys use a namespaced format
 * (e.g. "workouts:2026-04-25:abc123") to allow easy enumeration.
 */

import { uid, normalizeProgram } from './helpers';

// ─── Storage Shim ───────────────────────────────────────────────────────────

/**
 * Initialise the global `window.storage` shim over localStorage.
 * Provides a consistent API with a `keys()` method for iteration.
 * Safe to call multiple times — no-ops if already initialised.
 */
function initStorageShim() {
  if (window.storage && typeof window.storage.getItem === "function") return;
  const ls = window.localStorage;
  window.storage = {
    getItem: (k) => ls.getItem(k),
    setItem: (k, v) => ls.setItem(k, v),
    removeItem: (k) => ls.removeItem(k),
    keys: () => {
      const out = [];
      for (let i = 0; i < ls.length; i++) out.push(ls.key(i));
      return out;
    },
  };
}

// Initialise on module load
initStorageShim();

// ─── Storage Key Generators ─────────────────────────────────────────────────

/**
 * Namespaced key generators for each data type.
 * @type {Object}
 */
export const STORAGE_KEYS = {
  /** @param {string} date - ISO date @param {string} id - Workout ID */
  workout: (date, id) => `workouts:${date}:${id}`,
  /** @param {string} ex - Canonical exercise name */
  pr: (ex) => `prs:${ex}`,
  /** Settings singleton key */
  settings: "profile:settings",
  /** @param {string} id - Plan ID */
  plan: (id) => `plans:${id}`,
  /** @param {string} date - ISO date */
  schedule: (date) => `schedule:${date}`,
};

// ─── Settings ───────────────────────────────────────────────────────────────

/**
 * Default user settings applied when no saved settings exist.
 * @type {Object}
 */
export const DEFAULT_SETTINGS = {
  apiKey: "",
  defaultLevel: "intermediate",
  defaultIntensity: "moderate",
  defaultCycle: "hypertrophy",
  favoriteCategories: ["barbell"],
  preferLocalCoach: false,
  defaultPlanMode: "single",
  defaultDaysPerWeek: 4,
  defaultBodyParts: ["full"],
  defaultSessionCount: 1,
};

/**
 * Load user settings from storage, merged with defaults.
 * Handles corrupted JSON gracefully by returning defaults.
 *
 * @returns {Object} Complete settings object
 */
export const loadSettings = () => {
  try {
    const raw = window.storage.getItem(STORAGE_KEYS.settings);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
};

/**
 * Persist user settings to storage.
 * @param {Object} s - Settings object to save
 */
export const saveSettings = (s) =>
  window.storage.setItem(STORAGE_KEYS.settings, JSON.stringify(s));

// ─── Plans (Workout Programs) ───────────────────────────────────────────────

/**
 * Load all saved workout plans, sorted newest-first.
 * Each plan is normalised to the canonical "program" shape.
 *
 * @returns {Object[]} Array of normalised plan objects
 */
export const loadAllPlans = () => {
  const out = [];
  for (const k of window.storage.keys()) {
    if (!k.startsWith("plans:")) continue;
    try {
      const parsed = JSON.parse(window.storage.getItem(k));
      out.push(normalizeProgram(parsed));
    } catch { /* skip corrupted entries */ }
  }
  return out.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
};

/**
 * Save a workout plan to storage. Adds/updates timestamps automatically.
 *
 * @param {Object} p - Plan object (must have `.id`)
 * @returns {Object} The saved plan with updated timestamps
 */
export const savePlan = (p) => {
  const next = { ...p, updatedAt: Date.now() };
  if (!next.createdAt) next.createdAt = next.updatedAt;
  window.storage.setItem(STORAGE_KEYS.plan(next.id), JSON.stringify(next));
  return next;
};

/**
 * Delete a workout plan and remove all its schedule references.
 * @param {string} id - Plan ID to delete
 */
export const deletePlan = (id) => {
  window.storage.removeItem(STORAGE_KEYS.plan(id));
  // Prune dangling schedule references
  for (const k of window.storage.keys()) {
    if (!k.startsWith("schedule:")) continue;
    try {
      const arr = JSON.parse(window.storage.getItem(k)) || [];
      const next = arr.filter((e) => e.planId !== id);
      if (next.length !== arr.length) {
        if (next.length === 0) window.storage.removeItem(k);
        else window.storage.setItem(k, JSON.stringify(next));
      }
    } catch { /* skip corrupted entries */ }
  }
};

// ─── Schedule (Calendar Entries) ────────────────────────────────────────────

/**
 * Load schedule entries for a specific date.
 * @param {string} date - ISO date string
 * @returns {Array} Array of schedule entry objects
 */
export const loadSchedule = (date) => {
  try {
    const raw = window.storage.getItem(STORAGE_KEYS.schedule(date));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

/**
 * Overwrite the schedule for a specific date.
 * Removes the key entirely if the array is empty.
 *
 * @param {string} date - ISO date string
 * @param {Array} arr - Schedule entries
 */
export const writeSchedule = (date, arr) => {
  if (!arr || arr.length === 0) window.storage.removeItem(STORAGE_KEYS.schedule(date));
  else window.storage.setItem(STORAGE_KEYS.schedule(date), JSON.stringify(arr));
};

/**
 * Add a workout plan to a date's schedule.
 *
 * @param {string} date - ISO date string
 * @param {string} planId - Plan ID to schedule
 * @param {string|null} dayKey - Specific day within the plan (for multi-day programs)
 */
export const addToSchedule = (date, planId, dayKey) => {
  const arr = loadSchedule(date);
  arr.push({ id: uid(), planId, dayKey: dayKey || null, addedAt: Date.now() });
  writeSchedule(date, arr);
};

/**
 * Remove a specific schedule entry by its unique entry ID.
 *
 * @param {string} date - ISO date string
 * @param {string} entryId - Schedule entry ID to remove
 */
export const removeFromSchedule = (date, entryId) => {
  const arr = loadSchedule(date).filter((e) => e.id !== entryId);
  writeSchedule(date, arr);
};

/**
 * Load the entire schedule map (all dates → entries).
 * Used for rendering the calendar view.
 *
 * @returns {Object<string, Array>} Map of ISO dates to schedule entry arrays
 */
export const loadAllSchedule = () => {
  const map = {};
  for (const k of window.storage.keys()) {
    if (!k.startsWith("schedule:")) continue;
    const date = k.slice("schedule:".length);
    try {
      map[date] = JSON.parse(window.storage.getItem(k)) || [];
    } catch { /* skip corrupted entries */ }
  }
  return map;
};

// ─── Workouts (Logged Sessions) ─────────────────────────────────────────────

/**
 * Load all completed workout records, sorted newest-first.
 * @returns {Object[]} Array of workout records
 */
export const loadAllWorkouts = () => {
  const out = [];
  for (const k of window.storage.keys()) {
    if (!k.startsWith("workouts:")) continue;
    try {
      out.push(JSON.parse(window.storage.getItem(k)));
    } catch { /* skip corrupted entries */ }
  }
  return out.sort((a, b) => (b.finishedAt || 0) - (a.finishedAt || 0));
};

/**
 * Save a completed workout record.
 * @param {Object} w - Workout record (must have `.date` and `.id`)
 */
export const saveWorkout = (w) => {
  window.storage.setItem(STORAGE_KEYS.workout(w.date, w.id), JSON.stringify(w));
};

/**
 * Delete a completed workout record.
 * @param {string} date - ISO date of the workout
 * @param {string} id - Workout ID
 */
export const deleteWorkout = (date, id) =>
  window.storage.removeItem(STORAGE_KEYS.workout(date, id));

// ─── Personal Records (PRs) ────────────────────────────────────────────────

/**
 * Load all personal records, keyed by canonical exercise name.
 * @returns {Object<string, Object>} Map of exercise name → PR record
 */
export const loadPRs = () => {
  const out = {};
  for (const k of window.storage.keys()) {
    if (!k.startsWith("prs:")) continue;
    const ex = k.slice("prs:".length);
    try {
      out[ex] = JSON.parse(window.storage.getItem(k));
    } catch { /* skip corrupted entries */ }
  }
  return out;
};

/**
 * Save a personal record for a specific exercise.
 * @param {string} ex - Canonical exercise name
 * @param {Object} pr - PR data (weight, reps, estimated1RM, date)
 */
export const savePR = (ex, pr) =>
  window.storage.setItem(STORAGE_KEYS.pr(ex), JSON.stringify(pr));
