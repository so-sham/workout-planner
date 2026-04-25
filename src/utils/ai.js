/**
 * @module utils/ai
 * @description Workout generation engine — both AI-powered (Anthropic Claude)
 * and local (offline) modes. Also handles multi-day and weekly program generation.
 */

import { CATEGORIES, BODY_PARTS } from '../constants/categories';
import { CYCLE_PRESCRIPTION, INTENSITY_LOAD, CONDITIONING_PRESCRIPTION } from '../constants/training';
import { LOCAL_EXERCISES } from '../constants/exercises';
import { WARMUP_POOL, COOLDOWN_POOL, WEEKLY_SPLITS } from '../constants/plans';
import { shuffle, rand, pickQuote, matchesBodyParts, uid } from './helpers';

// ─── System Prompt ──────────────────────────────────────────────────────────

/**
 * System prompt sent to the Anthropic API.
 * Instructs Claude to act as FORGE — a celebrity-grade personal trainer —
 * and return workouts as strict JSON matching the defined schema.
 * @type {string}
 */
const SYSTEM_PROMPT = `You are FORGE, a celebrity-grade personal trainer. You write workouts in strict JSON only — no preamble, no markdown fences.

Schema:
{
  "title": string,
  "tagline": string,
  "estimatedMinutes": number,
  "warmup": [{ "name": string, "duration": string, "cue": string }],
  "mainBlock": [{ "name": string, "sets": number, "reps": string, "tempo": string, "rest": string, "load": string, "cue": string }],
  "cooldown": [{ "name": string, "duration": string, "cue": string }],
  "finisherNote": string
}

Rules:
- Use canonical names for key lifts (Back Squat, Bench Press, Deadlift, Romanian Deadlift, Overhead Press, Front Squat, Incline Bench Press, Hip Thrust).
- Olympic sessions: snatch / C&J + variants, technique-first, 1–5 reps, 2–4 min rest, include pulls/positional accessories.
- Respect the user's intensity, level, cycle, and body-part focus.
- Output ONLY the JSON object.`;

// ─── Prompt Builder ─────────────────────────────────────────────────────────

/**
 * Build the user-facing prompt that specifies the workout requirements.
 *
 * @param {Object} options - Generation parameters
 * @param {string|string[]} options.categories - Selected category IDs
 * @param {string} options.intensity - Intensity level ID
 * @param {string} options.level - Experience level ID
 * @param {string} options.cycle - Periodization cycle ID
 * @param {string[]} [options.bodyParts] - Body-part focus IDs
 * @param {string|null} [options.focusLabel] - Override focus label text
 * @returns {string} Formatted prompt text for the AI
 */
const buildUserPrompt = ({ categories, intensity, level, cycle, bodyParts, focusLabel }) => {
  const cats = Array.isArray(categories) ? categories : [categories].filter(Boolean);
  const catLabels = cats
    .map((id) => CATEGORIES.find((c) => c.id === id)?.label || id)
    .join(", ");
  const lines = [
    `Categories (blend these into one cohesive session): ${catLabels}.`,
    `Intensity: ${intensity}.`,
    `Level: ${level}.`,
    `Cycle: ${cycle}.`,
  ];
  if (focusLabel) {
    lines.push(focusLabel);
  } else if (bodyParts && bodyParts.length && !bodyParts.includes("full")) {
    const labels = bodyParts.map((p) => BODY_PARTS.find((b) => b.id === p)?.label || p);
    lines.push(`Body-Part Focus: ${labels.join(", ")}.`);
  }
  if (cats.length > 1) {
    lines.push(
      "Fuse all listed categories into a single unified workout, sequenced strength → conditioning → cardio by default."
    );
  }
  lines.push("Return JSON only.");
  return lines.join("\n");
};

// ─── JSON Parsing ───────────────────────────────────────────────────────────

/**
 * Extract and parse JSON from a potentially messy AI response.
 * Strips markdown code fences and extracts the first `{…}` block.
 *
 * @param {string} text - Raw text from the API response
 * @returns {Object} Parsed JSON object
 * @throws {SyntaxError} If no valid JSON can be found
 */
const parseLooseJSON = (text) => {
  let t = text.trim();
  t = t.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const i = t.indexOf("{");
  const j = t.lastIndexOf("}");
  if (i >= 0 && j > i) t = t.slice(i, j + 1);
  return JSON.parse(t);
};

// ─── AI Generation (Anthropic Claude) ───────────────────────────────────────

/**
 * Generate a single workout via the Anthropic Messages API.
 *
 * @param {Object} params
 * @param {string} params.apiKey - Anthropic API key
 * @param {Object} params.options - Workout generation options (categories, intensity, etc.)
 * @param {AbortSignal} [params.signal] - Abort signal for cancellation
 * @returns {Promise<Object>} Parsed workout plan with `_source: "ai"`
 * @throws {Error} On API errors or invalid responses
 */
