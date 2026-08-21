# FitMeal

FitMeal is a TypeScript full-stack meal-planning application. It provides a nutrition-focused home page, personalised meal plans, and weight check-ins.

## Technology

- Frontend: React, Vite, TypeScript, TanStack Router
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

The whole site supports a "Midnight Gold" (dark, default) and "Warm Light" theme, toggled from the Account page (`/account`, signed-in only) and saved per device in `localStorage`. Colors are defined as CSS custom properties in `frontend/src/styles.css`.

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
