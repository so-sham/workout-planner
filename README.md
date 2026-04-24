# FORGE — AI Celebrity Personal Trainer

A single-page workout planner and tracker that acts as a celebrity-grade AI personal trainer. Generates workouts across seven categories (Barbell Strength, Dumbbell Strength, Compound Lifts, HIIT, Circuit Training, Hyrox-Style, Full Gym), logs sets live, tracks progress with PR detection and key-lift 1RM charts, and stores everything locally in the browser.

## Stack

- React (via CDN) + hooks
- Recharts for progression charts
- Tailwind CSS for styling
- Anthropic API (`claude-sonnet-4-20250514`) for workout generation

## Run

Open [`index.html`](index.html) directly in a modern browser. All state is persisted via `window.storage` (localStorage) — no server, no build step.

The AI workout generator calls `https://api.anthropic.com/v1/messages` from the browser. You may need to wire up an API key / proxy depending on your environment.

## Documentation

See [`DOCUMENTATION.md`](DOCUMENTATION.md) for the full implementation log — every prompt, what was built, and the key design choices behind each feature.
