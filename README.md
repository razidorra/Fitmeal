# FitMeal

FitMeal is a full-stack meal-planning application built with TypeScript. It combines a public recipe collection with account-scoped profiles, daily meal plans, weight check-ins, rule-based progress reviews, and an optional Groq-powered nutrition assistant.

> Current stage: the final project feature set is implemented and covered by the backend test suite. Local development and Render deployment are configured; creating the external accounts, supplying secrets, and completing the first production deployment remain manual steps.

FitMeal is an educational planning aid. Nutrition values are estimates and the application does not provide medical or dietetic advice.

## Features

- Public home page and a responsive 25-recipe collection with search, goal/category filters, sorting, a featured recipe, nutrition details, and an optional sign-in prompt before opening the detail modal.
- Clerk authentication with a custom account summary, polished account navigation, visible sign-out control, and per-user data ownership.
- Editable nutrition profile with calorie and macro targets calculated from the Mifflin-St Jeor formula.
- One persisted meal plan per local calendar day, deterministic menu variety, goal-specific choices, manual refresh, and a Sunday free-choice day.
- Per-meal confirmation or free-text replacement while preserving the original suggestion and recipe details.
- Two-week plan history grouped into this week and the previous week.
- A progress dashboard with optional check-in context, a theme-aware weight chart, history, and a deterministic review based on weight direction and the latest meal log.
- Groq-powered assistant chat in the Meal Planner and in a floating site-wide panel for signed-in users.
- Clearly labelled offline assistant guidance when Groq is unavailable or not configured.
- Six account-specific visual themes stored on the current device; signed-out pages return to Midnight Gold automatically.
- Page-level error boundaries plus loading, empty, guest, and error states for asynchronous screens.

## Technology

| Area | Stack |
| --- | --- |
| Frontend | React 18, Vite 6, TypeScript, TanStack Router, Tailwind CSS 4 |
| Backend | Node.js, Express 4, TypeScript, Zod |
| Data | MongoDB, Mongoose |
| Authentication | Clerk (`@clerk/react`, `@clerk/express`) |
| Assistant | Groq chat completions API |
| Tests | Vitest, Supertest, `mongodb-memory-server` |
| Workspace | npm workspaces |

## Project structure

```text
frontend/src/features/       page and feature components
frontend/src/routes/         TanStack Router layout and routes
frontend/src/shared/         API client, shared types, themes, reusable UI
frontend/public/images/      static site and recipe images
backend/src/features/        profile, meal-plan, progress, and assistant features
backend/src/shared/          auth, ownership, database, and Groq helpers
backend/src/test/            shared test database lifecycle
docs/                        specification, audit history, and deployment guide
render.yaml                  Render Blueprint for the API and frontend
```

## Run locally

### Prerequisites

- A current Node.js LTS release with npm.
- A MongoDB database. MongoDB Atlas is suitable; tests do not use this database.
- A Clerk application for account-backed planner, progress, recipe-detail, account, and assistant features.
- Optionally, a Groq API key for live assistant responses.

### Setup

1. Install both workspaces from the repository root:

   ```bash
   npm install
   ```

2. Create local environment files from the tracked examples:

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. Add your MongoDB and matching Clerk keys. Add a Groq key if live AI replies are wanted.
4. Start both applications:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:5173`. The API runs at `http://localhost:4000`, and Vite proxies local `/api` requests to it.

The canonical backend environment file is `backend/.env`. `backend/src/.env` is read only as a temporary compatibility fallback and should be moved to `backend/.env` for new setups.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | API port; defaults to `4000` |
| `MONGODB_URI` | Yes for data features | MongoDB connection string |
| `CLERK_PUBLISHABLE_KEY` | Yes for protected features | Backend Clerk configuration |
| `CLERK_SECRET_KEY` | Yes for protected features | Verifies Clerk sessions |
| `GROQ_API_KEY` | No | Enables live FitMeal AI answers |
| `GROQ_MODEL` | No | Groq model; defaults to `openai/gpt-oss-20b` |

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes for account and recipe-detail features | Enables Clerk UI, recipe-detail gating, and authenticated requests |
| `VITE_API_PROXY_TARGET` | No | Local Vite proxy target; defaults to `http://localhost:4000` |
| `VITE_API_URL` | Production only | Public API base URL including `/api` |

Use the same Clerk application on the frontend and backend. If Clerk is not configured, the home page and recipe collection remain visible, but recipe details, planner, progress, account, and assistant features show configuration guidance. If only one side is configured, authenticated data requests cannot work correctly.

Never commit `.env` files, database credentials, Clerk secrets, or API keys.

