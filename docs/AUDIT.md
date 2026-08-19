# FitMeal change protocol

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
