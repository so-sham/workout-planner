/**
 * @module utils/helpers
 * @description Pure utility functions used throughout the app.
 * Includes ID generation, date formatting, exercise matching,
 * 1RM estimation, and program normalisation.
 */

import { EXERCISE_ALIASES, KEY_LIFTS } from '../constants/exercises';
import { BODY_PARTS } from '../constants/categories';
import { CONTEXTUAL_QUOTES } from '../constants/quotes';

// ─── Day-of-Week Lookups ────────────────────────────────────────────────────

/** @type {string[]} Abbreviated day labels (Sun-indexed) */
export const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** @type {string[]} Full day names (Sun-indexed) */
export const DOW_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Map three-letter lowercase abbreviation → numeric index (0=Sun).
 * @type {Object<string, number>}
 */
export const DOW_SHORT_TO_INDEX = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };

// ─── Identity & Time ────────────────────────────────────────────────────────

/**
 * Generate a short, collision-resistant unique ID.
 * Combines Math.random base-36 with a timestamp suffix.
 * @returns {string} 16-char alphanumeric ID
 */
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/**
 * Get today's date as an ISO 8601 date string (YYYY-MM-DD).
 * @returns {string} e.g. "2026-04-25"
 */
export const todayISO = () => new Date().toISOString().slice(0, 10);

// ─── Exercise Name Resolution ───────────────────────────────────────────────

/**
 * Resolve a free-text exercise name to its canonical KEY_LIFTS form.
 * First checks the EXERCISE_ALIASES map, then does a substring match
 * against KEY_LIFTS. Returns null if no match is found.
 *
 * @param {string} name - Raw exercise name (e.g. "barbell bench", "rdl")
 * @returns {string|null} Canonical name (e.g. "Bench Press") or null
 */
export const normalizeExerciseName = (name) => {
  if (!name) return null;
  const k = name.trim().toLowerCase();
  if (EXERCISE_ALIASES[k]) return EXERCISE_ALIASES[k];
  for (const lift of KEY_LIFTS) {
    if (k.includes(lift.toLowerCase())) return lift;
  }
  return null;
};

// ─── Strength Calculations ──────────────────────────────────────────────────

/**
 * Estimate 1RM using the Epley formula: weight × (1 + reps / 30).
 * @param {number} w - Weight lifted
 * @param {number} r - Number of reps completed
 * @returns {number} Estimated 1RM, rounded to nearest integer
 */
export const epley = (w, r) => Math.round(Number(w) * (1 + Number(r) / 30));

// ─── Body-Part Inference ────────────────────────────────────────────────────

/**
 * Infer which body parts an exercise targets based on its name.
 * Uses regex pattern matching against common exercise naming conventions.
 *
 * @param {string} name - Exercise name (e.g. "Back Squat", "DB Curl")
 * @returns {string[]} Array of body-part IDs (e.g. ["legs", "lower"]); defaults to ["full"]
 */
export const inferBodyParts = (name) => {
  const n = (name || "").toLowerCase();
  const parts = [];
  if (/squat|lunge|leg press|step.up|deadlift|rdl|hip thrust|glute|calf/.test(n)) parts.push("legs", "lower");
  if (/bench|push.up|press|dip|chest fly/.test(n)) parts.push("push", "chest", "upper");
  if (/row|pull.up|pulldown|chin.up|curl|face pull/.test(n)) parts.push("pull", "back", "upper");
  if (/shoulder|overhead|lateral|raise|shrug/.test(n)) parts.push("shoulders", "upper");
  if (/curl|tricep/.test(n)) parts.push("arms");
  if (/plank|crunch|sit.up|toes.to|leg raise|russian|ab wheel/.test(n)) parts.push("core");
  if (/glute|hip thrust|bridge/.test(n)) parts.push("glutes", "posterior");
  if (/deadlift|rdl|good morning|kettlebell swing/.test(n)) parts.push("posterior", "back");
  return parts.length ? parts : ["full"];
};

/**
 * Check whether an exercise name matches the requested body-part focus.
 * Returns true if focus includes "full" or if any of the exercise's
 * inferred parts overlap with the focus list.
 *
 * @param {string} name - Exercise name
 * @param {string[]} focus - Array of body-part IDs the user selected
 * @returns {boolean}
 */
export const matchesBodyParts = (name, focus) => {
  if (!focus || focus.includes("full")) return true;
  const parts = inferBodyParts(name);
  return focus.some((f) => parts.includes(f));
};

// ─── Formatting ─────────────────────────────────────────────────────────────

/**
 * Format an ISO date string into a short, human-readable form.
 * @param {string} d - ISO date string (e.g. "2026-04-25")
 * @returns {string} Formatted date (e.g. "Fri, Apr 25")
 */
