/**
 * @module constants/exercises
 * @description Complete exercise data: per-category movement pools (used by the
 * offline generator), the master exercise library (used by the plan editor's
 * movement picker), warm-up & cool-down libraries, key lift tracking list,
 * and exercise name aliases for PR normalisation.
 */

// ─── Per-Category Movement Pools ─────────────────────────────────────────────

/**
 * Exercises grouped by workout category, used by the local (offline) generator.
 * Each entry has a canonical exercise name and a coaching cue.
 * @type {Object<string, Array<{name: string, cue: string}>>}
 */
export const LOCAL_EXERCISES = {
  barbell: [
    { name: "Back Squat", cue: "Drive the floor away. Brace 360°." },
    { name: "Bench Press", cue: "Bar path over the sternum. Leg drive." },
    { name: "Deadlift", cue: "Bar against shins. Push hips forward." },
    { name: "Overhead Press", cue: "Squeeze the bar. Glutes locked." },
    { name: "Bent-Over Row", cue: "Hinge to 45°. Pull elbows past ribs." },
    { name: "Front Squat", cue: "Elbows high. Stay tall." },
    { name: "Romanian Deadlift", cue: "Hips back. Bar grazes legs." },
    { name: "Push Press", cue: "Dip, drive, lockout." },
  ],
  dumbbell: [
    { name: "DB Bench Press", cue: "Press in. Squeeze the chest." },
    { name: "DB Row", cue: "Pull to the hip. Don't shrug." },
    { name: "DB Goblet Squat", cue: "Heels down. Elbows inside knees." },
    { name: "DB Shoulder Press", cue: "Stack the wrist over the elbow." },
    { name: "DB Lunge", cue: "Knee tracks over the foot. Stand tall." },
    { name: "DB RDL", cue: "Soft knees. Push the wall back with your hips." },
    { name: "DB Curl", cue: "No swing. Squeeze the bicep top." },
    { name: "DB Lateral Raise", cue: "Lead with the elbow. Pause at parallel." },
  ],
  compound: [
    { name: "Back Squat", cue: "Drive the floor away. Brace 360°." },
    { name: "Bench Press", cue: "Bar path over the sternum. Leg drive." },
    { name: "Deadlift", cue: "Bar against shins. Push hips forward." },
    { name: "Overhead Press", cue: "Squeeze the bar. Glutes locked." },
    { name: "Pull-Up", cue: "Pull chest to the bar. Full hang." },
    { name: "Front Squat", cue: "Elbows high. Stay tall." },
  ],
  olympic: [
    { name: "Power Clean", cue: "Bar close. Triple extension. Catch tall." },
    { name: "Hang Clean", cue: "Pockets to lockout. Fast under." },
    { name: "Power Snatch", cue: "Wide grip. Bar accelerates off the hip." },
    { name: "Hang Snatch", cue: "Push the floor. Punch overhead." },
    { name: "Clean & Jerk", cue: "Rebend, drive, split. Stand it out." },
    { name: "Push Press", cue: "Dip, drive, lockout." },
    { name: "Split Jerk", cue: "Front foot forward. Press under." },
    { name: "Overhead Squat", cue: "Active shoulders. Open the chest." },
    { name: "Snatch Pull", cue: "Patience off the floor. Finish tall." },
    { name: "Clean Pull", cue: "Bar in close. Shrug at the top." },
    { name: "Snatch High Pull", cue: "Elbows high and outside." },
  ],
  hiit: [
    { name: "Burpee", cue: "Chest to deck. Jump and clap." },
    { name: "Box Jump", cue: "Land soft. Stand all the way up." },
    { name: "Mountain Climbers", cue: "Hips low. Drive the knees." },
    { name: "Jumping Lunge", cue: "Switch quick. Soft landings." },
    { name: "Push-Up", cue: "Body in a straight line. Full lockout." },
    { name: "Air Squat", cue: "Sit back. Knees out." },
  ],
  circuit: [
    { name: "Kettlebell Swing", cue: "Hike, snap, float. Glutes finish." },
    { name: "Goblet Squat", cue: "Heels down. Stay tall." },
    { name: "Push-Up", cue: "Plank tight. Full press." },
    { name: "Renegade Row", cue: "Don't twist. Row to the hip." },
    { name: "DB Thruster", cue: "Squat to press in one rhythm." },
    { name: "Reverse Lunge", cue: "Step long. Drive through the heel." },
  ],
  hyrox: [
    { name: "SkiErg 250m", cue: "Long pulls. Hips snap." },
    { name: "Sled Push 25m", cue: "Stay low. Short, fast steps." },
    { name: "Sled Pull 25m", cue: "Pull hand-over-hand. Lean back." },
    { name: "Burpee Broad Jump", cue: "Power up, jump out." },
    { name: "Rower 500m", cue: "Legs–back–arms. Reverse the order." },
    { name: "Farmer Carry 50m", cue: "Tall posture. Crush the handles." },
    { name: "Sandbag Lunges", cue: "Weight on the back. Knee taps the floor." },
    { name: "Wall Balls", cue: "Squat–throw. Catch and ride down." },
  ],
  crossfit: [
    { name: "Thruster", cue: "Front squat into a press. One motion." },
    { name: "Pull-Up", cue: "Chest to bar. Stay tight." },
    { name: "Box Jump", cue: "Hip extension. Stand tall up top." },
    { name: "Wall Ball", cue: "Squat below parallel. Drive through." },
    { name: "Toes-to-Bar", cue: "Kip rhythm. Toes to the metal." },
    { name: "KB Swing", cue: "Hinge. Snap the hips at lockout." },
    { name: "Burpee", cue: "Chest to deck. Stand and clap." },
    { name: "Power Clean", cue: "Triple extension. Land in a partial squat." },
  ],
  fullgym: [
    { name: "Back Squat", cue: "Drive the floor away. Brace 360°." },
    { name: "Bench Press", cue: "Bar over the sternum." },
    { name: "Cable Row", cue: "Pull to the belly button. Squeeze." },
    { name: "Lat Pulldown", cue: "Drive the elbows down and back." },
    { name: "Leg Press", cue: "Knees to chest. Drive through the heels." },
    { name: "Hip Thrust", cue: "Bar over the hips. Squeeze the glutes." },
    { name: "DB Curl", cue: "Slow eccentric. No swing." },
    { name: "Tricep Pushdown", cue: "Elbows pinned. Full lockout." },
  ],
  gymcardio: [
    { name: "Treadmill Intervals", cue: "Drive the knees. Quiet feet." },
    { name: "Rower 500m", cue: "Legs first. Smooth handle path." },
    { name: "Assault Bike", cue: "Punch and pull. Don't bounce." },
    { name: "Stairmill", cue: "Stand tall. Don't lean on the rails." },
    { name: "SkiErg", cue: "Hinge with the cables. Drive the elbows." },
    { name: "Echo Bike Sprint", cue: "All-out. Recover full." },
  ],
  floorcardio: [
    { name: "Run-in-Place", cue: "Drive the knees. Stay light." },
    { name: "Jumping Jacks", cue: "Reach overhead. Full extension." },
    { name: "High Knees", cue: "Knees above the hip crease." },
    { name: "Burpee", cue: "Chest to deck. Stand and clap." },
    { name: "Mountain Climber", cue: "Drive the knees. Hips low." },
    { name: "Jump Rope", cue: "Wrists, not arms. Soft landings." },
  ],
};

