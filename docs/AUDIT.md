# FitMeal change protocol

## 2026-08-26 — GitHub Pages deployment for the frontend

### Implemented

- Added `.github/workflows/deploy-pages.yml`: builds `frontend/dist` and publishes it to GitHub Pages on every push to `main` (and on manual dispatch), reading `VITE_API_URL`/`VITE_CLERK_PUBLISHABLE_KEY` from repository Actions variables at build time.
- `vite.config.ts` now sets `base: '/Fitmeal/'` when the workflow's `GITHUB_PAGES` flag is present (still `/` for local dev and Render, which serves from the domain root); `router.tsx` reads that same value via `basepath: import.meta.env.BASE_URL` so client-side routes resolve under the `/Fitmeal/` subpath.
- The frontend build script now copies `dist/index.html` to `dist/404.html` so GitHub Pages — which has no server-side rewrite support — still loads the app on a hard-refreshed deep link; harmless on Render, which already has its own `/* → /index.html` rewrite.
- Documented the one-time setup (enabling Pages as a GitHub Actions source, deploying the API first, setting the two build-time variables, adding the Pages origin to Clerk) in `docs/DEPLOYMENT.md`, and linked it from the README.
- GitHub Pages only serves static files, so the Express API and MongoDB still need to run elsewhere (Render, per the existing Blueprint, or another Node host) — this change makes the frontend deployable there, not the whole stack.

### Verification

- `GITHUB_PAGES=true npm run build -w frontend` emits `/Fitmeal/`-prefixed asset URLs and a `404.html` identical to `index.html`; a plain `npm run build -w frontend` still emits root-relative (`/`) asset URLs, confirming Render/local are unaffected.
- `npm run build` succeeds for both workspaces and `npm test` passes all 30 backend tests.

## 2026-08-26 — Professional visual-system redesign

### Implemented

- Refined the existing premium editorial direction into a consistent production UI: a sticky glass header, compact active navigation, improved typography scale, rounded controls/surfaces, theme-aware shadows, visible focus states, polished disabled states, and a calmer layered page background.
- Rebuilt the homepage hierarchy and copy around real product value. Removed fake avatar initials and the speculative mobile-app promotion, replacing them with implemented capabilities, concrete product statistics, and a flexible-planning section.
- Redesigned the recipe experience with a structured filter panel, accessible pressed states, pill controls, richer card hierarchy, image overlays, descriptions, and consistent responsive cards.
- Polished profile forms, meal-plan cards, progress/account panels, history rows, recipe/sign-in modals, and both assistant surfaces.
- Replaced placeholder social links with a useful, accessible product footer and corrected stale FAQ navigation copy.
- Removed the old fixed-color nutrition/mobile panels so all application surfaces now follow the six themes; only the illustrative phone mockup retains fixed device-screen colors.

### Verification

- Reviewed before/after screenshots of Home and Recipes at 1440px and 500px viewports.
- `npm run build` succeeds for both workspaces after the redesign.
- `npm test` passes all 30 backend tests.

## 2026-08-26 — Final documentation and deployment handoff

### Implemented

- Reworked the root README into an end-stage project handoff covering the complete feature set, architecture, local setup, environment variables, authentication behavior, tests, API routes, and remaining production steps.
- Converted `docs/SPEC.md` from an evolving build plan into an implementation-matched product specification with access rules, acceptance status, API contracts, known constraints, and an explicit deployment-pending release state.
- Expanded `docs/DEPLOYMENT.md` with preflight checks, service-by-service variables, MongoDB and Clerk setup, production smoke tests, operations notes, and hardening tasks.
- Updated `render.yaml` to Render's current Blueprint structure: the static frontend now lives in the top-level `services` list as `type: web` with `runtime: static`.
- Corrected the recipe-image README from eight to nine local assets and clarified local versus deployed image updates.
- Documented remaining limitations instead of presenting them as completed security controls: the public recipe deep-link route, permissive CORS, route-level plan uniqueness, multiple profiles per account, missing frontend automation, and the pending first production deployment.

### Verification

- `npm run build` succeeds for both workspaces.
- `npm test` passes all 30 backend tests across 4 test files.
- `git diff --check` reports no whitespace errors, and the updated Blueprint/documentation were reviewed together for matching service names, commands, environment variables, routes, and release status.

## 2026-08-26 — Switch the AI assistant from Gemini to Groq

### Implemented

