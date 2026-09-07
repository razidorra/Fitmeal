# FitMeal product specification

## Document status

- Project stage: final feature-complete candidate
- Last reviewed against source: 2026-09-07
- Implementation status: complete for the scope below
- Release status: the public GitHub Pages URL is online; redeploying the current source, connecting the production API/auth stack, and completing the production smoke test are still pending

This document describes the current application, not an aspirational backlog. Historical implementation decisions are recorded in [AUDIT.md](AUDIT.md), and hosting instructions are in [DEPLOYMENT.md](DEPLOYMENT.md).

## Purpose

FitMeal helps users explore recipes, calculate an estimated nutrition target, follow a daily meal plan, record what they ate, and review weight trends. The assistant offers general meal and nutrition guidance.

FitMeal is an educational planning aid, not a medical device or substitute for a doctor or registered dietitian. All recipe and target values are estimates.

## Users and access

| User state | Available behavior |
| --- | --- |
| Clerk not configured | Home and recipe cards remain usable; recipe details, planner, progress, and account screens explain that sign-in must be configured; authenticated APIs return `503` |
| Signed out | Home and recipe cards are visible; planner/check-in forms can be tried but saving prompts for sign-in; account data and assistant are unavailable |
| Signed in | Profile, daily plans, meal logging, history, progress, account summary, recipe modal, themes, and assistant are available |

Recipe cards prompt signed-out visitors to sign in before opening the details modal. Direct `/recipes/:recipeSlug` links apply the same signed-in check, including configuration guidance when Clerk is missing from a deployment.

## Current scope

### Public experience

1. Render a responsive, nutrition-focused home page with shared header, navigation, background treatment, and footer.
2. Present 24 static recipes across meal, fruit, snack, dessert, and smoothie categories.
3. Search recipes by title, description, tag, or ingredient; filter by category and goal; and sort by recommendation, preparation time, protein, or calories.
4. Show collection statistics, a featured recipe, result counts, photos, tags, preparation time, servings, and estimated nutrition per serving.
5. Open ingredients, steps, health context, and nutrition in a modal for an allowed recipe-card interaction.
6. Preserve the recipe detail route for direct links and unknown-recipe handling.
7. Provide accessible mobile navigation and page-level error recovery.

### Authentication and ownership

1. Use Clerk for frontend sign-in/sign-up and backend session validation.
2. Require authentication for every profile, meal-plan, progress, and assistant endpoint.
3. Store the Clerk user ID on profiles.
4. Verify the owning profile before reading or mutating related meal plans or check-ins.
5. Return `404`, rather than another user's data, when an authenticated user requests a resource they do not own.
6. Show the signed-in identity, account link, and direct Log out actions in the desktop header and mobile menu.

### Profile and targets

1. Collect name, age, Mifflin–St Jeor equation choice, height, weight, activity level, and lose/maintain/gain goal. The UI explains that the formula defines male (+5) and female (−161) constants and that “Other / prefer not to say” uses −161.
2. Validate the same allowed ranges and values on the backend.
3. Create and later edit an account-scoped profile.
4. Calculate calorie needs using Mifflin-St Jeor, an activity multiplier, and a goal adjustment.
5. Derive protein from body weight and carbohydrates/fats from the calorie target.
6. Recalculate a plan only when the user explicitly refreshes after editing a profile.

### Daily meal plans

1. Get or create one stored plan for a supplied local date in `YYYY-MM-DD` form.
2. Create a new current-day plan automatically when the signed-in planner loads.
3. Select one Breakfast, Lunch, Snack, and Dinner deterministically from date, goal, and slot.
4. Use a leaner pool for lose and a heartier pool for maintain/gain so goal changes affect dishes as well as portions.
5. Preserve the stored plan, confirmations, and replacements across reloads.
6. Let **Refresh plan** replace the current dated plan intentionally.
7. Mark Sundays with `isCheatDay: true` and render a free-choice experience without fixed menu controls or displayed meal totals.
8. Keep a recent history (14 days by default, 60 maximum) grouped into this week and previous week.
9. Present the current plan as a responsive dashboard with goal, schedule, logging progress, nutrition targets, and expandable meal details.