export const formatDate = (d) => {
  try {
    return new Date(d).toLocaleDateString(undefined, {
      weekday: "short", month: "short", day: "numeric",
    });
  } catch {
    return d;
  }
};

/**
 * Format a duration in milliseconds to M:SS.
 * @param {number} ms - Duration in milliseconds
 * @returns {string} e.g. "45:07"
 */
export const formatDuration = (ms) => {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
};

// ─── Quote Picker ───────────────────────────────────────────────────────────

/**
 * Pick a random element from an array.
 * @template T
 * @param {T[]} arr
 * @returns {T}
 */
export const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Select a contextually appropriate motivational quote based on
 * the current training parameters (intensity, cycle, categories).
 *
 * @param {Object} params
 * @param {string} params.cycle - Current periodization cycle
 * @param {string} params.intensity - Current intensity level
 * @param {string[]} [params.categories] - Selected category IDs
 * @returns {string} A motivational quote string
 */
export const pickQuote = ({ cycle, intensity, categories }) => {
  if (intensity === "max") return rand(CONTEXTUAL_QUOTES.max);
  if (cycle === "deload") return rand(CONTEXTUAL_QUOTES.deload);
  if ((categories || []).includes("olympic")) return rand(CONTEXTUAL_QUOTES.olympic);
  return rand(CONTEXTUAL_QUOTES.default);
};

// ─── Category Guessing ──────────────────────────────────────────────────────

/**
 * Guess a workout's category from its title using keyword matching.
 * Used in History filtering when the original category isn't stored.
 *
 * @param {string} title - Workout title
 * @returns {string} Best-guess category ID (e.g. "barbell", "hyrox")
 */
export const guessCategory = (title) => {
  const t = (title || "").toLowerCase();
  if (/hyrox/.test(t)) return "hyrox";
  if (/crossfit|wod|amrap|emom/.test(t)) return "crossfit";
  if (/circuit/.test(t)) return "circuit";
  if (/hiit/.test(t)) return "hiit";
  if (/olympic|snatch|clean|jerk/.test(t)) return "olympic";
  if (/dumbbell|db /.test(t)) return "dumbbell";
  if (/barbell/.test(t)) return "barbell";
  if (/cardio|run|row|bike/.test(t)) return "gymcardio";
  return "fullgym";
};

// ─── Array Shuffle ──────────────────────────────────────────────────────────

/**
 * Create a shuffled copy of an array using the Fisher–Yates algorithm.
 * Does NOT mutate the original array.
 *
 * @template T
 * @param {T[]} arr - Array to shuffle
 * @returns {T[]} New array with elements in random order
 */
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Program Normalisation ──────────────────────────────────────────────────

/**
 * Normalise a stored workout plan/program into the canonical "program" shape.
 * Handles three cases:
 *   1. Already a program with `.days` → returns as-is
 *   2. "weekly" type with `.days` → converts each day to program format
 *   3. Single plan (no type) → wraps in a one-day program
 *
 * @param {Object} record - Raw plan record from storage
 * @returns {Object} Normalised program with `{ type: "program", days: [...] }`
 */
export const normalizeProgram = (record) => {
  if (!record) return record;
  if (record.type === "program" && Array.isArray(record.days)) return record;
  if (record.type === "weekly" && Array.isArray(record.days)) {
    return {
      ...record,
      type: "program",
      days: record.days.map((d) => ({
        id: d.id || uid(),
        label: d.day || d.label || "Day",
        dow: d.dow != null ? d.dow : DOW_SHORT_TO_INDEX[(d.day || "").toLowerCase()] ?? null,
        focus: d.focus || "",
        isRest: !!d.isRest,
        plan: d.isRest ? null : d.plan || null,
      })),
    };
  }
  const plan = record.plan || null;
  return {
    ...record,
    type: "program",
    days: [
      {
        id: uid(),
        label: plan?.title || "Day 1",
        dow: null,
        focus: "",
        isRest: false,
        plan,
      },
    ],
  };
};

// ─── Workout Stats ──────────────────────────────────────────────────────────

/**
 * Compute aggregate statistics for a workout session.
 * Counts only sets marked as done.
 *
 * @param {Object} session - Active workout session object
 * @param {Array} session.sets - Array of exercise entries with nested set rows
 * @returns {{setCount: number, tonnage: number, repCount: number}}
 */
export function computeStats(session) {
  let setCount = 0, tonnage = 0, repCount = 0;
  for (const ex of session.sets) {
    for (const s of ex.sets) {
      if (!s.done) continue;
      setCount++;
      const w = Number(s.weight) || 0;
      const r = Number(s.reps) || 0;
      tonnage += w * r;
      repCount += r;
    }
  }
  return { setCount, tonnage: Math.round(tonnage), repCount };
}
