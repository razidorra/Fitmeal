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

## Clerk authentication

Clerk is installed for both applications. Create a Clerk application, then copy its keys into the local environment files:

```env
# frontend/.env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# backend/.env
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Restart `npm run dev` after changing environment variables. When both Clerk keys are configured, the frontend shows Clerk login, sign-up, and user-menu components, and the backend enables Clerk middleware. Routes are not protected yet; protect individual routes only when their access rules are defined.

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API health check |
| GET / POST | `/api/profiles` | Read or create profiles |
| GET / POST | `/api/meal-plans` | Read or generate meal plans |
| GET / POST | `/api/progress` | Read or add weight check-ins |

## Documentation

- [Build plan](docs/SPEC.md)
- [Change protocol](docs/AUDIT.md)
- [Development guide](AGENTS.md)
