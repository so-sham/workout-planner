# FORGE — AI Celebrity Personal Trainer

Implementation log for the Workout Planner app. Each prompt gets its own section: what was asked, what was built, why, and the key choices/assumptions.

---

## Prompt 1 — Initial Build

### What was asked
Build a single-page React application that acts as a celebrity-grade AI personal trainer and workout tracker. Requirements spanned four feature pillars (Generator / Logger / Progress / UX), a data architecture based on `window.storage`, and a tech stack of React + hooks, Recharts, Tailwind, and the Anthropic API (`claude-sonnet-4-20250514`). Output had to live in the `Workout Planner` directory.

### What was built
A single self-contained file at [index.html](index.html) that boots the entire app. One companion file ([DOCUMENTATION.md](DOCUMENTATION.md), this file) tracks the implementation log.

Feature coverage:

1. **Workout Generator** (`Generator`, `PlanPreview`, `ExerciseCard`)
   - All seven required categories (Barbell Strength, Dumbbell Strength, Compound Lifts, HIIT, Circuit Training, Hyrox-Style, Full Gym).
   - Intensity (Light / Moderate / Heavy / Max Effort) and Level (Beginner / Intermediate / Advanced / Elite) selectors as pill groups.
   - Training cycles (Hypertrophy, Strength, Power, Deload, Endurance, Competition Prep).
   - `generateWorkoutAI()` calls `claude-sonnet-4-20250514` with a system prompt that enforces strict JSON output (title, tagline, estimated minutes, warm-up, main block, cool-down, finisher note). The main block includes exercise name, sets, reps, tempo, rest, load, and a per-exercise coaching cue.
   - Warm-up and cool-down blocks are rendered as their own sections.
   - Contextual motivational quotes (`pickQuote`) swap based on the active cycle/intensity — e.g. "Light weight, baby" on Deload, "This is where champions are made" on Max Effort.

2. **Workout Logger** (`ActiveWorkout`, `LoggerCard`)
   - "Start Workout" seeds an `activeSession` with per-exercise set rows pre-filled to the prescribed count.
   - Real-time logging of weight, reps, and per-set completion. Sets can be added or removed.
   - Each exercise has `completed` / `skipped` / `substituted` status toggles. Substitution prompts for a replacement name.
   - Per-exercise notes field for form cues / how-it-felt.
   - Elapsed-time clock and overall progress bar (sets completed / sets total).
   - "Finish & Save" persists the session under `workouts:{date}:{id}`, computes tonnage/sets/reps, and checks for PRs.

3. **Progress Tracker** (`History`, `Progress`, `PRWall`, `LiftChart`)
   - History view with type + date-range filters, expandable session detail cards, and delete control.
   - Key-lift progression charts (top-set weight + estimated 1RM using Epley) for Back Squat, Front Squat, Bench Press, Incline Bench, Deadlift, RDL, Overhead Press, and Hip Thrust. `normalizeExerciseName()` plus an alias map catches common naming variants.
   - PR Wall: last-8-week weekly volume bar chart (sets + tonnage) using Recharts `BarChart`.
   - Auto PR detection on session finish — PRs are written to `prs:{exercise}` keyed by estimated 1RM, and breaking a PR triggers a gold toast.

4. **UX & Design**
   - Matte-black base (`#0a0a0a`) with gold (`#d4af37` / `#f5cf5d`) primary accent and electric orange (`#ff6a1a`) ember accent.
   - Bebas Neue display font for headlines, Inter for body. Clean card layouts for every exercise block.
   - Sticky tab nav (Generate / Train / History / Progress), mobile-first responsive grid, subtle noise texture on hero, shimmer skeleton during AI generation, gold pulse dot when a session is active.
   - Contextual trainer quotes surfaced in the hero banner.

5. **Data Architecture**
   - `window.storage` shim defined in a pre-load `<script>` (falls back to `localStorage`). Persistence survives refresh.
   - Keys follow the spec: `workouts:{date}:{id}`, `prs:{exercise}`, `profile:settings`.
   - Settings persist preferred level, default intensity, default cycle, favorite categories, and the API key — so the generator remembers across sessions.

### Why these choices / assumptions

