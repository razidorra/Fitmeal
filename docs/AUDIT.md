# FitMeal change protocol

## 2026-08-21 — Per-user auth, daily plans, rule-based reviews, and light/dark theming

### Implemented

- Added `clerkUserId` to `Profile` and a shared `requireUserId`/`findOwnedProfile` pair used by every profile/meal-plan/progress/assistant route: each now requires a signed-in session and verifies the record actually belongs to that user (previously `/api/profiles/latest` returned the single most recent profile in the whole database, regardless of who asked).
- Added `PATCH /api/profiles/:id` so a saved profile can be edited later from the Meal Planner page, instead of being create-once.
- Meal plans are now one-per-day (`date` field, in the user's own local day): opening the planner on a new day silently generates that day's plan; "Refresh plan" force-regenerates the current day. `GET /api/meal-plans/:profileId/history` powers a "This week / Previous week" view.
- Added a per-meal "Did you have this, or something else?" confirmation (`PATCH .../meals/:time/confirm`), replacing the earlier always-visible "Choose your own meal" link and a separate whole-day check that was tried and then removed as redundant.
- **Removed the Gemini dependency from the meal-swap and progress-review features** at the user's request — both are now plain, rule-based, and never depend on any external quota. Swapping a meal keeps the original suggestion's title, ingredients, steps, and photo so both the suggestion and what was actually eaten stay visible. The progress review computes its verdict from real check-in trends (direction vs. goal, magnitude) and generates the written summary from templates, not an AI call.
- Added a guest mode: signed-out visitors can see and fill in the profile/check-in forms, but submitting shows an inline "please sign in to see your plan/reviews" prompt instead of a wall blocking the form outright.
- Added a site-wide footer (`SiteFooter.tsx`), previously homepage-only, rendered once in the router layout so it appears on every page.
- Expanded the recipe collection to 24 entries (10 added this round, several using the user's own supplied photos rather than stock images), and rebuilt the Recipes page to open a modal on click (photo, tags, nutrition, ingredients, preparation) instead of navigating to a full page, with a hover/focus lift effect on each card.
- Tokenized colors across every stylesheet into CSS custom properties and added a "Warm Light" theme alongside the original "Midnight Gold", toggled via `data-theme` on `<html>` and persisted in `localStorage` (`shared/theme.ts`). The homepage's phone-mockup graphic is deliberately left theme-independent.
- Added an Account page (`/account`, signed-in only) showing Clerk identity, a today's-plan/last-7-days-progress summary, and the theme toggle; a "Profile" nav link appears only when signed in.

### Deliberate scope boundary

- The AI assistant chat is the only feature still calling Gemini. Its free-tier daily quota can still be exhausted; nothing else in the app is affected when that happens.

## 2026-08-21 — Profile form, AI assistant, custom meals, and progress review

### Implemented

- Added recipe photos (real, licence-free Unsplash images) to recipe cards, recipe detail pages, and generated meal-plan meals, with a graceful fallback when an image fails to load.
- Expanded the recipe collection from 6 to 14 entries, adding a `category` field (meal, fruit, snack, dessert, smoothie) with its own filter row on the Recipes page, alongside the existing goal filter.
- Restored a profile creation form on the Meal Planner page (`ProfileForm.tsx`), reversing the 2026-08-19 decision to keep the frontend profile-free — the planner and progress pages required a saved profile but had no way to create one. Saving a profile now immediately generates a meal plan.
- Added an AI assistant ("FitMeal AI") on the Meal Planner page, backed by Google Gemini (`GEMINI_API_KEY` / `GEMINI_MODEL` in `backend/.env`). xAI's Grok API was evaluated first but requires purchased credits with no free tier; Gemini has a genuine no-cost tier and was used instead.
- Added a shared `backend/src/shared/gemini.ts` helper (`askGemini`) used by all three AI-backed routes: it retries automatically on Gemini's transient 503 "high demand" responses, and returns a friendly message instead of raw API error JSON on 429 (quota) and other failures.
- Added a "choose your own meal" flow: typing a freeform meal description on any meal-plan slot sends it to Gemini, which estimates its nutrition and returns a `great fit` / `reasonable` / `poor fit` verdict against that slot's calorie/protein budget; the swap is persisted on the plan.
- Added a "How am I doing?" review on the Progress page: computes a real weight-trend verdict from check-in history against the profile's goal direction, factors in how recent custom meal choices scored, and asks Gemini to turn those numbers into a short written summary.
- Fixed the missing `try`/`catch` + `next(error)` pattern across all async Express routes (profile, meal-plan, progress) — Express 4 does not forward rejected promises to error middleware automatically, so an invalid request previously risked crashing the whole process instead of returning a JSON error.

### Deliberate scope boundary

- Custom-meal and progress-review nutrition numbers are AI estimates, not measured values — the UI does not claim otherwise.
- No per-user scoping was added: profiles/plans/check-ins remain single-latest-record based, not tied to a signed-in Clerk identity. See `docs/SPEC.md` known constraints.

### Verification

- `npm run build` succeeds for both workspaces.
- Manually verified end-to-end via the running dev servers and a headless-browser pass: profile creation → plan generation → custom meal swap → progress review, plus the assistant chat, all render and degrade gracefully when Gemini's key is missing or its quota is exhausted.

## 2026-08-19 — Baseline documentation and frontend review

### Implemented

- Added `AGENTS.md` with stack, source layout, TypeScript, React, API, and quality rules.
- Added this build plan and change protocol.
- Expanded the README with architecture, commands, API routes, and configuration.
- Reformatted and clarified the frontend API client, router, meal planner, and progress screen.
- Added visible loading and error states to data-driven frontend screens.

### Review findings

| Priority | Finding | Decision |
| --- | --- | --- |
| High | The profile form was removed, but planner and progress still require an existing profile. | Documented as a product decision required before further feature work. |
| Medium | Old compiled files can remain in `backend/dist` after source deletion. | Backend build now cleans `dist` before compiling. |
| Medium | Frontend API errors were not consistently visible to users. | Show a readable error state on planner and progress pages. |
| Low | Several frontend files were compressed into single long lines. | Reformatted the files with application logic changed in this review. |

### Verification

- Run `npm run build` from the repository root.
- Open `http://localhost:5173` with `npm run dev` running.
- Confirm that the home page has no profile form and no AI assistant.

## 2026-08-19 — Recipe collection

### Implemented

- Added a public `/recipes` page with goal filters for weight loss, maintenance, and weight gain.
- Added six static recipe alternatives with estimated calories, protein, carbohydrates, fats, ingredients, and preparation steps.
- Added a recipe detail route at `/recipes/:recipeSlug`.
- Added a health-focused explanation for every recipe and clearly labels all nutrition values as estimates.

## 2026-08-19 — Clerk installation

### Implemented

- Installed `@clerk/react` in the Vite frontend and `@clerk/express` in the Express backend.
- Added optional frontend Clerk provider and prebuilt login, sign-up, and user-menu components.
- Added optional backend Clerk middleware and documented the required environment variables.

### Deliberate scope boundary

- No existing API route is protected yet. Each route needs an explicit product decision about who may access it before authentication is enforced.