// ─── Master Exercise Library ─────────────────────────────────────────────────

/**
 * Full exercise library with movement patterns, body-part tags, equipment,
 * and default prescriptions. Used by the plan editor's MovementPicker.
 * @type {Array<{name: string, pattern: string, parts: string[], equipment: string[], defaults: Object}>}
 */
export const EXERCISE_LIBRARY = [
  { name: "Back Squat", pattern: "squat", parts: ["legs", "lower"], equipment: ["barbell"], defaults: { sets: 5, reps: "5", tempo: "3-1-1-0", rest: "2-3 min", load: "75-85% 1RM", cue: "Drive the floor away. Brace 360°." } },
  { name: "Front Squat", pattern: "squat", parts: ["legs", "lower"], equipment: ["barbell"], defaults: { sets: 4, reps: "5", tempo: "3-1-1-0", rest: "2 min", load: "70-80% 1RM", cue: "Elbows high. Stay tall." } },
  { name: "Deadlift", pattern: "hinge", parts: ["posterior", "lower", "back"], equipment: ["barbell"], defaults: { sets: 5, reps: "3", tempo: "1-0-1-0", rest: "3 min", load: "80-90% 1RM", cue: "Bar against shins. Push the floor away." } },
  { name: "Romanian Deadlift", pattern: "hinge", parts: ["posterior", "glutes"], equipment: ["barbell"], defaults: { sets: 4, reps: "8", tempo: "3-1-1-0", rest: "90s", load: "60-70% 1RM", cue: "Hips back. Bar grazes the legs." } },
  { name: "Bench Press", pattern: "push", parts: ["push", "chest", "upper"], equipment: ["barbell"], defaults: { sets: 5, reps: "5", tempo: "3-1-1-0", rest: "2-3 min", load: "75-85% 1RM", cue: "Bar over the sternum. Drive the legs." } },
  { name: "Incline Bench Press", pattern: "push", parts: ["push", "chest", "shoulders"], equipment: ["barbell"], defaults: { sets: 4, reps: "8", tempo: "3-1-1-0", rest: "90s", load: "65-75% 1RM", cue: "Press up and back. Squeeze the chest." } },
  { name: "Overhead Press", pattern: "push", parts: ["push", "shoulders"], equipment: ["barbell"], defaults: { sets: 5, reps: "5", tempo: "2-1-1-0", rest: "2 min", load: "65-75% 1RM", cue: "Squeeze the bar. Glutes locked." } },
  { name: "Push Press", pattern: "push", parts: ["push", "shoulders"], equipment: ["barbell"], defaults: { sets: 5, reps: "3", tempo: "X-1-1-0", rest: "2 min", load: "70-80% 1RM", cue: "Dip, drive, lockout." } },
  { name: "Pull-Up", pattern: "pull", parts: ["pull", "back", "upper"], equipment: ["bodyweight"], defaults: { sets: 4, reps: "6-10", tempo: "2-1-1-0", rest: "2 min", load: "BW", cue: "Chest to the bar. Full hang." } },
  { name: "Bent-Over Row", pattern: "pull", parts: ["pull", "back"], equipment: ["barbell"], defaults: { sets: 4, reps: "8", tempo: "3-1-1-0", rest: "90s", load: "60-70% 1RM", cue: "Hinge to 45°. Pull elbows past the ribs." } },
  { name: "DB Row", pattern: "pull", parts: ["pull", "back"], equipment: ["dumbbell"], defaults: { sets: 4, reps: "10", tempo: "2-1-1-0", rest: "60s", load: "moderate", cue: "Pull to the hip. Don't shrug." } },
  { name: "Lat Pulldown", pattern: "pull", parts: ["pull", "back"], equipment: ["machine"], defaults: { sets: 3, reps: "10-12", tempo: "2-1-1-0", rest: "60s", load: "moderate", cue: "Drive the elbows down and back." } },
  { name: "Power Clean", pattern: "olympic", parts: ["full", "posterior"], equipment: ["barbell"], defaults: { sets: 5, reps: "3", tempo: "X-0-1-0", rest: "2 min", load: "70-80% 1RM", cue: "Bar close. Triple extension. Catch tall." } },
  { name: "Power Snatch", pattern: "olympic", parts: ["full", "posterior"], equipment: ["barbell"], defaults: { sets: 5, reps: "2", tempo: "X-0-1-0", rest: "2-3 min", load: "65-75% 1RM", cue: "Wide grip. Bar accelerates off the hip." } },
  { name: "Clean & Jerk", pattern: "olympic", parts: ["full"], equipment: ["barbell"], defaults: { sets: 5, reps: "1+1", tempo: "X-0-1-0", rest: "3 min", load: "75-85% 1RM", cue: "Rebend, drive, split." } },
  { name: "Hip Thrust", pattern: "hinge", parts: ["glutes", "posterior"], equipment: ["barbell"], defaults: { sets: 4, reps: "8", tempo: "2-2-1-0", rest: "90s", load: "moderate", cue: "Bar over the hips. Squeeze the glutes." } },
  { name: "Walking Lunge", pattern: "lunge", parts: ["legs", "lower"], equipment: ["dumbbell"], defaults: { sets: 3, reps: "10/side", tempo: "2-1-1-0", rest: "60s", load: "moderate", cue: "Step long. Drive through the heel." } },
  { name: "Bulgarian Split Squat", pattern: "lunge", parts: ["legs", "glutes"], equipment: ["dumbbell"], defaults: { sets: 3, reps: "8/side", tempo: "3-1-1-0", rest: "60s", load: "moderate", cue: "Vertical torso. Knee tracks over the foot." } },
  { name: "DB Bench Press", pattern: "push", parts: ["push", "chest"], equipment: ["dumbbell"], defaults: { sets: 4, reps: "10", tempo: "3-1-1-0", rest: "60s", load: "moderate", cue: "Press in. Squeeze the chest." } },
  { name: "DB Shoulder Press", pattern: "push", parts: ["push", "shoulders"], equipment: ["dumbbell"], defaults: { sets: 4, reps: "10", tempo: "2-1-1-0", rest: "60s", load: "moderate", cue: "Stack the wrist over the elbow." } },
  { name: "DB Curl", pattern: "pull", parts: ["arms"], equipment: ["dumbbell"], defaults: { sets: 3, reps: "10", tempo: "2-1-1-0", rest: "45s", load: "moderate", cue: "No swing. Squeeze the bicep at the top." } },
  { name: "Tricep Pushdown", pattern: "push", parts: ["arms"], equipment: ["cable"], defaults: { sets: 3, reps: "12", tempo: "2-1-1-0", rest: "45s", load: "moderate", cue: "Elbows pinned. Full lockout." } },
  { name: "Lateral Raise", pattern: "push", parts: ["shoulders"], equipment: ["dumbbell"], defaults: { sets: 3, reps: "12", tempo: "2-1-1-0", rest: "45s", load: "light", cue: "Lead with the elbow. Pause at parallel." } },
  { name: "Face Pull", pattern: "pull", parts: ["pull", "shoulders"], equipment: ["cable"], defaults: { sets: 3, reps: "15", tempo: "2-1-1-0", rest: "45s", load: "light", cue: "Pull to the eyes. External rotate." } },
  { name: "Plank", pattern: "core", parts: ["core"], equipment: ["bodyweight"], defaults: { sets: 3, reps: "45s", tempo: "—", rest: "30s", load: "BW", cue: "Ribs down. Glutes squeezed." } },
  { name: "Hanging Leg Raise", pattern: "core", parts: ["core"], equipment: ["bodyweight"], defaults: { sets: 3, reps: "10", tempo: "2-1-2-0", rest: "60s", load: "BW", cue: "No swing. Posterior tilt." } },
  { name: "Russian Twist", pattern: "core", parts: ["core"], equipment: ["dumbbell"], defaults: { sets: 3, reps: "20", tempo: "—", rest: "45s", load: "light", cue: "Rotate from the ribs. Heels light." } },
  { name: "Box Jump", pattern: "plyometric", parts: ["legs", "full"], equipment: ["box"], defaults: { sets: 4, reps: "5", tempo: "X-0-X-0", rest: "60s", load: "BW", cue: "Land soft. Stand all the way up." } },
  { name: "Burpee", pattern: "conditioning", parts: ["full"], equipment: ["bodyweight"], defaults: { sets: 3, reps: "10", tempo: "—", rest: "60s", load: "BW", cue: "Chest to deck. Jump and clap." } },
  { name: "Kettlebell Swing", pattern: "hinge", parts: ["posterior", "glutes", "full"], equipment: ["kettlebell"], defaults: { sets: 5, reps: "15", tempo: "X-0-X-0", rest: "60s", load: "moderate", cue: "Hike, snap, float." } },
  { name: "Wall Ball", pattern: "conditioning", parts: ["full"], equipment: ["medicine ball"], defaults: { sets: 4, reps: "20", tempo: "—", rest: "60s", load: "moderate", cue: "Squat below parallel. Drive through." } },
  { name: "Thruster", pattern: "conditioning", parts: ["full"], equipment: ["barbell"], defaults: { sets: 5, reps: "8", tempo: "X-0-X-0", rest: "90s", load: "moderate", cue: "Front squat into press. One motion." } },
  { name: "Farmer Carry", pattern: "carry", parts: ["full", "core"], equipment: ["dumbbell"], defaults: { sets: 4, reps: "40m", tempo: "—", rest: "60s", load: "heavy", cue: "Tall posture. Crush the handles." } },
  { name: "Rower 500m", pattern: "conditioning", parts: ["full"], equipment: ["rower"], defaults: { sets: 5, reps: "500m", tempo: "—", rest: "90s", load: "—", cue: "Legs–back–arms. Reverse the order." } },
  { name: "Assault Bike Sprint", pattern: "conditioning", parts: ["full"], equipment: ["bike"], defaults: { sets: 6, reps: "30s", tempo: "—", rest: "60s", load: "all-out", cue: "Punch and pull. Don't bounce." } },
];