- Replaced `backend/src/shared/gemini.ts` with `backend/src/shared/groq.ts` (`askGroq`), calling Groq's OpenAI-compatible `https://api.groq.com/openai/v1/chat/completions` endpoint (model `openai/gpt-oss-20b`) instead of Google's Gemini API. Same shape as before: automatic retry on transient 503s, a friendly message on 429/other failures, and a `json: true` option for JSON-only replies.
- Renamed the env vars to `GROQ_API_KEY` / `GROQ_MODEL` in `backend/src/config/env.ts`, `backend/.env.example`, and `render.yaml`; updated the assistant route and docs (`README.md`, `docs/SPEC.md`, `docs/DEPLOYMENT.md`, `AGENTS.md`) accordingly.
- First tried xAI's Grok API (an easy mix-up with "Groq"), but confirmed via the user's own `Abdulkhaliq009/Portfolio` repo — which already runs a Groq-backed chat endpoint — that Groq was the intended provider; it also keeps a genuine free tier, unlike Grok.

### Verification

- `npm run build` succeeds for the backend workspace.

## 2026-08-26 — Final-project reliability fixes

### Implemented

- Added `isCheatDay` to the Mongoose meal-plan schema so the flag returned by `buildPlan()` survives database writes and the dedicated current-day/history UI is shown after loading a saved Sunday plan.
- Added an accessible mobile navigation toggle. The primary routes are no longer unreachable when the desktop navigation is hidden below 720px, and selecting a destination closes the mobile menu.
- Replaced the progress review's obsolete AI-era `verdict` counts with values the current rule-based flow actually stores: meals logged, confirmed as planned, and changed. The written summary and frontend statistic now use those real values without inventing nutrition ratings for free-text meals.
- Added route-level regression coverage for the persisted cheat-day flag and the confirmed/changed meal counts. The backend suite now contains 27 passing tests.

### Verification

- `npm run build` succeeds for both workspaces.
- `npm test` passes all 27 backend tests.

## 2026-08-26 — Site-wide AI assistant

### Implemented

- Added a compact floating FitMeal AI launcher for signed-in users on every route. It opens the existing Gemini-backed assistant in a responsive, closable panel and preserves the established chat behavior, history, loading state, and error messages.
- Kept the full assistant panel on the Meal Planner page for users who prefer the original in-page layout.
- Added backend and browser timeouts so an unreachable Gemini/API connection can no longer leave the chat on "Thinking…" indefinitely; users now receive a clear retry message.
- Added a tested local fallback for common meal and nutrition questions. Gemini remains the primary assistant, but an unreachable service, missing key, or exhausted quota now produces clearly labelled basic offline guidance and always completes the chat request.

## 2026-08-24 — Daily meal variety, goal-based menus, and a weekly cheat day

### Implemented

