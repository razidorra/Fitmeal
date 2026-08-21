# FitMeal build plan

## Purpose

FitMeal provides simple meal-planning, an AI meal assistant, and weight check-in tools. It is an educational planning aid, not medical advice.

## Current scope

1. Show a public nutrition-focused home page with a site-wide footer.
2. Show recipes (meals, fruits, snacks, desserts, smoothies) for weight loss, maintenance, and weight gain, each with an estimated nutrition breakdown, photo, and tags. Clicking a recipe opens its full details (ingredients, preparation) in a modal, not a page navigation.
3. Collect a profile (age, sex, height, weight, activity, goal) through a form on the Meal Planner page and save it to MongoDB, scoped to the signed-in Clerk account. The profile can be edited later from the same page.
4. Generate one meal plan per calendar day per profile (in the user's own local day, not the server's). Opening the planner on a new day silently creates that day's plan; a "Refresh plan" button force-regenerates the current day.
5. Let a user replace any meal slot with a freely-typed meal. This is a plain, AI-free save — it records what they actually had and keeps the original suggested meal's title, photo, and recipe details so both can still be seen ("was X, now Y").
6. Offer a per-meal "Did you have this, or something else?" confirmation, and a computed (non-AI) day-by-day history ("This week" / "Previous week") showing each day's meals and how many were changed from the suggestion.
7. Offer an AI assistant (FitMeal AI, powered by Gemini) on the Meal Planner page for general meal and nutrition questions. This is the only remaining AI-dependent feature.
8. Record and display weight check-ins, scoped to the signed-in account.
9. Compute a progress review (weight trend vs. goal direction, recent meal-swap fit) with a rule-based written summary — no AI involved, so it never depends on any external quota.
10. Let signed-out visitors see and interact with the profile/check-in forms, but show a clear "please sign in" prompt instead of an error when they try to save or see results.
11. Provide an Account page (signed-in only) showing identity (from Clerk), a quick plan/progress summary, and a site-wide dark/light theme toggle saved per device.

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
- Colors across the frontend are CSS custom properties (`--bg-page`, `--text-primary`, `--accent`, etc.), not hardcoded hex values, so the light/dark toggle can override them from one place. A few narrow exceptions (the homepage's phone-mockup graphic) are deliberately left theme-independent since they represent a fixed device screenshot.

## Non-functional requirements

- Use TypeScript throughout the application source.
- Keep UI text and error messages understandable for end users.
- Keep components focused and avoid premature abstractions.
- `npm run build` must build frontend and backend successfully.

## Known constraints

- Gemini's free tier has a daily request quota; once exhausted, the assistant chat returns a friendly "usage limit" message until it resets rather than an error page. No other feature is affected.
