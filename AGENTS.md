# FitMeal development guide

## Project overview

FitMeal is a full-stack meal-planning web application.

- Frontend: React 18, Vite 6, TypeScript, TanStack Router, Tailwind CSS 4
- Backend: Node.js, Express, TypeScript, Mongoose
- Auth: Clerk (`@clerk/react` frontend, `@clerk/express` backend) — public content works without keys, but protected screens show setup guidance and protected APIs return 503
- AI: Groq, used only by the assistant chat — meal swaps and progress reviews are plain, rule-based, and never call it
- Database: MongoDB
- Tests: Vitest + Testing Library (frontend); Vitest + Supertest + `mongodb-memory-server` (backend); Playwright (browser flows)
- Package manager: npm workspaces

## Commands

Run commands from the repository root unless stated otherwise.

```bash
npm install
npm run dev     # frontend on :5173, API on :4000
npm run build   # builds both workspaces
npm test        # frontend and backend test suites
npm run test:e2e # Playwright public flow; hosted auth flow needs documented credentials
```

## Source layout

```text
frontend/src/features/         # Page and feature-specific React components
frontend/src/shared/           # API client, shared types, theme, reusable UI (ErrorBoundary, SiteFooter, Reveal)
frontend/src/routes/           # TanStack Router configuration + page layout (header/nav/footer)
frontend/src/styles.css        # Tailwind import, font/color theme tokens, theme/preview selectors, @layer base
frontend/public/images/        # Static assets served as-is (recipe photos, homepage hero/background photo)
backend/src/features/          # API feature routes, models, and services, one folder per resource
backend/src/config/            # Environment configuration
backend/src/shared/            # Database connection, auth/ownership helpers, Groq client
backend/src/test/              # Shared test helpers (in-memory MongoDB lifecycle)
docs/                          # SPEC.md (requirements), AUDIT.md (dated change log), DEPLOYMENT.md
```

## TypeScript and React rules

- Write TypeScript; do not add plain JavaScript source files.
- Use named exports for components and functions.
- Keep one React component per file when it has meaningful logic.
- Give state and event handlers descriptive names, such as `isLoading` and `handleSubmit`.
- Keep network calls in `frontend/src/shared/api.ts`, not inside JSX.
- Handle loading, empty, and error states for asynchronous screens.
- Avoid `any`; narrow `unknown` errors before showing a message.
- No ESLint/Prettier config exists in this repo — match the surrounding file's style by eye instead of relying on a linter to catch it.

## Styling rules

- Styling is Tailwind CSS utility classes in JSX, not separate `.css` files per component — there is no per-feature stylesheet left in the frontend beyond `styles.css` itself.
- Colors must come from the theme utilities (`bg-page`, `text-ink`, `text-ink-soft`, `text-accent`, `border-line`, `bg-surface`, `bg-surface-alt`, ...), never hardcoded hex, so all six themes stay correct automatically. These map onto the CSS custom properties in `styles.css` via `@theme inline`, which in turn come from the six `[data-theme]` blocks — add a new color token in both places if you need one. The homepage phone mockup is the one narrow, deliberate exception: it uses literal device-screen colors because it is meant to look the same in every theme.
- Prefer Tailwind's fractional spacing scale (e.g. `gap-7.5` for 30px, `p-4.25` for 17px) over arbitrary `[…]` brackets whenever a pixel value divides cleanly by 4 — the IDE flags the arbitrary form with a canonical-class suggestion when one exists; apply it. Use arbitrary values for anything else (odd pixel values, `clamp()`, multi-value `grid-template-columns`, etc.).
- Never combine a margin/padding shorthand utility with a more specific same-side override on the same element (e.g. `my-6 mb-8` or `p-5 px-4`) — Tailwind's generated utilities don't reliably cascade by class order, so the two can silently fight over which one wins. Use fully explicit single-side utilities instead (`mt-6 mb-8`, `py-5 px-4`).
- Element-level defaults that apply everywhere with no per-page override (`button`, `h1`–`h3`, `input`/`select`) live once in `styles.css`'s `@layer base`, via `@apply`. Everything page- or component-specific is inline Tailwind classes in the component itself, not a shared class extracted "just in case."

## Design principles

- KISS: prefer short, direct code over clever abstractions.
- SOLID: keep components focused on rendering and interaction; keep API access in the API client; keep backend routes thin and move reusable calculations into services.
- YAGNI: don't add state management or abstractions the current requirement doesn't need. Auth (Clerk), tests (Vitest/Supertest), and Tailwind are already part of the stack — this no longer means avoiding those, just not adding more beyond what's asked.
- Make code easy for a junior developer to read: use line breaks, small functions, and explicit names.

## API and environment rules

- Frontend requests use `/api` during development. Vite proxies them to `http://localhost:4000`.
- Root deployments need no frontend path setting. Subpath deployments set `VITE_BASE_PATH`; the GitHub Pages workflow derives it from the repository name.
- Store local secrets only in `backend/.env`; never commit it.
- Update `backend/.env.example` when a required non-secret environment variable changes.
- Return JSON error responses from the API.
- Every route that reads or writes a profile, meal plan, or check-in requires a signed-in Clerk session and calls `findOwnedProfile`/an equivalent ownership check — a request for someone else's record returns 404, not their data.
- Keep the existing explicit `try/catch` and `next(error)` pattern in async routes so error flow remains obvious and consistent with the shared JSON error middleware.

## Tests

- `npm run test -w backend` runs pure calculation/fallback tests plus Supertest route tests against the exported `app`, using `mongodb-memory-server` and mocked Clerk sessions.
- `npm run test -w frontend` runs Vitest/Testing Library checks for shared behavior and user-facing components. Frontend changes also require the full `npm run build` (`tsc -b` plus Vite) and proportional manual/headless-browser checks.
- `npm run test:e2e` runs the public Playwright suite against a locally built preview. The authenticated project requires the deployment and Clerk variables documented in `README.md` so it can verify the real hosted stack.

## Before handoff

Run `npm run build` (builds both workspaces; `tsc -b` for the frontend is the stricter, authoritative check — don't rely on an ad-hoc `tsc --noEmit` alone), `npm test`, and proportional browser checks such as `npm run test:e2e -- --project=public-chromium`. Do not leave generated or obsolete files in `backend/dist`; the backend build cleans this folder automatically.