export async function generateWorkoutAI({ apiKey, options, signal }) {
  const body = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(options) }],
  };
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    signal,
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`API error ${res.status}: ${err.slice(0, 200)}`);
  }
  const json = await res.json();
  const text = json.content?.[0]?.text || "";
  const plan = parseLooseJSON(text);
  plan._source = "ai";
  return plan;
}

// ─── Local (Offline) Generation ─────────────────────────────────────────────

/**
 * Generate a single workout using the built-in exercise pools.
 * No API key required. Selects exercises from LOCAL_EXERCISES based on
 * the chosen categories, applies cycle prescriptions, and assembles
 * warm-up/cool-down from the appropriate pools.
 *
 * @param {Object} params
 * @param {Object} params.options - Generation options (categories, intensity, level, cycle, bodyParts)
 * @param {boolean} [params.delay=true] - Whether to add a brief artificial delay for UX
 * @returns {Promise<Object>} Complete workout plan with `_source: "local"`
 */
export async function generateWorkoutLocal({ options, delay = true }) {
  if (delay) await new Promise((r) => setTimeout(r, 700));
  const cats = Array.isArray(options.categories) ? options.categories : [options.categories];
  const presc = CYCLE_PRESCRIPTION[options.cycle] || CYCLE_PRESCRIPTION.hypertrophy;
  const load = INTENSITY_LOAD[options.intensity] || INTENSITY_LOAD.moderate;
  const condPresc = CONDITIONING_PRESCRIPTION[options.intensity] || CONDITIONING_PRESCRIPTION.moderate;
  const levelCount = { beginner: 4, intermediate: 5, advanced: 6, elite: 7 }[options.level] || 5;
  const slots = Math.max(cats.length, levelCount);

  // Build warm-up from relevant pools
  const groups = new Set(cats.map((id) => CATEGORIES.find((c) => c.id === id)?.group).filter(Boolean));
  const warmupPool = [];
  if (groups.has("strength")) warmupPool.push(...WARMUP_POOL.strength);
  if (groups.has("conditioning")) warmupPool.push(...WARMUP_POOL.conditioning);
  if (groups.has("cardio")) warmupPool.push(...WARMUP_POOL.cardio);
  const warmup = shuffle(warmupPool.length ? warmupPool : WARMUP_POOL.strength).slice(0, 4);
  const cooldown = shuffle(COOLDOWN_POOL).slice(0, 3);

  // Select main-block exercises
  const focus = options.bodyParts || ["full"];
  const exercises = [];
  const perCat = Math.max(1, Math.floor(slots / cats.length));
  cats.forEach((catId, ci) => {
    const cat = CATEGORIES.find((c) => c.id === catId);
    let pool = LOCAL_EXERCISES[catId] || [];
    if (cat?.group === "strength" || catId === "olympic") {
      const filtered = pool.filter((e) => matchesBodyParts(e.name, focus));
      if (filtered.length >= 2) pool = filtered;
    }
    const picks = shuffle(pool).slice(0, perCat);
    for (const ex of picks) {
      const isCardio = cat?.group === "cardio" || cat?.group === "conditioning";
      const isOly = catId === "olympic";
      exercises.push({
        name: ex.name,
        sets: isCardio ? condPresc.rounds : isOly ? Math.max(3, presc.sets - 1) : presc.sets,
        reps: isCardio ? condPresc.work : isOly ? "1-3" : presc.reps,
        tempo: isOly ? "X-0-1-0" : presc.tempo,
        rest: isCardio ? condPresc.rest : isOly ? "2-3 min" : presc.rest,
        load: isCardio ? "—" : isOly ? "70-85% 1RM" : load,
        cue: ex.cue,
        _group: cat?.group || "strength",
        _ord: ci,
      });
    }
  });

  // Sort: strength → conditioning → cardio
  const order = { strength: 0, conditioning: 1, cardio: 2 };
  exercises.sort((a, b) => (order[a._group] - order[b._group]) || (a._ord - b._ord));
  exercises.forEach((e) => { delete e._group; delete e._ord; });

  // Build title
  const verbBank =
    options.intensity === "max"
      ? ["Forge", "Summit", "Apex", "Detonate"]
      : options.cycle === "deload"
      ? ["Reset", "Recoup", "Recalibrate"]
      : ["Build", "Hammer", "Carve", "Charge", "Drive"];
  const catLabel = cats.length === 1
    ? CATEGORIES.find((c) => c.id === cats[0])?.label
    : cats.map((id) => CATEGORIES.find((c) => c.id === id)?.label).join(" + ");
  const focusLabel = focus.includes("full") ? "" : ` · ${focus.map((p) => BODY_PARTS.find((b) => b.id === p)?.label).filter(Boolean).join("/")}`;
  const title = `${rand(verbBank)} — ${catLabel}${focusLabel}`;
  const tagline = pickQuote({ cycle: options.cycle, intensity: options.intensity, categories: cats });

  return {
    title,
    tagline,
    estimatedMinutes: 35 + exercises.length * 4,
    warmup: warmup.map((w) => ({ name: w.name, duration: w.duration, cue: w.cue })),
    mainBlock: exercises,
    cooldown: cooldown.map((c) => ({ name: c.name, duration: c.duration, cue: c.cue })),
    finisherNote: options.intensity === "max" ? "Optional finisher: 100 burpees for time." : "Walk 3 min. Hydrate. Note how today felt.",
    _source: "local",
  };
}