### Meal logging

1. Let users confirm that they ate a suggested meal.
2. Let users replace a non-cheat-day slot with a free-text description of 1–300 characters.
3. Preserve the first suggestion's title, image, ingredients, and preparation steps across repeated replacements.
4. Mark replacements as changed and show “original → replacement” in the plan/history UI.
5. Keep the suggested slot calorie/protein budgets because no reliable nutrition calculation is performed for arbitrary text.
6. Perform confirmation and replacement without an AI request.

### Progress

1. Record validated weight check-ins with optional context notes against an owned profile and show them chronologically.
2. Compare the first and latest weights and calculate a weekly rate when at least two dated check-ins exist.
3. Decide whether the direction is on track for lose, maintain, or gain using fixed rules.
4. Include confirmed and changed meal counts from the latest plan.
5. Generate a deterministic written review from those statistics without AI.
6. Require two check-ins before presenting a directional verdict.
7. Plot stored measurements in a theme-aware trend chart and explain that individual readings can vary with timing and hydration.

### Assistant

1. Offer FitMeal AI in the Meal Planner and through a floating launcher on every route for signed-in users.
2. Accept a message of up to 1,000 characters and up to 20 prior chat entries.
3. Use Groq for short, general meal, recipe, calorie, and macro guidance.
4. Refuse diagnosis, treatment, or individualized medical guidance and direct those questions to a qualified professional.
5. Bound backend and browser wait times so the interface cannot remain indefinitely on “Thinking…”.
6. Return clearly labelled rule-based offline guidance when the key is absent, Groq fails, or quota is exhausted.
7. Keep every non-chat feature independent of Groq.

### Account and appearance

1. Show Clerk identity plus today's plan and last-seven-days check-in summaries on `/account`.
2. Offer Midnight Gold, Warm Light, Rose Pink, Ocean Blue, Forest Green, and Slate Gray themes.
3. Store the selected theme per Clerk account in `localStorage`, restore it when that account signs in, and return signed-out pages to Midnight Gold.
4. Use theme-backed Tailwind utilities for application colors, with the fixed-color phone mockup as the only documented design exception.
5. Keep shared navigation and footer usable when routed page content throws.
6. Let a signed-in user permanently delete their owned profile, generated plans, and check-ins after a second confirmation; clear the local theme preference but leave the separately managed Clerk identity active.

## Architecture

```text
React + Vite static frontend
        |
        | Clerk bearer token + JSON over /api
        v
Express API  ───────────────> Clerk session verification
    |   |
    |   └───────────────────> Groq API (assistant chat only)
    v
MongoDB (profiles, plans, check-ins)
```

During local development, Vite proxies `/api` to `http://localhost:4000`. A separately hosted frontend uses `VITE_API_URL`, including the `/api` suffix. Root-hosted builds use `/` as their application base; subpath hosts set `VITE_BASE_PATH`, which the GitHub Pages workflow derives from the repository name.

## Data model

### Profile

- Clerk owner ID
- Name
- Age
- Sex
- Height in centimeters
- Weight in kilograms
- Activity level
- Goal
- Created/updated timestamps

### Meal plan

- Profile reference
- User-local date string
- Daily calorie and macro targets
- Explicit `target-budget` nutrition basis
- Four meal slots
- Original/replacement metadata and confirmation state
- Weekly flex-day flag
- Created/updated timestamps

### Check-in

- Profile reference
- Weight in kilograms
- Optional note
- Date and timestamps

## API contract