// ─── Warm-up & Cool-down Libraries ──────────────────────────────────────────

/**
 * Master warm-up library for the plan editor's movement picker.
 * Superset of all warm-up pool entries.
 * @type {Array<{name: string, duration: string, cue: string}>}
 */
export const WARMUP_LIBRARY = [
  { name: "World's Greatest Stretch", duration: "5/side", cue: "Open the hips. Rotate the ribs." },
  { name: "Cat-Cow", duration: "8 reps", cue: "Move the spine one segment at a time." },
  { name: "Hip CARs", duration: "5/side", cue: "Slow circles. Full range." },
  { name: "Scapular Pull-Up", duration: "8 reps", cue: "Depress and retract. No arm bend." },
  { name: "Band Pull-Apart", duration: "15 reps", cue: "Squeeze the shoulder blades." },
  { name: "Glute Bridge", duration: "10 reps", cue: "Pause at the top. Squeeze." },
  { name: "Inchworm", duration: "6 reps", cue: "Reach long. Pause in plank." },
  { name: "Air Squat", duration: "15 reps", cue: "Sit back. Knees out." },
  { name: "Lateral Lunge", duration: "5/side", cue: "Sit into one hip. Stay tall." },
  { name: "Empty-Bar Practice", duration: "1 round", cue: "Groove the lift. Set the cues." },
  { name: "A-Skip", duration: "30s", cue: "Drive the knee. Snappy arms." },
  { name: "Leg Swings", duration: "10/side", cue: "Front-back, then side-side." },
  { name: "Arm Circles", duration: "10 each way", cue: "Big circles. Open the chest." },
  { name: "90/90 Hip Switch", duration: "60s", cue: "Slow rotations. Stay tall." },
];

