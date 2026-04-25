/**
 * @module constants/training
 * @description Training parameter options and prescriptions.
 * Defines intensity levels, experience levels, periodization cycles,
 * and the rep/set/load prescriptions for each.
 */

/**
 * Intensity levels for workout generation.
 * Maps to load percentages via INTENSITY_LOAD.
 * @type {Array<{id: string, label: string}>}
 */
export const INTENSITIES = [
  { id: "light", label: "Light" },
  { id: "moderate", label: "Moderate" },
  { id: "heavy", label: "Heavy" },
  { id: "max", label: "Max Effort" },
];

/**
 * Athlete experience levels — affects exercise count and complexity.
 * @type {Array<{id: string, label: string}>}
 */
export const LEVELS = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
  { id: "elite", label: "Elite" },
];

/**
 * Periodization cycles that govern rep ranges, tempos, and rest periods.
 * @type {Array<{id: string, label: string}>}
 */
export const CYCLES = [
  { id: "hypertrophy", label: "Hypertrophy" },
  { id: "strength", label: "Strength" },
  { id: "power", label: "Power" },
  { id: "deload", label: "Deload" },
  { id: "endurance", label: "Endurance" },
  { id: "competition", label: "Competition Prep" },
];

/**
 * Prescribed sets, reps, tempo, and rest for each periodization cycle.
 * Used by the local (offline) workout generator.
 * @type {Object<string, {sets: number, reps: string, tempo: string, rest: string}>}
 */
export const CYCLE_PRESCRIPTION = {
  hypertrophy: { sets: 4, reps: "8-12", tempo: "3-1-1-0", rest: "60-90s" },
  strength: { sets: 5, reps: "3-5", tempo: "2-1-1-0", rest: "2-3 min" },
  power: { sets: 5, reps: "1-3", tempo: "X-1-1-0", rest: "3 min" },
  deload: { sets: 3, reps: "8-10", tempo: "2-1-1-0", rest: "60s" },
  endurance: { sets: 3, reps: "12-20", tempo: "2-0-1-0", rest: "45s" },
  competition: { sets: 4, reps: "2-3", tempo: "X-1-1-0", rest: "3 min" },
};

/**
 * Load ranges (% of 1RM) corresponding to each intensity level.
 * @type {Object<string, string>}
 */
export const INTENSITY_LOAD = {
  light: "55-65% 1RM",
  moderate: "65-75% 1RM",
  heavy: "75-85% 1RM",
  max: "85-95% 1RM",
};

/**
 * Conditioning-specific prescriptions (work/rest intervals and rounds)
 * keyed by intensity level.
 * @type {Object<string, {work: string, rest: string, rounds: number}>}
 */
export const CONDITIONING_PRESCRIPTION = {
  light: { work: "30s", rest: "60s", rounds: 6 },
  moderate: { work: "40s", rest: "40s", rounds: 8 },
  heavy: { work: "45s", rest: "30s", rounds: 10 },
  max: { work: "60s", rest: "30s", rounds: 10 },
};
