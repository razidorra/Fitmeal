# Deployment

FitMeal deploys as two services on [Render](https://render.com)'s free tier: a Node web
service for the API, and a static site for the built frontend. `render.yaml` at the repo root
describes both as a single Blueprint, so Render can set them up together in one step.

This is a from-scratch walkthrough — you'll need your own free Render account (sign in with
GitHub) and the secret values below. Nothing in this repo can create that account or paste in
secrets for you; that part is inherently something only you can do.

## 1. Push this repo to GitHub

Render deploys from a GitHub repo it can read. If this repo isn't already on GitHub, push it
there first.

## 2. Create the Blueprint on Render

1. Go to the [Render dashboard](https://dashboard.render.com) → **New +** → **Blueprint**.
2. Select this GitHub repo. Render reads `render.yaml` and shows two services it's about to
   create: `fitmeal-api` (web service) and `fitmeal-web` (static site).
3. Before the first deploy, Render will prompt for every env var marked `sync: false` in
   `render.yaml` — the api's secrets it can't guess:
   - `MONGODB_URI` — your MongoDB Atlas connection string (see main [README](../README.md#configuration))
   - `CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` — from your Clerk dashboard
   - `GEMINI_API_KEY` — from [aistudio.google.com/apikey](https://aistudio.google.com/apikey) (optional — the assistant chat degrades gracefully without it)
   - `VITE_CLERK_PUBLISHABLE_KEY` — same Clerk publishable key, for the frontend build
   - `VITE_API_URL` — leave this blank for now (see step 4)
4. Click **Apply**. Both services deploy. `fitmeal-api` builds and starts the Express server;
   `fitmeal-web` builds the Vite production bundle and serves it as static files.

## 3. Point the frontend at the API

The API's public URL only exists once `fitmeal-api` has deployed at least once, so it can't be
filled in ahead of time:

1. Open the `fitmeal-api` service page on Render and copy its URL (something like
   `https://fitmeal-api.onrender.com`).
2. Open the `fitmeal-web` service → **Environment** → set `VITE_API_URL` to that URL plus `/api`,
   e.g. `https://fitmeal-api.onrender.com/api`.
3. Trigger a manual redeploy of `fitmeal-web` (env var changes to a static site need a rebuild,
   since Vite bakes `VITE_*` values into the bundle at build time, not at runtime).

## 4. Verify

- `https://fitmeal-api.onrender.com/api/health` should return `{"ok":true}`.
- Open the `fitmeal-web` URL, sign in, create a profile, and generate a meal plan.

## Notes

- **Free-tier cold starts**: Render's free web services sleep after 15 minutes of no traffic and
  take ~30–60 seconds to wake on the next request. The first request after a lull will be slow;
  this is a Render free-tier characteristic, not an app bug.
- **CORS**: the API allows all origins (`app.use(cors())`) so the frontend can call it from
  Render's static-site domain without extra config. If you later want to restrict that to only
  your deployed frontend's origin, that's a one-line change in `backend/src/app.ts`.
- **Database**: this deploys the app, not a database — you still need a MongoDB Atlas cluster
  (the free M0 tier is enough) and its connection string in `MONGODB_URI`, same as running
  locally.
- **Alternative hosts**: any Node host works for the API (Railway, Fly.io, a VPS) and any static
  host works for the frontend (Vercel, Netlify, GitHub Pages with a custom domain) — `render.yaml`
  is just the ready-made path. The only two things another host needs to replicate are: build
  command `npm run build -w backend` / start command `npm run start` for the API, and build
  command `npm run build -w frontend` with publish directory `frontend/dist` plus a SPA rewrite
  (`/* → /index.html`) for the frontend.
