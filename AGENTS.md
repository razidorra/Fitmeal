# FitMeal development guide

## Project overview

FitMeal is a full-stack meal-planning web application.

- Frontend: React 18, Vite 6, TypeScript, TanStack Router
- Backend: Node.js, Express, TypeScript, Mongoose
- Database: MongoDB
- Package manager: npm workspaces

## Commands

Run commands from the repository root unless stated otherwise.

```bash
npm install
npm run dev
npm run build
```

`npm run dev` starts the Vite frontend on port 5173 and the Express API on port 4000.

## Source layout

```text
frontend/src/features/  # Page and feature-specific React components
frontend/src/shared/    # API client, shared types, reusable UI
frontend/src/routes/    # TanStack Router configuration
backend/src/features/   # API feature routes, models, and services
backend/src/config/     # Environment configuration
backend/src/shared/     # Database connection and shared server utilities
```

## TypeScript and React rules

- Write TypeScript; do not add plain JavaScript source files.
- Use named exports for components and functions.
- Keep one React component per file when it has meaningful logic.
- Give state and event handlers descriptive names, such as `isLoading` and `handleSubmit`.
- Keep network calls in `frontend/src/shared/api.ts`, not inside JSX.
- Handle loading, empty, and error states for asynchronous screens.
- Avoid `any`; narrow `unknown` errors before showing a message.

## Design principles

- KISS: prefer short, direct code over clever abstractions.
- SOLID: keep components focused on rendering and interaction; keep API access in the API client; keep backend routes thin and move reusable calculations into services.
- YAGNI: do not add state management, UI libraries, authentication, tests, or abstractions unless a current requirement needs them.
- Make code easy for a junior developer to read: use line breaks, small functions, and explicit names.

## API and environment rules

- Frontend requests use `/api` during development. Vite proxies them to `http://localhost:4000`.
- Store local secrets only in `backend/.env`; never commit it.
- Update `backend/.env.example` when a required non-secret environment variable changes.
- Return JSON error responses from the API.

## Before handoff

Run `npm run build`. Do not leave generated or obsolete files in `backend/dist`; the backend build cleans this folder automatically.