// ─── Single-Day Helper ──────────────────────────────────────────────────────

/**
 * Generate a single day's workout, using either local or AI mode.
 *
 * @param {Object} params
 * @param {boolean} params.useLocal - True to use offline generator
 * @param {string} params.apiKey - Anthropic API key (ignored if useLocal)
 * @param {Object} params.baseOpts - Base generation options
 * @param {AbortSignal} [params.signal] - Abort signal
 * @param {string} params.dayLabel - Display label (e.g. "Day 1", "Mon")
 * @param {string|null} params.focus - Body-part focus override
 * @returns {Promise<Object>} Day object with `{ day, focus, isRest, plan }`
 */
export async function generateOneDay({ useLocal, apiKey, baseOpts, signal, dayLabel, focus }) {
  const opts = { ...baseOpts, focusLabel: focus ? `Body-Part Focus: ${focus}` : null };
  const plan = useLocal
    ? await generateWorkoutLocal({ options: opts, delay: false })
    : await generateWorkoutAI({ apiKey, options: opts, signal });
  return { day: dayLabel, focus: focus || plan.title || dayLabel, isRest: false, plan };
}

// ─── Multi-Day Program ──────────────────────────────────────────────────────

/**
 * Generate a multi-session program (N one-off sessions bundled together).
 * Each session is generated sequentially with progress callbacks.
 *
 * @param {Object} params
 * @param {boolean} params.useLocal - True to use offline generator
 * @param {string} params.apiKey - Anthropic API key
 * @param {Object} params.baseOpts - Base generation options
 * @param {number} params.dayCount - Number of sessions to generate
 * @param {AbortSignal} [params.signal] - Abort signal
 * @param {Function} [params.onProgress] - Progress callback `({ completed, total, day })`
 * @returns {Promise<Object>} Weekly-type plan with all generated days
 */
export async function generateMultiDayProgram({ useLocal, apiKey, baseOpts, dayCount, signal, onProgress }) {
  const days = [];
  for (let i = 0; i < dayCount; i++) {
    const label = `Day ${i + 1}`;
    onProgress?.({ completed: i, total: dayCount, day: label });
    const d = await generateOneDay({ useLocal, apiKey, baseOpts, signal, dayLabel: label, focus: null });
    days.push(d);
  }
  const cats = Array.isArray(baseOpts.categories) ? baseOpts.categories : [baseOpts.categories];
  const catLabels = cats.map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ");
  return {
    type: "weekly",
    title: `${dayCount}-Session Program — ${catLabels}`,
    tagline: `${dayCount} sessions. Stack the work.`,
    days,
    _source: useLocal ? "local" : "ai",
  };
}

// ─── Weekly Plan ────────────────────────────────────────────────────────────

/**
 * Generate a structured weekly training plan (Mon–Sun) with a built-in split.
 * Training days get generated workouts; rest days are marked as rest.
 *
 * @param {Object} params
 * @param {boolean} params.useLocal - True to use offline generator
 * @param {string} params.apiKey - Anthropic API key
 * @param {Object} params.baseOpts - Base generation options
 * @param {number} params.daysPerWeek - Training days per week (3–6)
 * @param {AbortSignal} [params.signal] - Abort signal
 * @param {Function} [params.onProgress] - Progress callback
 * @returns {Promise<Object>} Weekly plan with 7 day entries
 */
export async function generateWeeklyPlan({ useLocal, apiKey, baseOpts, daysPerWeek, signal, onProgress }) {
  const split = WEEKLY_SPLITS[daysPerWeek] || WEEKLY_SPLITS[4];
  const days = [];
  const trainingDays = split.filter((d) => !d.isRest).length;
  let completed = 0;
  for (const slot of split) {
    if (slot.isRest) {
      days.push({ day: slot.day, focus: slot.focus, isRest: true, plan: null });
    } else {
      onProgress?.({ completed, total: trainingDays, day: slot.day });
      const opts = { ...baseOpts, bodyParts: slot.parts };
      const plan = useLocal
        ? await generateWorkoutLocal({ options: opts, delay: false })
        : await generateWorkoutAI({ apiKey, options: opts, signal });
      days.push({ day: slot.day, focus: slot.focus, isRest: false, plan });
      completed++;
    }
  }
  const cats = Array.isArray(baseOpts.categories) ? baseOpts.categories : [baseOpts.categories];
  const catLabels = cats.map((id) => CATEGORIES.find((c) => c.id === id)?.label || id).join(" + ");
  return {
    type: "weekly",
    title: `Weekly Plan — ${catLabels}`,
    tagline: "Mon–Sun. Stay consistent.",
    days,
    _source: useLocal ? "local" : "ai",
  };
}