/**
 * Master cool-down library for the plan editor's movement picker.
 * @type {Array<{name: string, duration: string, cue: string}>}
 */
export const COOLDOWN_LIBRARY = [
  { name: "Box Breathing", duration: "2 min", cue: "Inhale 4, hold 4, exhale 4, hold 4." },
  { name: "Childs Pose", duration: "60s", cue: "Hips to heels. Reach long." },
  { name: "Couch Stretch", duration: "60s/side", cue: "Tall hips. Squeeze the glute." },
  { name: "Pigeon Pose", duration: "60s/side", cue: "Square the hips. Breathe into the stretch." },
  { name: "Foam Roll", duration: "5 min", cue: "Slow passes. Pause on hot spots." },
  { name: "90/90 Hip Switch", duration: "60s", cue: "Slow rotations. Stay tall." },
  { name: "Lying Hamstring Stretch", duration: "60s/side", cue: "Strap the foot. Keep the knee soft." },
  { name: "Thread the Needle", duration: "45s/side", cue: "Open the t-spine. Sink the shoulder." },
  { name: "Diaphragmatic Breathing", duration: "3 min", cue: "Belly first, then ribs." },
];

// ─── Key Lifts & Aliases ────────────────────────────────────────────────────

/**
 * Lifts that appear on the Progress dashboard with individual line charts.
 * These are the canonical exercise names for PR tracking.
 * @type {string[]}
 */
export const KEY_LIFTS = [
  "Back Squat", "Front Squat", "Bench Press", "Incline Bench Press",
  "Deadlift", "Romanian Deadlift", "Overhead Press", "Hip Thrust",
];

/**
 * Maps common variations, abbreviations, and slang to canonical lift names.
 * Used by {@link normalizeExerciseName} when detecting PRs.
 * @type {Object<string, string>}
 */
export const EXERCISE_ALIASES = {
  "barbell back squat": "Back Squat",
  "high bar squat": "Back Squat",
  "low bar squat": "Back Squat",
  "back squat": "Back Squat",
  "bench": "Bench Press",
  "barbell bench": "Bench Press",
  "flat bench press": "Bench Press",
  "incline bench": "Incline Bench Press",
  "incline barbell bench": "Incline Bench Press",
  "conventional deadlift": "Deadlift",
  "deadlift": "Deadlift",
  "rdl": "Romanian Deadlift",
  "romanian dead": "Romanian Deadlift",
  "ohp": "Overhead Press",
  "press": "Overhead Press",
  "barbell hip thrust": "Hip Thrust",
  "front squat": "Front Squat",
};