- **Single HTML file + CDN React/Recharts/Babel.** The requirement was a "single-page React application." Rather than spin up a Vite/CRA build, a standalone HTML file boots React 18, Recharts 2.12, Tailwind (JIT CDN), and Babel standalone for in-browser JSX. Trade-off: slightly slower first paint from in-browser transpile, gained zero-install portability — the user can just open the file.
- **`window.storage` shim.** `window.storage` is not a standard browser API. Interpreted the spec as "a persistent key/value interface on window." Shimmed it in the `<head>` over `localStorage` with `getItem`/`setItem`/`removeItem`/`keys`. If a richer `window.storage` (e.g. from a Claude artifact environment) is present, the shim is skipped. `keys()` is added because the history/PR loaders need to enumerate namespaced entries.
- **API key stored client-side.** To keep the app truly single-page and browser-only, the Anthropic key is entered in the Settings modal and stored under `profile:settings`. The fetch includes `anthropic-dangerous-direct-browser-access: true`. If the user wants a server-side proxy later, `generateWorkoutAI()` is the single seam.
- **Model: `claude-sonnet-4-20250514`.** Used exactly as specified, even though newer Sonnet 4.x models exist — honoring the explicit instruction in the prompt.
- **Strict JSON output via system prompt.** The system prompt declares an exact schema and forbids markdown fences. Defensive parsing still strips ```json fences and slices between the first `{` and last `}` before `JSON.parse`, so a stray preamble won't kill the UX.
- **Epley 1RM estimator (`w × (1 + r/30)`).** Picked for PR detection because it's the most commonly-cited formula and lets PRs fire on any rep range, not just 1-rep attempts. Small but visible trade-off: PRs can be set by high-rep AMRAPs. Acceptable for a motivator-first product.
- **Key-lift alias map.** The AI coach will vary phrasing ("Barbell Back Squat", "Conventional Deadlift", "RDL"). An alias dictionary plus substring fallback normalizes these to the canonical 8 tracked lifts so charts don't fragment.
- **Weekly volume groups by ISO week (Monday start).** Chose Monday as the week anchor since most strength programs follow a Mon–Sun microcycle.
- **Category guessing for history filters.** Workouts don't store their input category explicitly (the AI only sees it at generation time). `guessCategory()` infers it from the plan title, which is good enough for filter buckets without bloating storage. Trade-off: a Hyrox session titled "Engine Builder" would misclassify as Full Gym. Acceptable.
- **"Bebas Neue + Inter + gold/ember" aesthetic.** Bebas Neue delivers the sharp, no-nonsense "trainer" voice the prompt asked for; Inter keeps body text clean at small sizes. Gold for primary accents (premium, award-show), ember orange for active/warning/substitution states so the two colors never fight.
- **Abandoned the "Full Gym" icon for a generic bolt icon.** Kept the icon set small and hand-rolled inline SVGs rather than pulling Lucide/FontAwesome, so there's no extra CDN dependency.
- **No virtualized lists.** Realistic per-user volume (hundreds of sessions over years) is well within browser reach without virtualization. Skipping it saves complexity.
- **No multi-user / auth.** Spec was single-user on a device. Added a "Wipe data" button in Settings as the escape hatch.
- **No optimistic PR UI before finish.** PR detection runs only on "Finish & Save" to avoid misfiring on half-logged sets. Trade-off: user doesn't get the dopamine spike mid-session. Acceptable for data integrity.

### How to run
Open [index.html](index.html) in a modern browser (Chrome/Safari/Firefox). Click the gear icon and paste an Anthropic API key. Pick a category, intensity, level, cycle — hit **Generate Workout**.

### Files
- [index.html](index.html) — the entire app (React components, styles, AI call, storage, charts).
- [DOCUMENTATION.md](DOCUMENTATION.md) — this log.

---

## Prompt 2 — Multi-select Category

### What was asked
Via the preview-panel element picker, the user selected the Category section and asked: "Make this multi select."

### What was built
- State switched from a single `category` string to a `categories` array with a `toggleCategory(id)` helper. Tapping a card adds or removes it; the last selected card can't be deselected (guarantees ≥1 is always picked, so generation never fires on an empty set).
- Each active card shows an ordered badge (1, 2, 3…) in the top-right corner reflecting selection order — the same order is passed to the AI so the user implicitly controls priority.
- Section hint now reads live as `Stack your weapons · N selected`, and a helper line underneath explains the interaction ("Tap to stack multiple… At least one must stay selected").
- `persistChoices()` now seeds `favoriteCategories` with the whole active array (deduped, capped at 4) so the settings memory tracks a full stack instead of a single pick.
- `buildUserPrompt()` now accepts `categories` (still tolerates a single string for safety) and, when more than one is selected, renders a `Categories (blend these into one cohesive session): X, Y, Z` line plus an explicit instruction block telling the coach to fuse them into a single unified workout with logical ordering (strength before conditioning by default).

### Why these choices / assumptions
- **Ordered badges instead of plain checkmarks.** The AI responds differently if categories are listed in a specific order. Showing the index makes that priority visible and intentional — "Barbell 1, HIIT 2" ≠ "HIIT 1, Barbell 2" when the coach sequences the session.
- **Enforce minimum of 1 selection.** Zero categories has no meaningful prompt, so the toggle silently refuses to deselect the last one. Cleaner than disabling the Generate button or error-handling later.
- **Favorites tracks the stack, not just the last click.** If the user habitually pairs Barbell + HIIT, both should come back on next load rather than only the most recent click.
- **Blend instruction in the user prompt, not the system prompt.** Kept the system prompt stable (it's the most cache-friendly part) and put the multi-category directive in the per-request user message where it belongs.
- **Backward-compatible `buildUserPrompt`.** Accepts either an array or a string so any future caller (e.g. a saved-preset replay) doesn't break.

---

## Prompt 3 — Cardio Section + Keyless Generation

### What was asked
Two things, via the preview-panel element picker on the Category section:
1. "Add a section for cardio — include gym equipment and floor cardio."
2. "Is there a way to generate without Anthropic API key for now?"

### What was built

**A) Cardio grouping under Category**
- Added two new categories: **Gym Cardio** (`gymcardio`, "Treadmill, rower, bike, erg.") and **Floor Cardio** (`floorcardio`, "No machines. Just you.").
- Introduced a `group` field on every category (`strength` / `conditioning` / `cardio`) plus a `CATEGORY_GROUPS` list for section headers.
- The Category grid now renders as three labeled sub-sections (STRENGTH / CONDITIONING / CARDIO) with the same multi-select, ordered-badge behavior from Prompt 2.
- Warmups now adapt to whichever groups are present in the selection — e.g. picking a cardio-only session pulls jog/row/A-skip warmups instead of barbell-rehearsal warmups.

**B) Local "Offline Coach" — no API key required**
- New `generateWorkoutLocal({ options })` returns a workout in exactly the same JSON shape as the AI call (`title`, `tagline`, `estimatedMinutes`, `warmup`, `mainBlock`, `cooldown`, `finisherNote`, plus `_source: "local"`).
- Exercise data lives in `LOCAL_EXERCISES` keyed by category id — 6–8 movements per category, each with a real coaching cue in the same voice as the AI prompt. Key lifts (Back Squat, Bench, Deadlift, etc.) use the same canonical names so `normalizeExerciseName()` still maps them into PR/chart tracking.
- Warm-ups pull from `WARMUP_POOL` (strength / conditioning / cardio). Cool-downs from a shared `COOLDOWN_POOL`.
- Prescription matrices drive sets/reps/tempo/rest:
  - `CYCLE_PRESCRIPTION` maps each cycle to the strength-rep prescription.
  - `INTENSITY_LOAD` maps intensity to a `%1RM` load string.
  - `CONDITIONING_PRESCRIPTION` drives timed work/rest blocks for cardio and HIIT by intensity.
- Exercise count scales with level (Beginner 4 → Elite 7). Slots are distributed proportionally across the user's selected categories, in selection order, then resorted so strength comes before conditioning/cardio in the final output.
- Titles are composed from a verb pool that shifts with intensity/cycle (e.g. Max Effort → "Forge / Summit / Apex", Deload → "Reset / Recoup / Recalibrate").
- A 700ms artificial delay preserves the "coach is writing your program" feel and gives the skeleton loader time to breathe.

**C) Wiring**
- `handleGenerate()` no longer errors on a missing API key. It uses the local coach automatically when there's no key, and when the user opts into it via the new Settings toggle.
- A live coach-mode banner sits above the Generate button — **ember** "Offline coach" state vs. **gold** "AI coach" state — so the mode is never ambiguous.
- Settings modal: API key helper text now reads "Optional — without a key, the app uses the built-in offline coach." A new toggle row ("Force offline coach") lets users with a key stay local if they want.
- Added `preferLocalCoach: false` to `DEFAULT_SETTINGS`.

### Why these choices / assumptions

- **Why a grouped grid instead of a separate "Cardio" section.** The user's wording was ambiguous between "add a new section" and "add cardio categories." A grouped grid delivers both: cardio reads as its own visually distinct block *and* stays inside the Category multi-select so you can stack it with strength work (Barbell + Gym Cardio is a valid session). If I'd built a separate top-level section, cardio couldn't compose with the other categories without new UI plumbing.
- **Two cardio categories, not one.** "Gym equipment" and "floor" demand different exercise pools and, practically, different equipment availability. Keeping them split lets the user express "treadmill day" vs. "no-gear hotel room day" — and the local coach picks from the right pool accordingly.
- **Local coach mirrors the AI JSON schema exactly.** The rest of the app (plan preview, logger seeding, history, PR detection) only understands that one shape. Matching it means zero branching elsewhere — `_source` is the only new field, purely informational.
- **Prescription-driven, not exercise-by-exercise.** Hard-coding sets/reps per exercise would blow up the data size and get stale fast. Three small matrices (cycle × intensity × group) let the same exercise library flex across all 4 × 6 × 4 level/cycle/intensity combinations.
- **700ms artificial delay on local generation.** The skeleton loader is part of the premium feel; instant generation breaks the vibe and makes the app feel like a dumb randomizer. Short enough to not annoy.
- **Auto-fallback + explicit override.** Falling back silently when there's no key is the friendliest path (user literally asked for keyless operation). The "Force offline coach" toggle covers the less common case of a user with a key who wants to save tokens, work offline, or compare the two.
- **Coach-mode banner above the button.** Surfacing the mode at the point of action (vs. hiding it in settings) prevents "why is my workout generic?" confusion after a user mistypes their key.
- **Canonical names kept consistent between AI and local pools.** "Back Squat" stays "Back Squat" in both so PR tracking and the progress chart work identically whichever coach generated the session.
- **No attempt to match AI creativity with the local coach.** The local coach is deterministic-ish and menu-based — that's fine. The banner tells the user what they're getting, and titles/finisher lines add enough flavor to stay on-brand.

---

## Prompt 4 — Body-Part Focus, Weekly/Acyclic Plans, Olympic Lifting

### What was asked
"Okay give me option to choose body part to train and to make weekly plans or acyclic plan, also add olympic style training to the context."

### What was built

**A) Olympic Lifts category**
- New category `olympic` in `CATEGORIES`, group `strength`, blurb *"Snatch. Clean. Jerk."*
- Dedicated exercise pool in `LOCAL_EXERCISES.olympic` — Power Clean, Hang Clean, Power Snatch, Hang Snatch, Clean & Jerk, Push Press, Split Jerk, Overhead Squat, Snatch Pull, Clean Pull, Snatch High Pull — each with a technique-first cue.
- `SYSTEM_PROMPT` now includes an Olympic-specific programming rule: snatch / C&J + variants, technique-first, 1–5 reps, 2–4 min rest, include pulls/positional accessories.
- Contextual quote bucket added for Olympic moods ("Speed under the bar wins medals", etc.).

**B) Body-Part Focus**
- New `BODY_PARTS` constant with 13 regions: Full Body, Upper, Lower, Push, Pull, Legs, Chest, Back, Shoulders, Arms, Core, Glutes, Posterior Chain.
- Multi-select pill group in the Generator. `Full Body` is mutually exclusive with specific regions — picking any region auto-clears it, picking Full Body clears everything else, and deselecting the last region falls back to Full Body.
- `inferBodyParts(name)` classifies any exercise from its name via a small regex ruleset. `matchesBodyParts()` uses that to filter local-coach pools when strength/olympic selections are made. Cardio and conditioning pools are *not* filtered — those already target full-system output.
- `buildUserPrompt()` now passes the selected regions as a `Body-Part Focus:` line so the AI respects it.
- Selected focus surfaces in the generated local title (e.g. *"Build — Barbell Strength · Push"*).

**C) Plan Mode — Single Session vs Weekly Plan**
- New `PLAN_MODES` constant: `single` (One-off Session) and `weekly` (Weekly Plan, Mon–Sun).
- `WEEKLY_SPLITS` maps days-per-week (3/4/5/6) to a 7-day schedule with auto-picked focuses:
  - 3 days → Full Body A/B/C
  - 4 days → Upper/Lower x2
  - 5 days → Push / Pull / Legs / Upper / Lower
  - 6 days → PPL × 2
- `generateWeeklyPlan({...})` fans out across the split. Each training day reuses the user's categories/intensity/level/cycle but overrides `bodyParts` with the split's day focus. Rest days are marked, not generated. Calls run sequentially (simpler rate-control + real progress updates for the loading label).
- Progress label ("Programming day 2/4 — Wed…") replaces the default shimmer caption during weekly generation.
- New `WeeklyPlanPreview` component renders the week as a vertical list of day rows — each training day expands to show its exercises and has its own **Start** button that hands the per-day plan to `startWorkout()`. Rest days are shown dimmed with the "Recovery is training" line.
- `startWorkout(plan, meta)` now accepts optional `{ weeklyDay, weeklyFocus }` and stamps them on the saved session so history can show which day of a weekly plan a session came from (forward-compatible — history UI doesn't need changes to keep working).
- Settings persists `defaultPlanMode`, `defaultDaysPerWeek`, and `defaultBodyParts` so the next visit remembers.

### Why these choices / assumptions

- **"Acyclic plan" interpreted as the current single-session mode.** In strength-and-conditioning terminology, an acyclic plan is a non-periodized, standalone workout — exactly what the existing Generator produces. Rather than add a third mode that duplicates "single", I labeled it **One-off Session** and let it cover the acyclic case. The cycle selector is still available for users who want a periodized feel on a one-off.
- **Weekly plans are a fan-out of the per-day generator, not a new prompt schema.** Keeps the prompt/parsing code stable, the AI doesn't have to return a larger/more brittle structure, and the existing `PlanPreview`/logging code works unmodified for each day. Trade-off: N API calls instead of 1 for weekly. Accepted — it also gives real progress telemetry and lets cancellation stop cleanly mid-week.
- **Sequential, not parallel, fan-out.** Parallel would be faster but spiky on the API (rate limits on lower-tier keys) and hides per-day progress. For a 4-day plan at ~5s each, 20s total with a visible counter feels better than a 10s silent block with potential 429s.
- **Body-part filtering uses regex inference, not per-exercise tags.** Tagging every exercise would bloat the library and fragment when new entries are added. A small regex classifier correctly handles common naming (squat/deadlift/press/row/curl/plank/etc.) and falls back gracefully — if no rule matches, the exercise is treated as "full" and stays in the pool. When a filter would remove *all* exercises in a pool, the code falls back to the unfiltered pool rather than returning an empty block.
- **Cardio/conditioning pools ignore body-part focus.** Sprinting, rowing, or Hyrox carries don't meaningfully "focus" a body part. Filtering them by focus would produce empty blocks or nonsensical choices — so the filter is strength/olympic-only.
- **Full-body ↔ region mutual exclusion.** Users tapping "Push" clearly don't want Full Body selected. Explicit UI rule makes intent unambiguous and avoids the "full body AND push?" edge case in the prompt.
- **Weekly splits fixed, not configurable per day.** A per-day editor would blow up UI and decision load. The four split templates cover 95% of real program shapes; users who want custom per-day focuses can still run One-off mode day by day.
- **Rest days come from the split, not skipped altogether.** Showing rest days in the preview reinforces recovery as part of the program — training the user, not just the muscles. They're dim-styled and non-interactive.
- **`startWorkout()` tagged with `weeklyDay` / `weeklyFocus` even though the History view doesn't render them yet.** Cheap forward-compatibility: now the data exists, any later UI pass can surface "Weekly Plan Mon · Push" on session cards.
- **Olympic lifts stay in the `strength` group.** Grouping by equipment/intent, not by sub-discipline — OHP and Power Clean both live under the same strength header because that's how users mentally browse the grid.

---

## Prompt 5 — Full weekly sessions + Library, Calendar & Plan Editor

### What was asked

> "1. Weekly workouts need to be full workout sessions  
> 2. Give an option to save plan and build a workout planner where I can search workouts and define reps with a calendar, basically define all plans like a coach"

### What I did

**A) Weekly days now render as complete sessions, not summaries**
- Extracted `FullSessionBody` — the warm-up / main-block (full `ExerciseCard` grid) / cool-down / finisher rendering previously owned by `PlanPreview`.
- Reused it inside `WeeklyPlanPreview` so expanding any training-day row reveals the same detailed prescription — sets × reps, tempo, rest, load, coaching cue — not just an exercise-count summary.
- Each weekly day is already a fully-generated session (the Prompt-4 fan-out), so the fix was purely UX: render what the AI actually returned instead of abbreviating it.

**B) Save-to-Library from the generator**
- `savePlanToLibrary(plan, defaultName)` on the App — prompts for a name, stores via `savePlan()`. Works for single *and* weekly plans.
- Both `PlanPreview` and `WeeklyPlanPreview` accept `onSave` and show a gold-bordered **Save Plan** button next to Start.
- Records carry: `id`, `name`, `type` (`single` | `weekly`), `tagline`, the full `plan` (single) or `days` array (weekly), plus `createdAt` / `updatedAt` stamps.

**C) Storage helpers (in addition to the P4 ones)**
- `STORAGE_KEYS.plan(id)` → `plans:{id}` and `STORAGE_KEYS.schedule(date)` → `schedule:{YYYY-MM-DD}`.
- `loadAllPlans()` / `savePlan()` / `deletePlan()` — deletion also prunes any calendar entries referencing the plan so the calendar never shows dangling cards.
- `loadSchedule(date)` / `loadAllSchedule()` / `writeSchedule()` / `addToSchedule()` / `removeFromSchedule()`.
- Calendar entries: `{ id, planId, dayKey | null, addedAt }` — `dayKey` binds a specific day of a weekly plan to a calendar date.

**D) Planner tab with two views**
- New bottom-nav tab (`calendar` icon), with a Library / Calendar toggle inside.
- **Library view** (`PlannerLibrary`):
  - Search bar filters across plan name, tagline, session title, and every exercise name (weekly-aware — it searches across every day's main block).
  - "New Plan" button seeds a blank single-session plan via `blankPlan()` and drops you straight into the editor.
  - Each `PlanCard` shows type badge, last-updated, session-summary line, Edit / Duplicate / Delete IconBtn stack. Weekly cards expose Mon–Sun chips (rest days disabled) so you can start any day directly; single cards show a big Start button.
- **Calendar view** (`PlannerCalendar`):
  - Full month grid, prev/next navigation, "today" highlighted in ember, selected day ringed in gold.
  - Each cell shows up to two scheduled-plan chips + an overflow count.
  - Right-side detail panel lists scheduled entries for the selected day with a Start button per entry, plus a `SchedulePicker` (plan select + weekly day-key select when applicable) for adding new bookings.

**E) `PlanEditor` — "define all plans like a coach"**
- Full-screen modal ("fixed inset-0"), opens when `editingPlanId` is set.
- Edits plan metadata (name, tagline) and, for weekly plans, exposes a Mon–Sun tab strip to switch between per-day sessions. Each weekly day can be toggled to/from Rest (flipping the flag auto-seeds a `blankSession()` so the structure stays valid).
- `SessionEditor` handles the active session: session title, tagline, estimated minutes, finisher note, plus three collapsible-in-structure sections (Warm-up / Main Block / Cool-down) with Add buttons.
- `ExerciseEditor` exposes the full coaching surface per exercise — name, sets, reps, tempo, rest, load, cue. `BlockItemEditor` covers warm-up/cool-down (name, duration, cue).
- Save path goes through `onSave` → `savePlan()` → `bumpRefresh()` → toast, so the Library list reflects the change immediately.

### Why these choices / assumptions

- **Re-used `FullSessionBody` instead of a separate "detailed weekly row".** The Prompt-4 weekly fan-out already produces the same schema per day that the single-plan generator produces — a dedicated renderer would duplicate code and drift over time. Extracting the shared body keeps one source of truth.
- **Plans and schedules are two separate storage namespaces.** Keeps plan lifecycle (edit, rename, delete, duplicate) independent from calendar entries. A plan referenced by 10 dates doesn't get 10 copies; just 10 pointer rows in `schedule:*` keys. Deleting a plan does a best-effort prune across `schedule:*` so stale references don't linger, but the calendar also gracefully renders `(deleted plan)` if a race occurs.
- **Calendar entry carries `dayKey`, not a snapshot.** For weekly plans, the calendar schedules *Monday-of-this-weekly-plan* rather than copying Monday's exercises. Edits to the plan propagate to every scheduled date automatically, which is the coach-like behavior the user asked for.
- **Search matches by substring across every exercise name.** A coach thinks "where did I put the session with front squats?" more than "what did I title it?". The search payload intentionally includes all `mainBlock[].name` across all days, not just the plan name.
- **PlanEditor is a modal, not a separate route.** Keeps state local and dismissible, avoids URL wiring inside a single-page CDN app, and the edits feel immediate — open, tweak a rep count, save, see the Library update.
- **Draft state uses a deep clone (`JSON.parse(JSON.stringify(plan))`).** The plan data is plain JSON (no functions, no cycles), so the cheap structural clone is safe and prevents mid-edit mutations from leaking into the Library list. Cancel really means cancel.
- **Weekly rest toggle recreates a blank session when un-resting.** Without a pre-seeded session, the editor would render an empty state with no way to add the first exercise. Auto-seeding `blankSession()` keeps the editor always interactive.
- **"New Plan" always creates a `single` plan.** Weekly creation would need a days-per-week picker, which duplicates the Generator's controls. Users who want a weekly plan generate one via AI/local coach and hit Save; from-scratch creation stays simple.
- **IconBtn for destructive actions with `activeColor="ember"`.** Keeps the delete button visually calibrated to the rest of the ember-for-danger theme without needing a bespoke button.
- **`IconBtn` stack instead of a kebab menu on plan cards.** Cards are wide enough to show 3 icons inline; adding a menu adds a click and accessibility complexity for no density win on mobile.
- **Calendar picker lives in the side panel, not a modal.** Scheduling is a high-frequency, low-ceremony action — inline select + day dropdown is two clicks and keeps the month grid in view while you confirm.

---

## Prompt 6 — Coach-grade plan authoring: libraries, day-based programs, day-of-week

### What was asked

> "Inside plan section, give option to search for warm up and workouts and then add and while making a plan, give me option to choose day of the week to do the plan - or a plan need to have multiplr workouts for different days, think like a coach, how would you do plans to follow for different clients"

### What I did

**A) Movement / warm-up / cool-down libraries**
- `EXERCISE_LIBRARY` — ~35 curated exercises spanning lower/upper, push/pull, olympic, and conditioning. Each entry carries `pattern`, `parts[]`, `equipment[]`, and `defaults` (sets/reps/tempo/rest/load/cue) so tapping one drops a fully-prescribed row into the session.
- `WARMUP_LIBRARY` (14 drills) and `COOLDOWN_LIBRARY` (9 protocols) — name + duration + cue, ready to insert.

**B) Unified program data model**
- New canonical shape: `{ type: "program", name, tagline, days: [ { id, label, dow, focus, isRest, plan } ] }`.
- `normalizeProgram(record)` migrates on read: `type: "single"` → one-day program with `dow: null`; `type: "weekly"` → days[] with `dow` inferred from day short-name (`Mon → 1`). Legacy records in storage stay untouched; the migration is transparent at load time.
- `DOW_LABELS` / `DOW_FULL` drive every display label; `DOW_SHORT_TO_INDEX` handles the legacy string-key → numeric-dow conversion.
- `savePlanToLibrary()` (from Generator previews) now always writes the program shape — single plans become a 1-day program, weekly plans become a 7-day program with `dow` assigned.

**C) `MovementPicker` — searchable modal**
- Fullscreen modal layered above the editor (`z-[60]`), opens when the user clicks any "Browse …" button inside a session block.
- Single component handles three modes (main, warmup, cooldown) via a `config` object derived from the `block` prop — different libraries, different filters (Push/Pull/Legs/Core/Olympic/Conditioning/Full Body for exercises; none for warm-ups/cool-downs), different metadata rendering, different `toItem()` shape.
- Search matches across name, movement pattern, body parts, equipment, and cue. Filter chips AND the search compose.
- Tap-to-add stays open so a coach can stack several movements at once; **Done** closes the picker.

**D) `PlanEditor` — day-centric rework**
- Every plan is a program in the editor. The header shows "N-Day Program" (or "Single Session" when days.length === 1).
- **Days panel**: chips per day showing DOW (or `Day N` when unscheduled), "Add Day" appends a new day with a blank session, "Remove Day" deletes the active one (disabled at 1).
- **Day Settings**: Day Label, Day of Week dropdown (— not scheduled — / Sunday…Saturday), Focus text, Rest toggle. Toggling to rest clears the session; toggling back auto-seeds a `blankSession()` so the day is immediately editable.
- **SessionEditor** for the active (non-rest) day: warm-up, main block, cool-down each with a "Browse …" button that opens the picker filtered to that block. Per-exercise editing (name, sets, reps, tempo, rest, load, cue) still available on the inserted items so coaches can tweak defaults.

**E) Library card / calendar / start flow updates**
- `PlanCard` reads `days[]` uniformly — cards show N day chips when multi-day (labeled with DOW or `Day N`), or a single Start button when there's exactly one day. Clicking a chip starts that day.
- `SchedulePicker` picks any day from any program by `day.id`, showing a secondary dropdown only when the program has >1 training day.
- `planFromRecord` matches by `id` first and falls back to short-label or label so old calendar entries pointing at `"Mon"` keep working across the migration.
- Start metadata still stamps `weeklyDay`, `weeklyFocus`, plus a new `programDayId` for future history surfaces.

### Why these choices / assumptions

- **One program shape beats a `single | weekly | program` tri-type.** The previous branching forced every renderer, card, and scheduler to fork on `type`. A single `days[]` always-array makes the editor, library, calendar, and run-flow uniform — a "single" plan is just a program with one day. Coaches don't think in "single vs weekly"; they think in days and assignments.
- **Library entries carry prescriptions, not just names.** A coach never writes "Back Squat" with no reps. Pre-filling `5×5 @ 75-85% 1RM, 3-1-1-0, 2-3 min, cue "drive the floor away"` means the picker produces publishable prescriptions on tap. Coaches still edit per-exercise — defaults are a starting point, not a straitjacket.
- **Pattern/parts/equipment tags on exercises, no tags on warm-ups/cool-downs.** Main-block filtering is where coaches need surgical lookups ("show me pull movements"). Warm-ups and cool-downs are short lists where search is enough — filter chips would be UI overhead without signal.
- **Filters compose with search.** A coach searching "dumbbell press" while Push is active should see incline DB press. Filter narrows the pool; search filters within. This matches how users actually think.
- **Day-of-week is optional per day, not mandatory.** Not every coach programs by calendar day; some write "Day A / Day B / Day C" templates that clients run in order. `dow: null` + free-form label supports both styles without two UIs.
- **Migration at read, not at write.** Normalizing on `loadAllPlans()` means legacy records (`type: "single"`, `type: "weekly"`) keep rendering through the new components without a storage migration script. The first time a legacy record is *edited*, save promotes it to `type: "program"` — a lazy, reversible upgrade.
- **Calendar keys are day `id`s going forward; legacy string keys still resolve.** `planFromRecord` falls back to short-label and label match so existing calendar entries scheduled as `dayKey: "Mon"` continue to launch the right session after migration. Zero user-visible breakage for users returning from Prompt 5's state.
- **Picker is stateful and stays open after a pick.** Coaches program in bursts ("pull session: row, pulldown, face pull, curl"). Auto-closing after each selection would break that flow and triple the click count.
- **Empty main block after "New Plan".** Previous blank plans seeded a bogus "New Exercise" placeholder. Starting empty makes the Browse-first flow more obvious and prevents accidentally-shipped placeholders.
- **`z-50` editor / `z-[60]` picker.** Tailwind's arbitrary value syntax keeps the stacking rules explicit; the picker must always sit above the editor so the dim backdrop is correct.
- **Add Day / Remove Day confirm-on-delete.** Add is reversible, delete is destructive — one confirm before wiping a day's worth of programming.
- **Deep clone via `JSON.parse(JSON.stringify(plan))` still works because program data is plain JSON.** No change from Prompt 5 — cancel still means cancel, even across the day/session structure.

---

## Prompt 7 — "Generate more" and pick-a-duration in the generator

> _In the generated plan give me option to add plan or generate more if required, or give me option to choose duration — so I can generate more._

The single-session generator was a dead-end: you'd generate a workout, like it, and the only way to get a second day was to re-open the generator and run it again (losing the first). The weekly generator was the opposite extreme — it committed you to a 3–6 day split up front. Prompt 7 lets the coach pick duration in advance _or_ extend incrementally from the preview.

**A) Sessions-to-generate picker (Single mode)**
- New state `sessionCount` defaults to `settings.defaultSessionCount || 1`, persisted back to settings on generate.
- Chips 1–6 rendered under Plan Mode = Single; `1 session` stays a single-plan preview, `2–6 sessions` triggers `generateMultiDayProgram`.
- Help text under the chips tells the user they can stick with 1 and extend on the preview — the picker is a shortcut, not a requirement.

**B) `generateOneDay` + `generateMultiDayProgram` helpers**
- `generateOneDay({ useLocal, apiKey, baseOpts, signal, dayLabel, focus })` routes to `generateWorkoutLocal` or `generateWorkoutAI` and wraps the result in `{ day, focus, isRest: false, plan }` — the same shape weekly plans already use.
- `generateMultiDayProgram` loops N times in order (not parallel) so the user sees sequential progress and abort cancels cleanly mid-way. Returns a `type: "weekly"` record titled `N-Session Program — <category labels>` with tagline `"N sessions. Stack the work."`.
- `handleGenerate` branches on `sessionCount > 1`: single path unchanged, multi path calls `generateMultiDayProgram` with the same inputs.

**C) "Generate Another Day" on both previews**
- `PlanPreview` (single) and `WeeklyPlanPreview` (multi-day) both accept `onGenerateMore` / `extending` props. Button sits in the header button stack alongside Save, styled with the ember accent to read as "iterate" rather than "commit".
- `handleGenerateMore` reads the current preview:
  - If it's `type: "weekly"`, append `generateOneDay(...)` as `Day ${days.length + 1}` and bump the title's session count when the title already says `N-Session Program`.
  - If it's a single plan, wrap the current plan as `Day 1` and the new one as `Day 2`, promoting the preview to a full `type: "weekly"` program in-place.
- Abort handled: `abortRef.current` plus an `extending` flag disables the button while a generation is in flight. Errors surface through the same `setError` channel as the main generator.

**D) No storage churn**
- Nothing persists until the user hits Save Plan. The preview-level "promotion" from single to weekly is purely in-memory React state; if the coach cancels, nothing changes on disk.
- Saving a promoted program goes through the Prompt 6 `savePlanToLibrary` path and lands as `type: "program"` — the temporary `type: "weekly"` shape only exists during the preview session, bridging the generator (which produces weekly) and the library (which stores programs).

### Why these choices / assumptions

- **Two entry points for the same outcome is intentional.** Some coaches plan the whole week on Sunday; others build a session, test it, then build the next. The Sessions chip serves the first; Generate Another Day serves the second. Forcing one flow would alienate the other.
- **Sequential generation, not parallel.** Parallel is faster but the user can't meaningfully see or abort mid-flight, and the API burst is rude to rate limits on the AI path. Sequential gives the toast/progress room to land and respects cancel.
- **Promoting single → weekly in preview, not at save.** If promotion happened at save, hitting Generate Another Day on a single preview would mean the second click generates, the third click still thinks it's single, etc. Promoting the preview state on the first extend keeps the model straight: once you extend, the preview is a program.
- **Title says `N-Session Program`, not `Week 1`.** Coaches who use Day A/B/C templates don't want calendar language; ones who run actual weekly splits can edit the title in the editor. Generic wins.
- **Generate-more button lives in the header stack, not a footer.** Users scan the header for actions (Start / Save are there). Burying a generation affordance below the exercise list would hide it from exactly the users most likely to want it (the ones still deciding whether this plan is enough).
- **No "duration in weeks" slider.** Per-week programming is a separate abstraction (mesocycles, deloads, progression) that doesn't belong in the generator UI. Sessions-to-generate is the unit that matches how the AI prompt is built today.