Recipe cards and direct `/recipes/:recipeSlug` links both require a signed-in Clerk session before rendering full details. Because the static recipe data ships in the frontend bundle, this is a product-access gate rather than protection for sensitive information.

## How meal planning works

The planner accepts age, sex, height, weight, activity level, and goal. The backend calculates a daily target, then assigns one Breakfast, Lunch, Snack, and Dinner. Menu selection is deterministic from the profile goal, local date, and meal slot, so reloads preserve a day while different days rotate through the available pool.

The first planner visit on a date creates that day's plan. Later visits return the saved plan, preserving confirmations and replacements. **Refresh plan** intentionally replaces the current day's saved plan. Every Sunday is represented as a free-choice day without fixed meals, calorie displays, or confirmation controls.

Meal confirmation, meal replacement, and progress review are rule-based and never call Groq. A replacement records the user's description but retains the original suggested meal's title, image, ingredients, and preparation steps. Because FitMeal does not estimate free-text nutrition, the slot keeps its original calorie/protein budget for display.

## AI assistant

The assistant chat is the only feature that calls an AI service. Signed-in users can use it from the Meal Planner or the floating launcher on any route. Configure it with:

```env
GROQ_API_KEY=your_key_here
GROQ_MODEL=openai/gpt-oss-20b
```

If Groq is missing, unavailable, or over quota, the API returns clearly labelled basic offline guidance for supported nutrition questions. The rest of FitMeal remains independent of Groq.

## Commands

Run these from the repository root:

```bash
npm run dev      # run frontend and backend in watch mode
npm run build    # type-check/build the frontend, then build the backend
npm test         # run the backend test suite once
```

Workspace-specific alternatives:

```bash
npm run build -w frontend
npm run build -w backend
npm run test -w backend
npm run test:watch -w backend
```

There is currently no frontend test runner. The authoritative frontend check is `npm run build`, which runs `tsc -b` before the Vite production build. Backend tests cover target calculations, meal-plan selection and cheat days, assistant fallback guidance, persisted plan/review behavior, authentication, and cross-user ownership using an ephemeral in-memory MongoDB.

## API routes

All routes except health require a valid Clerk session. Resource routes also verify ownership; requests for another user's profile or related records return `404`.

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | API health check |
| `GET` | `/api/profiles/latest` | Read the signed-in user's latest profile |
| `POST` | `/api/profiles` | Create a profile |
| `PATCH` | `/api/profiles/:profileId` | Update an owned profile |
| `POST` | `/api/meal-plans/generate/:profileId` | Get/create a dated plan, or regenerate it |
| `GET` | `/api/meal-plans/latest/:profileId` | Read the most recently created plan |
| `GET` | `/api/meal-plans/:profileId/history` | Read recent dated plans; `days` defaults to 14 and is capped at 60 |
| `POST` | `/api/meal-plans/:planId/meals/:time` | Save a free-text meal replacement |
| `PATCH` | `/api/meal-plans/:planId/meals/:time/confirm` | Confirm the suggested meal |
| `GET` | `/api/progress/:profileId` | Read weight check-ins |
| `POST` | `/api/progress` | Add a weight check-in |
| `POST` | `/api/progress/:profileId/review` | Build a rule-based progress review |
| `POST` | `/api/assistant/chat` | Ask the Groq-backed assistant, with local fallback |

## Deployment and remaining handoff work

The repository includes a Render Blueprint for a free Node web service and static frontend, plus a GitHub Actions workflow (`.github/workflows/deploy-pages.yml`) that can publish the frontend to GitHub Pages instead. Either way the API (and MongoDB) still needs to run on a Node host — GitHub Pages only serves static files. Follow [the deployment guide](docs/DEPLOYMENT.md) to create the services, configure MongoDB/Clerk/Groq, connect the frontend URL to the API, and complete the production smoke test.

Before calling a release complete:

1. Run `npm run build` and `npm test`.
2. Deploy the Blueprint and configure all required service variables.
3. Add the deployed frontend origin/redirect URLs in Clerk and allow the API to reach MongoDB Atlas.
4. Verify health, sign-up/sign-in/sign-out, profile creation/editing, daily plan generation, meal logging, history, check-ins, progress review, themes, mobile navigation, direct recipe URLs, and both live/fallback assistant behavior.
5. Replace permissive production CORS with the deployed frontend origin if the application is moving beyond a demonstration deployment.

## Documentation

- [Product specification and release status](docs/SPEC.md)
- [Deployment guide](docs/DEPLOYMENT.md)
- [Dated implementation audit](docs/AUDIT.md)
- [Contributor/development guide](AGENTS.md)
- [Recipe image notes](frontend/public/images/recipes/README.md)
