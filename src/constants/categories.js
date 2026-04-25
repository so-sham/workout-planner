/**
 * @module constants/categories
 * @description Workout category definitions, groupings, and body-part focus options.
 * These drive the Generator UI's category selection and body-part toggles.
 */

/**
 * All available workout categories.
 * Each category belongs to a group (strength / conditioning / cardio)
 * and carries a short marketing blurb for the UI cards.
 * @type {Array<{id: string, label: string, blurb: string, group: string}>}
 */
export const CATEGORIES = [
  { id: "barbell", label: "Barbell Strength", blurb: "Iron meets intent.", group: "strength" },
  { id: "dumbbell", label: "Dumbbell Strength", blurb: "Unilateral dominance.", group: "strength" },
  { id: "compound", label: "Compound Lifts", blurb: "Big 4. No fluff.", group: "strength" },
  { id: "olympic", label: "Olympic Lifts", blurb: "Snatch. Clean. Jerk.", group: "strength" },
  { id: "hiit", label: "HIIT", blurb: "Redline on demand.", group: "conditioning" },
  { id: "circuit", label: "Circuit Training", blurb: "Flow state programming.", group: "conditioning" },
  { id: "hyrox", label: "Hyrox-Style", blurb: "Functional fitness racing.", group: "conditioning" },
  { id: "crossfit", label: "CrossFit", blurb: "WODs, AMRAPs, EMOMs.", group: "conditioning" },
  { id: "fullgym", label: "Full Gym", blurb: "Use every tool in the room.", group: "strength" },
  { id: "gymcardio", label: "Gym Cardio", blurb: "Treadmill, rower, bike, erg.", group: "cardio" },
  { id: "floorcardio", label: "Floor Cardio", blurb: "No machines. Just you.", group: "cardio" },
];

/**
 * High-level category groups used to visually section the category picker.
 * @type {Array<{id: string, label: string}>}
 */
export const CATEGORY_GROUPS = [
  { id: "strength", label: "Strength" },
  { id: "conditioning", label: "Conditioning" },
  { id: "cardio", label: "Cardio" },
];

/**
 * Selectable body-part focus options.
 * "full" is the default — selecting any specific part deselects "full".
 * @type {Array<{id: string, label: string}>}
 */
export const BODY_PARTS = [
  { id: "full", label: "Full Body" },
  { id: "upper", label: "Upper" },
  { id: "lower", label: "Lower" },
  { id: "push", label: "Push" },
  { id: "pull", label: "Pull" },
  { id: "legs", label: "Legs" },
  { id: "chest", label: "Chest" },
  { id: "back", label: "Back" },
  { id: "shoulders", label: "Shoulders" },
  { id: "arms", label: "Arms" },
  { id: "core", label: "Core" },
  { id: "glutes", label: "Glutes" },
  { id: "posterior", label: "Posterior Chain" },
];