- Meal plans no longer repeat the same four dishes every day. Each time slot (Breakfast/Lunch/Snack/Dinner) now has a small pool of dishes, and `buildPlan` deterministically picks one per slot from a hash of the date + goal + slot name — different days spread across the pool, while reloading the same day still shows the same plan (matches the existing get-or-create-per-day route behavior).
- Every dish is tagged with the goals it suits, and the "lose" pool and "maintain"/"gain" pool are disjoint by design — a "lose" profile and a "gain" profile now see genuinely different meals on the same day, not just differently sized portions of the same four dishes. New dishes reuse already-shipped assets: recipe photos already in `frontend/public/images/recipes/` (resolved as a relative path against the frontend's own origin, no new hotlink needed) plus a few additional Unsplash photos already used elsewhere in the app's own recipe data, each curl-verified before use.
- Added a weekly cheat day (every Sunday): `buildPlan` returns `isCheatDay: true` and a free-choice placeholder for all four slots instead of a fixed menu. `MealPlanCard` shows a dedicated celebratory banner in place of the normal meal list on that day (no confirm/swap controls — there's nothing to compare against), and `PlanHistory` shows a "Cheat day 🎉" badge with dashes instead of a stale "Not logged / 0 kcal" reading for past cheat days.
- `buildPlan(profile, date)` now takes the date as an explicit argument instead of only the profile, since both the day-to-day variety and the cheat-day check depend on it.
- Extended the backend test suite (5 new tests, 25 total, still zero AI/network dependency): the menu differs across a work week, "lose" and "gain" produce different dishes on the same day, Sundays are marked as a cheat day with zero-calorie placeholders, and other weekdays are not.

## 2026-08-24 — Migrate all frontend styling to Tailwind CSS

### Implemented

- Converted every component's markup from hand-written CSS classes to Tailwind utility classes — all 17 `.tsx` files across `home`, `recipes`, `meal-plan`, `progress`, `account`, and `shared/components`, plus the router's `Layout` — and deleted the CSS files that backed them (`recipes.css`, `homepage.css`, `nutrition.css`, `faq.css`) once nothing referenced their classes any more. `styles.css` is now just: the Google Fonts import, the Tailwind import, font/color theme tokens, the six `[data-theme]` variable blocks (untouched), one `@keyframes` (for the recipe/sign-in modal fade, which utilities can't express), and a small `@layer base` for genuinely global element defaults (`button`, `h1`–`h3`, `input`/`select`) — everything else is inline utilities.
- Bridged Tailwind to the existing 6-theme CSS-variable system with `@theme inline` in `styles.css`: `--color-page: var(--bg-page)` (etc. for every token) generates real utilities (`bg-page`, `text-ink`, `text-accent`, `border-line`, ...) that reference the underlying variable at runtime rather than copying its value at build time, so the `[data-theme]` attribute swap in `shared/theme.ts` still works with zero JS changes — verified by checking computed styles resolve to each theme's actual color, not just that the page renders.
- Preserved pixel-for-pixel layout using Tailwind's fractional spacing scale (e.g. `gap-7.5` for 30px) for anything that divides cleanly by 4px, and arbitrary-value brackets (`text-[13px]`, `grid-cols-[1.6fr_repeat(4,1fr)]`) for everything else — verified against the IDE's own canonical-class suggestions rather than guessing.
- Kept the two deliberately theme-independent dark panels (the homepage phone mockup, the "nutrition basics" and "mobile app" sections) exactly as before, including the pre-existing inconsistency where their background is hardcoded but some of their text still follows the active theme.
- Verified every page (`/`, `/recipes`, `/planner`, `/progress`, `/account`) against all 6 themes via headless-browser sweeps (zero console/page errors), plus targeted checks: computed nav active-state colors per theme, recipe-card hover/focus lift, the sign-in-gate modal, and — since this sandbox has no real Clerk sign-in — a temporary mock route rendering `MealPlanCard`/`PlanHistory` with fake data to check the swap/confirm/expand states, deleted once confirmed.
- Fixed a real bug the conversion surfaced: `tsc --noEmit` had been silently passing while `tsc -b` (what `npm run build` actually runs) correctly rejected `(condition ? 'a' : 'b') as const` in `PlanHistory.tsx` — a `const` assertion can only apply to a literal, not a ternary's result. Also caught `ErrorBoundary.tsx`, easy to miss since it's not a "page" — its fallback UI referenced CSS classes already deleted from `styles.css` by the time the sweep reached it.

## 2026-08-24 — Backend tests, error boundary, and deployment config

### Implemented

- Added a backend test suite: Vitest + Supertest + `mongodb-memory-server` (a real, ephemeral in-memory MongoDB, not mocked model methods), runnable via `npm run test -w backend` (or `npm test` from the repo root). 21 tests across 3 files:
  - `meal-plan.service.test.ts` — pure unit tests for `getTargets` (the Mifflin-St Jeor calorie/macro formula: goal adjustment, sex offset, activity scaling) and `buildPlan` (one meal per time slot, each with a title/image/ingredients/steps, calorie shares summing back to the target).
  - `ownership.test.ts` — direct tests of `findOwnedProfile` against a real database: returns the profile for its owner, `null` for a different user's id, `null` (not a throw) for a malformed id, `null` for a missing id.
  - `profile.routes.test.ts` — Supertest integration tests against the exported `app` (no real server or Clerk needed — `@clerk/express` is mocked so tests can switch "who's signed in"), covering the ownership scoping end-to-end: `user_b` can neither read `user_a`'s profile via `GET /latest` nor edit it via `PATCH /:profileId` (404, and the original data is left untouched), plus the 401/400/201/200 happy- and unhappy-path status codes.
  - Excluded `**/*.test.ts` and `src/test/` from the `tsc` build (`backend/tsconfig.json`) so test files don't leak into `dist/`.
- Added `frontend/src/shared/components/ErrorBoundary.tsx` (a class component — React error boundaries can't be hooks) and wired it in two places: around each routed page's `<Outlet />` in `router.tsx`, so a crash in one page falls back to a "Something went wrong — try again / go home" message while the header/nav/footer stay usable; and around the whole `<App />` in `main.tsx` as a last-resort net for errors above the router itself. Verified with a temporary forced-throw + Playwright check (fallback renders, nav survives, recovery works), then reverted.
- Added `render.yaml` (a Render Blueprint deploying the API as a Node web service and the frontend as a static site from this one repo) and `docs/DEPLOYMENT.md` (a from-scratch walkthrough: push to GitHub, create the Blueprint, fill in secrets, point the frontend's `VITE_API_URL` at the API's assigned URL once it exists, redeploy). Secrets are left as manual (`sync: false`) fields the user fills in on Render's dashboard, not guessed or hardcoded — actually creating the Render account and running the deploy is outside what this environment can do, so this is configuration plus instructions, not a completed live deployment.

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
