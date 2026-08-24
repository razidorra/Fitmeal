# FitMeal build plan

## Purpose

FitMeal provides simple meal-planning, an AI meal assistant, and weight check-in tools. It is an educational planning aid, not medical advice.

## Current scope

1. Show a public nutrition-focused home page with a site-wide footer.
2. Show recipes (meals, fruits, snacks, desserts, smoothies) for weight loss, maintenance, and weight gain, each with an estimated nutrition breakdown, photo, and tags. Clicking a recipe opens its full details (ingredients, preparation) in a modal, not a page navigation.
3. Collect a profile (age, sex, height, weight, activity, goal) through a form on the Meal Planner page and save it to MongoDB, scoped to the signed-in Clerk account. The profile can be edited later from the same page.
4. Generate one meal plan per calendar day per profile (in the user's own local day, not the server's). Opening the planner on a new day silently creates that day's plan; a "Refresh plan" button force-regenerates the current day. Each meal slot's dish is chosen deterministically from the date, the profile's goal, and the slot — from a pool of options, not a fixed set of four — so the same day always shows the same plan (stable across reloads) while different days spread across the pool instead of repeating. "Lose" and "maintain"/"gain" goals draw from disjoint dish pools, so the plan itself looks different for those two directions, not just differently portioned.
5. Treat every Sunday as a cheat day: the generated plan carries `isCheatDay: true` and a free-choice placeholder for all four slots instead of a fixed menu, with its own banner in the UI and no confirm/swap controls (there's nothing to compare a free choice against).
6. Let a user replace any (non-cheat-day) meal slot with a freely-typed meal. This is a plain, AI-free save — it records what they actually had and keeps the original suggested meal's title, photo, and recipe details so both can still be seen ("was X, now Y").
7. Offer a per-meal "Did you have this, or something else?" confirmation, and a computed (non-AI) day-by-day history ("This week" / "Previous week") showing each day's meals and how many were changed from the suggestion — with a "Cheat day" badge instead of a stale 0 kcal reading for a past cheat day.
8. Offer an AI assistant (FitMeal AI, powered by Gemini) on the Meal Planner page for general meal and nutrition questions. This is the only remaining AI-dependent feature.
9. Record and display weight check-ins, scoped to the signed-in account.
10. Compute a progress review (weight trend vs. goal direction, recent meal-swap fit) with a rule-based written summary — no AI involved, so it never depends on any external quota.
11. Let signed-out visitors see and interact with the profile/check-in forms, but show a clear "please sign in" prompt instead of an error when they try to save or see results.
12. Provide an Account page (signed-in only) showing identity (from Clerk), a quick plan/progress summary, and a site-wide theme toggle (six themes) saved per device. The signed-in header also shows the account's name, an "online" indicator, and a directly-clickable Log out button rather than hiding sign-out behind a menu.

## Architecture

```text
React + Vite browser app
        |
        | /api requests
        v
Express API on port 4000  ----->  Gemini API (generativelanguage.googleapis.com) — assistant chat only
        |
        v
MongoDB
```

During development, Vite proxies `/api` to the Express API. Production deployments must either serve both from one origin or configure `VITE_API_URL` with the public API URL.

Only the AI assistant chat requires `GEMINI_API_KEY` in `backend/.env`. Without it, that one endpoint returns a clear 503 instead of failing silently; the rest of the app (including meal swaps and progress reviews, both rule-based) works normally regardless.

## Functional requirements

- `GET /api/health` returns `{ "ok": true }`.
- Profiles, meal plans, check-ins, and assistant requests are validated by the backend.
- Every route that reads or writes a profile, meal plan, or check-in requires a signed-in Clerk session and verifies the record actually belongs to that user (`findOwnedProfile`) — a request for someone else's ID gets a 404, not their data.
- Planner and progress screens show a clear loading, empty, or error state, and a guest-friendly form-then-alert flow when signed out.
- The frontend must not contain API keys or database credentials.
- Clerk provides sign-in, sign-up, and session middleware. Phone number as a required sign-up field is controlled entirely in the Clerk dashboard (Configure → Email, Phone, Username), not in this codebase.
- Every async Express route wraps its logic in `try/catch` and calls `next(error)` on failure — Express 4 does not forward rejected promises automatically, so this is required to avoid crashing the process on a bad request.
- Styling is Tailwind CSS utility classes; colors come from theme utilities (`bg-page`, `text-ink`, `text-accent`, etc.) mapped onto CSS custom properties (`--bg-page`, `--text-primary`, `--accent`, ...), not hardcoded hex values, so the six-theme toggle can override them from one place. A few narrow exceptions (the homepage's phone-mockup graphic, two decorative dark panels) are deliberately left theme-independent since they represent a fixed device screenshot or an intentionally fixed dark background. The homepage and every other page also carry a subtle, theme-tinted background photo behind all content — tinted with each theme's own page color via `--bg-page-rgb` so it never competes with text.
- An `ErrorBoundary` around each routed page's content shows a "Something went wrong — try again / go home" fallback instead of a blank screen if a page throws, while the header/nav/footer stay usable.

## Non-functional requirements

- Use TypeScript throughout the application source.
- Keep UI text and error messages understandable for end users.
- Keep components focused and avoid premature abstractions.
- `npm run build` must build frontend and backend successfully.
- `npm test` (backend) must pass: unit tests for pure calculations and Supertest route tests covering per-user ownership scoping, run against an in-memory MongoDB — no real database, Clerk account, or AI quota needed to run the suite.

## Known constraints

- Gemini's free tier has a daily request quota; once exhausted, the assistant chat returns a friendly "usage limit" message until it resets rather than an error page. No other feature is affected.
- Deployment is configured (`render.yaml`, `docs/DEPLOYMENT.md`) but not run from this repo — actually creating the hosting account and completing the first deploy is a manual step for whoever owns that account.
