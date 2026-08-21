# FitMeal build plan

## Purpose

FitMeal provides simple meal-planning, an AI meal assistant, and weight check-in tools. It is an educational planning aid, not medical advice.

## Current scope

1. Show a public nutrition-focused home page.
2. Show recipes (meals, fruits, snacks, desserts, smoothies) for weight loss, maintenance, and weight gain, each with an estimated nutrition breakdown, photo, and tags.
3. Show ingredients and preparation steps for each recipe.
4. Collect a profile (age, sex, height, weight, activity, goal) through a form on the Meal Planner page and save it to MongoDB.
5. Generate a full-day meal plan from that profile.
6. Let a user replace any meal slot with a freely-typed meal; Gemini estimates its nutrition and judges how well it fits that slot's budget and the user's goal, and the swap is saved to the plan.
7. Offer an AI assistant (FitMeal AI, powered by Gemini) on the Meal Planner page for general meal and nutrition questions.
8. Record and display weight check-ins.
9. Compute a progress review (weight trend vs. goal direction, recent custom-meal fit) and have Gemini turn it into a short written summary on request.

## Architecture

```text
React + Vite browser app
        |
        | /api requests
        v
Express API on port 4000  ----->  Gemini API (generativelanguage.googleapis.com)
        |
        v
MongoDB
```

During development, Vite proxies `/api` to the Express API. Production deployments must either serve both from one origin or configure `VITE_API_URL` with the public API URL.

AI features (assistant chat, custom-meal nutrition check, progress review) require `GEMINI_API_KEY` in `backend/.env`. Without it, those endpoints return a clear 503 instead of failing silently; the rest of the app works normally.

## Functional requirements

- `GET /api/health` returns `{ "ok": true }`.
- Profiles, meal plans, check-ins, and assistant requests are validated by the backend.
- Planner and progress screens show a clear loading, empty, or error state.
- The frontend must not contain API keys or database credentials.
- Clerk provides optional sign-in, sign-up, and session middleware when its environment keys are configured. Phone number as a required sign-up field is controlled entirely in the Clerk dashboard (Configure → Email, Phone, Username), not in this codebase.
- Every async Express route wraps its logic in `try/catch` and calls `next(error)` on failure — Express 4 does not forward rejected promises automatically, so this is required to avoid crashing the process on a bad request.

## Non-functional requirements

- Use TypeScript throughout the application source.
- Keep UI text and error messages understandable for end users.
- Keep components focused and avoid premature abstractions.
- `npm run build` must build frontend and backend successfully.

## Known constraints

- There is no multi-user auth binding profiles/plans/check-ins to a signed-in Clerk account yet: `/api/profiles/latest` always returns the single most recently created profile in the whole database, not "the current user's" profile. Clerk is wired in for sign-in/sign-up UI, but no route is protected or scoped by user ID yet — needed before this can support more than one real user.
- Gemini's free tier has a daily request quota; once exhausted, AI features return a friendly "usage limit" message until it resets rather than an error page.
