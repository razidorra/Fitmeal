# FitMeal

FitMeal is a TypeScript full-stack meal-planning application. It provides a nutrition-focused home page, personalised meal plans, and weight check-ins.

## Technology

- Frontend: React, Vite, TypeScript, TanStack Router, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database: MongoDB with Mongoose
- Tooling: npm workspaces

## Run locally

1. Copy `backend/.env.example` to `backend/.env`.
2. Set `MONGODB_URI` in `backend/.env`.
3. Run `npm install` from the repository root.
4. Run `npm run dev`.
5. Open `http://localhost:5173`.

The frontend runs on port 5173 and the API runs on port 4000. Vite forwards browser requests from `/api` to the API automatically.

## Commands

```bash
npm run dev     # Start frontend and backend
npm run build   # Build frontend and backend
```

To build only one workspace:

```bash
npm run build -w frontend
npm run build -w backend
```

## Tests

```bash
npm run test -w backend
```

Runs the backend suite (Vitest + Supertest + an in-memory MongoDB via `mongodb-memory-server` —
no real database or Clerk account needed): pure unit tests for the calorie/macro formula, the
meal-plan variety/goal-selection logic, and cheat-day detection, plus route-level tests for
`/api/profiles` covering the per-user ownership scoping (`findOwnedProfile`) — that one signed-in
user can never read or edit another user's profile.

The frontend has an `ErrorBoundary` (`frontend/src/shared/components/ErrorBoundary.tsx`) around
each routed page, so a crash in one page shows a "Something went wrong — try again" fallback
instead of a blank screen, while the header/nav/footer stay usable.

## Meal planning

Each day's plan is generated per profile (get-or-create by the user's own local date) with one
meal per Breakfast/Lunch/Snack/Dinner slot. The dish for each slot is chosen from a small pool,
deterministically, from the date, the profile's goal, and the slot itself — so the same day always
shows the same plan on reload (only the "Refresh plan" button forces a new pick for that day),
while different days spread out across the pool instead of repeating the same four dishes. A
"lose" goal and a "maintain"/"gain" goal draw from separate pools, so the plan itself looks
different for those two directions, not only differently portioned.

Every Sunday is a cheat day: the plan carries a free-choice placeholder for all four slots instead
of a fixed menu, shown as its own banner with no calorie targets or confirm/swap controls.

Swapping a meal for something else, or confirming it was eaten as suggested, is always plain and
rule-based — see [AI assistant (Gemini)](#ai-assistant-gemini) below for the one feature that
actually calls an AI.

## Account status

When signed in, the header shows the account's avatar, name (or email), a green "online"
indicator, and a directly-clickable **Log out** button — sign-out doesn't require opening a menu
first.

## Configuration

```env
# backend/.env
PORT=4000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
```

For a separately hosted frontend, configure `VITE_API_URL` with the public API base URL, including `/api`:

```env
VITE_API_URL=https://api.example.com/api
```

Never commit `.env` files or API keys.

## AI assistant (Gemini)

The AI assistant chat is the only feature that uses Google Gemini — meal swaps and progress reviews are plain, rule-based, and never call any AI. Get a free API key (no credit card needed) at [aistudio.google.com/apikey](https://aistudio.google.com/apikey):

```env
# backend/.env
GEMINI_API_KEY=your-key-here
GEMINI_MODEL=gemini-flash-latest
```

Without a key, the assistant returns a clear "not set up yet" message instead of an error; the rest of the app works normally. Gemini's free tier has a daily quota — once it's used up, the assistant returns a friendly "usage limit" message until it resets; nothing else in the app is affected.

## Appearance

The whole site supports six themes — "Midnight Gold" (dark, default), "Warm Light", "Rose Pink", "Ocean Blue", "Forest Green", and "Slate Gray" — toggled from the Account page (`/account`, signed-in only) and saved per device in `localStorage`.

Styling is Tailwind CSS (v4) utility classes throughout. The six themes stay CSS custom properties (`--bg-page`, `--text-primary`, `--accent`, etc.) in `frontend/src/styles.css`, swapped via a `data-theme` attribute on `<html>` — Tailwind's color utilities (`bg-page`, `text-ink`, `text-accent`, ...) are mapped onto those same variables via `@theme inline`, so every utility class already follows theme changes with no extra work. A small `@layer base` block covers genuinely global element defaults (`button`, `h1`–`h3`, `input`/`select`); everything else is per-component utility classes in JSX.

Every page also carries a subtle background photo (`frontend/public/images/backG.jpg`) behind all content, tinted with each theme's own page color so it reads as ambient texture rather than competing with text — every card/panel keeps its own solid background, so the photo only shows through in the gaps between them.

## Clerk authentication

Clerk is installed for both applications. Create a Clerk application, then copy its keys into the local environment files:

```env
# frontend/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# backend/.env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Restart `npm run dev` after changing environment variables. When both Clerk keys are configured, the frontend shows Clerk login, sign-up, and user-menu components, and the backend enables Clerk middleware. Every profile/meal-plan/progress/assistant route requires a signed-in session and checks that the requested record actually belongs to that user.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| GET | `/api/profiles/latest` | Read the signed-in user's saved profile |
| POST | `/api/profiles` | Create a profile |
| PATCH | `/api/profiles/:profileId` | Edit a saved profile |
| POST | `/api/meal-plans/generate/:profileId` | Get-or-create today's plan (pass `regenerate: true` to force a new one) |
| GET | `/api/meal-plans/latest/:profileId` | Read the most recent meal plan for a profile |
| GET | `/api/meal-plans/:profileId/history` | Read recent days' plans for the week view |
| POST | `/api/meal-plans/:planId/meals/:time` | Replace a meal slot with a freely-typed meal (rule-based, no AI) |
| PATCH | `/api/meal-plans/:planId/meals/:time/confirm` | Confirm a meal slot was eaten as suggested |
| GET | `/api/progress/:profileId` | Read weight check-in history |
| POST | `/api/progress` | Add a weight check-in |
| POST | `/api/progress/:profileId/review` | Compute a progress verdict with a rule-based written summary (no AI) |
| POST | `/api/assistant/chat` | Ask the FitMeal AI assistant a question (uses Gemini) |

## Documentation

- [Build plan](docs/SPEC.md)
- [Change protocol](docs/AUDIT.md)
- [Development guide](AGENTS.md)
- [Deployment guide](docs/DEPLOYMENT.md)