| Method | Path | Success |
| --- | --- | --- |
| `GET` | `/api/health` | `200 { "ok": true, "database": "connected" }` when ready; otherwise `503` |
| `GET` | `/api/profiles/latest` | `200` profile or `null` |
| `POST` | `/api/profiles` | `201` created profile |
| `PATCH` | `/api/profiles/:profileId` | `200` updated profile |
| `DELETE` | `/api/profiles/:profileId` | `204`; deletes the owned profile and dependent plans/check-ins |
| `POST` | `/api/meal-plans/generate/:profileId` | `200` existing or `201` created/replaced plan |
| `GET` | `/api/meal-plans/latest/:profileId` | `200` plan or `null` |
| `GET` | `/api/meal-plans/:profileId/history?days=14` | `200` plan array |
| `POST` | `/api/meal-plans/:planId/meals/:time` | `200` updated plan |
| `PATCH` | `/api/meal-plans/:planId/meals/:time/confirm` | `200` updated plan |
| `GET` | `/api/progress/:profileId` | `200` check-in array |
| `POST` | `/api/progress` | `201` created check-in |
| `POST` | `/api/progress/:profileId/review` | `200` stats and summary |
| `POST` | `/api/assistant/chat` | `200` live or labelled fallback reply |

Protected endpoints return `401` for no session and `503` when backend Clerk configuration is absent. Validation failures are JSON errors, and ownership misses return `404`.

The API uses security headers, bounded JSON bodies, production CORS allowlisting, and separate general/assistant rate limits. Expected client errors receive specific 4xx responses; unexpected failures are logged without exposing their internal messages to the browser.

## Quality requirements

- Use TypeScript for application source and avoid `any`.
- Keep network access in the shared frontend API client.
- Validate request bodies on the backend.
- Wrap async Express route bodies in `try/catch` and forward failures with `next(error)`.
- Show understandable loading, empty, guest, and error states.
- Do not expose secret keys or database credentials in frontend bundles or git.
- `npm run build` must pass for both workspaces.
- `npm test` must pass without a real MongoDB database, Clerk account, or Groq request.
- Preserve responsive behavior and all six themes for frontend changes.
- Keep navigation, redirects, and local asset URLs relative to `import.meta.env.BASE_URL` so subpath deployments remain inside the application.

## Release acceptance checklist

- [x] Public home and recipe collection
- [x] Responsive navigation and shared footer
- [x] Clerk integration and resource ownership
- [x] Profile creation/editing and target calculation
- [x] Daily/goal-based plans and Sunday free-choice handling
- [x] Meal confirmation/replacement and two-week history
- [x] Weight check-ins and rule-based review
- [x] Account summary and six themes
- [x] Groq assistant with timeout and offline fallback
- [x] Frontend interaction/unit tests and backend unit/integration tests
- [x] Frontend and backend production build configuration
- [x] Render Blueprint and deployment guide
- [x] Public frontend deployment
- [ ] Production API deployment
- [ ] Production Clerk/MongoDB/Groq configuration
- [ ] Production end-to-end smoke test

## Known constraints

- Recipe-card interactions and direct detail routes are sign-in-gated in the UI. Static recipe data still ships in the public frontend bundle, so this is not a security boundary for sensitive information.
- Meal-level calorie and protein values are target budgets derived from the profile, not exact nutrition calculations for fixed ingredient quantities.
- Production requires an explicit CORS allowlist and fails startup when database, Clerk, or CORS configuration is missing.
- Groq availability and quota affect live assistant answers only; fallback guidance remains available.
- Render free web services have cold starts after inactivity, and the application depends on an externally managed MongoDB database.
- Completing the first deployment requires account-owner access to Render, MongoDB Atlas, Clerk, and optionally Groq.

## Out of scope

- Medical diagnosis or treatment advice
- Clinical nutrition accuracy guarantees
- Automatic nutrition estimation for arbitrary replacement meals
- Shopping lists, payments, notifications, or social sharing
- Admin dashboards or multi-role authorization
- Offline-first data synchronization
