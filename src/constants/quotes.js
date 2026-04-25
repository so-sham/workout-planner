/**
 * @module constants/quotes
 * @description Contextual motivational quotes shown after workout generation.
 * Keyed by training context (max effort, deload, olympic, or default).
 */

/**
 * Motivational quotes organised by training context.
 * The generator picks a random quote from the matching bucket.
 * @type {Object<string, string[]>}
 */
export const CONTEXTUAL_QUOTES = {
  max: [
    "This is where champions are made.",
    "Heavy. Hungry. Hold the line.",
    "One more rep is the whole story.",
  ],
  deload: [
    "Light weight, baby — feel the technique.",
    "Recovery is part of the work.",
    "Plant the seeds. Don't dig them up.",
  ],
  olympic: [
    "Speed under the bar wins medals.",
    "Trust the position. Trust the pull.",
    "Be loud. Be fast. Be tall.",
  ],
  default: [
    "Earn it.",
    "No half measures.",
    "Quiet work. Loud results.",
    "Body forged in iron, mind in fire.",
  ],
};
