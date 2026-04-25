/**
 * @module constants/plans
 * @description Plan mode definitions, weekly split templates, day-of-week mappings,
 * and warm-up/cool-down movement pools used by the generator.
 */

/**
 * Plan mode options shown in the Generator UI.
 * "single" generates one-off sessions; "weekly" generates a full Mon–Sun split.
 * @type {Array<{id: string, label: string, blurb: string}>}
 */
export const PLAN_MODES = [
  { id: "single", label: "One-off Session", blurb: "Today's workout." },
  { id: "weekly", label: "Weekly Plan", blurb: "Structured split, Mon–Sun." },
];

/** @type {string[]} Abbreviated day-of-week names */
export const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Pre-built weekly training splits keyed by number of training days (3–6).
 * Each entry is a 7-day array with focus areas and body-part tags.
 * Rest days are marked with `isRest: true`.
 * @type {Object<number, Array<{day: string, focus: string, parts?: string[], isRest?: boolean}>>}
 */
export const WEEKLY_SPLITS = {
  3: [
    { day: "Mon", focus: "Full Body A", parts: ["full"] },
    { day: "Tue", focus: "Rest", isRest: true },
    { day: "Wed", focus: "Full Body B", parts: ["full"] },
    { day: "Thu", focus: "Rest", isRest: true },
    { day: "Fri", focus: "Full Body C", parts: ["full"] },
    { day: "Sat", focus: "Active Recovery", isRest: true },
    { day: "Sun", focus: "Rest", isRest: true },
  ],
  4: [
    { day: "Mon", focus: "Upper", parts: ["upper"] },
    { day: "Tue", focus: "Lower", parts: ["lower"] },
    { day: "Wed", focus: "Rest", isRest: true },
    { day: "Thu", focus: "Upper", parts: ["upper"] },
    { day: "Fri", focus: "Lower", parts: ["lower"] },
    { day: "Sat", focus: "Rest", isRest: true },
    { day: "Sun", focus: "Rest", isRest: true },
  ],
  5: [
    { day: "Mon", focus: "Push", parts: ["push"] },
    { day: "Tue", focus: "Pull", parts: ["pull"] },
    { day: "Wed", focus: "Legs", parts: ["legs"] },
    { day: "Thu", focus: "Upper", parts: ["upper"] },
    { day: "Fri", focus: "Lower", parts: ["lower"] },
    { day: "Sat", focus: "Active Recovery", isRest: true },
    { day: "Sun", focus: "Rest", isRest: true },
  ],
  6: [
    { day: "Mon", focus: "Push", parts: ["push"] },
    { day: "Tue", focus: "Pull", parts: ["pull"] },
    { day: "Wed", focus: "Legs", parts: ["legs"] },
    { day: "Thu", focus: "Push", parts: ["push"] },
    { day: "Fri", focus: "Pull", parts: ["pull"] },
    { day: "Sat", focus: "Legs", parts: ["legs"] },
    { day: "Sun", focus: "Rest", isRest: true },
  ],
};

/**
 * Warm-up movements organised by training group.
 * The generator picks 4 random movements from the relevant pool(s).
 * @type {Object<string, Array<{name: string, duration: string, cue: string}>>}
 */
export const WARMUP_POOL = {
  strength: [
    { name: "World's Greatest Stretch", duration: "5/side", cue: "Open the hips. Rotate the ribs." },
    { name: "Hip CARs", duration: "5/side", cue: "Slow circles. Full range." },
    { name: "Glute Bridge", duration: "10 reps", cue: "Pause at the top. Squeeze." },
    { name: "Cat-Cow", duration: "8 reps", cue: "Move one segment at a time." },
    { name: "Empty-Bar Practice", duration: "1 round", cue: "Groove the lift. Set the cues." },
    { name: "Banded Pull-Apart", duration: "15 reps", cue: "Squeeze the shoulder blades." },
  ],
  conditioning: [
    { name: "Jog in Place", duration: "60s", cue: "Quiet feet. Easy pace." },
    { name: "Inchworm", duration: "6 reps", cue: "Reach long. Pause in plank." },
    { name: "Air Squat", duration: "15 reps", cue: "Sit back. Knees out." },
    { name: "A-Skip", duration: "30s", cue: "Drive the knee. Snappy arms." },
    { name: "Push-Up", duration: "10 reps", cue: "Plank tight. Full press." },
    { name: "Lateral Lunge", duration: "5/side", cue: "Sit into one hip. Stay tall." },
  ],
  cardio: [
    { name: "Easy Jog", duration: "2 min", cue: "Talk pace. Get the legs warm." },
    { name: "Skip Rope", duration: "60s", cue: "Soft, quick contacts." },
    { name: "Leg Swings", duration: "10/side", cue: "Front-back, then side-side." },
    { name: "High Knees", duration: "30s", cue: "Knees above the hip crease." },
    { name: "Dynamic Lunge", duration: "5/side", cue: "Long step. Sink the back knee." },
    { name: "Arm Circles", duration: "10 each way", cue: "Big circles. Open the chest." },
  ],
};

/**
 * Cool-down movements. The generator picks 3 random entries from this pool.
 * @type {Array<{name: string, duration: string, cue: string}>}
 */
export const COOLDOWN_POOL = [
  { name: "Box Breathing", duration: "2 min", cue: "Inhale 4, hold 4, exhale 4, hold 4." },
  { name: "Childs Pose", duration: "60s", cue: "Hips to heels. Reach long." },
  { name: "Couch Stretch", duration: "60s/side", cue: "Tall hips. Squeeze the glute." },
  { name: "Pigeon Pose", duration: "60s/side", cue: "Square the hips. Breathe into the stretch." },
  { name: "Foam Roll", duration: "5 min", cue: "Slow passes. Pause on hot spots." },
  { name: "90/90 Hip Switch", duration: "60s", cue: "Slow rotations. Stay tall." },
];
