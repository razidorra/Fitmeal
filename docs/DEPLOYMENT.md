# FitMeal deployment

## Deployment status

The repository is configured for deployment, but a live production deployment cannot be completed from source alone. The account owner must connect the repository and provide MongoDB, Clerk, and optional Groq credentials.

`render.yaml` defines two Render services:

| Service | Type | Build | Output/start |
| --- | --- | --- | --- |
| `fitmeal-api` | Free Node web service | `npm install && npm run build -w backend` | `npm run start` |
| `fitmeal-web` | Free static site | `npm install && npm run build -w frontend` | `frontend/dist` |

The static service includes a `/* → /index.html` rewrite so TanStack Router deep links load the application rather than returning a host-level 404.

## Before deploying

1. Run the release checks from the repository root:

   ```bash
   npm install
   npm run build
   npm test
   ```

2. Push the intended release commit to a GitHub repository Render can access.
3. Create or collect:

   - A MongoDB Atlas connection string and database user.
   - A Clerk application with publishable and secret keys.
   - Optionally, a Groq API key for live assistant answers.

Do not commit any of these values.

## 1. Create the Render Blueprint

1. Sign in to the [Render dashboard](https://dashboard.render.com).
2. Choose **New + → Blueprint** and select this repository.
3. Confirm that Render detects `render.yaml` and proposes `fitmeal-api` plus `fitmeal-web`.
4. Supply the variables marked `sync: false` during initial creation.

Render prompts for `sync: false` values only when a Blueprint first creates its services. If one is added later, set it manually in the relevant service's **Environment** page.

## 2. Configure the API

Set these on `fitmeal-api`:

| Variable | Required | Value |
| --- | --- | --- |
| `MONGODB_URI` | Yes | Atlas connection string including the database name |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key used by the frontend |
| `CLERK_SECRET_KEY` | Yes | Matching Clerk secret key |
| `GROQ_API_KEY` | No | Groq key for live assistant responses |

`PORT=4000` and `GROQ_MODEL=openai/gpt-oss-20b` are already declared by the Blueprint.

In MongoDB Atlas:

1. Ensure the database user has access to the selected database.
2. Add network access that permits the Render API service to connect.
3. Keep the Atlas credentials only in `MONGODB_URI`.

The API can start without `MONGODB_URI`, but profile, meal-plan, and progress requests will fail. It can also start without Clerk keys, but all protected endpoints will return `503`.

## 3. Complete the first API deployment

Apply the Blueprint and wait for `fitmeal-api` to finish. Then:

1. Copy the assigned HTTPS URL, for example `https://fitmeal-api.onrender.com`.
2. Open `https://fitmeal-api.onrender.com/api/health`.
3. Confirm it returns:

   ```json
   { "ok": true }
   ```

If the build succeeds but the service does not become healthy, check the Render logs for MongoDB connection errors, missing dependencies, or an incorrect start command.

## 4. Point the frontend to the API

The public API hostname is not known until the API service exists. Set these variables on `fitmeal-web`:

| Variable | Required | Example |
| --- | --- | --- |
| `VITE_API_URL` | Yes | `https://fitmeal-api.onrender.com/api` |
| `VITE_CLERK_PUBLISHABLE_KEY` | Yes | `pk_live_...` or the matching deployment key |

`VITE_API_URL` must include `https://` and the final `/api`. Do not put the Clerk secret key or Groq key on the static frontend.

Redeploy `fitmeal-web` after changing either `VITE_*` value. Vite embeds those values at build time, so a static site environment change is not visible until a new frontend build completes.

## 5. Configure Clerk for the hosted URLs

In the Clerk dashboard, add the deployed frontend origin and the required sign-in/sign-up redirect URLs for the application instance. Use the same Clerk application/instance represented by the keys on both Render services.

At minimum, verify:

- The frontend can open Clerk sign-in and sign-up.
- A completed authentication flow returns to the deployed frontend, not localhost.
- The frontend receives a session token accepted by `fitmeal-api`.
- Direct Log out returns to the deployed home page.

The exact Clerk dashboard labels can change; use Clerk's current deployment/domain instructions for the selected instance.

## 6. Production smoke test

Run this checklist on the deployed frontend:

- [ ] Home, Recipes, Meal Planner, Progress, and Account load on desktop and mobile widths.
- [ ] Refreshing a deep URL such as `/recipes/protein-oatmeal` loads the app.
- [ ] Sign-up, sign-in, and direct sign-out complete successfully.
- [ ] A profile can be created and edited.
- [ ] Today's plan is generated and survives a reload.
- [ ] Refresh plan intentionally replaces today's plan.
- [ ] Suggested meals can be confirmed or replaced.
- [ ] Plan history expands and displays saved changes.
- [ ] A weight check-in can be saved and reviewed.
- [ ] All six themes apply and persist after reload.
- [ ] The floating and in-planner assistant both respond with a valid Groq key.
- [ ] Removing/invalidating the Groq key produces labelled fallback guidance without breaking other features.
- [ ] Another signed-in account cannot read the first account's data.
- [ ] Browser developer tools show no failed API/CORS/auth requests during the flow.

## Alternative: GitHub Pages for the frontend

GitHub Pages only serves static files — it cannot run the Express API or connect to MongoDB. Use it for the frontend and keep the API on Render (steps 1–3 above) or another Node host.

`.github/workflows/deploy-pages.yml` builds `frontend/dist` and publishes it to Pages on every push to `main`. The frontend is already prepared for this: `vite.config.ts` sets `base: '/Fitmeal/'` when the workflow's `GITHUB_PAGES` flag is set, the router picks up that same base via `basepath: import.meta.env.BASE_URL`, and the build script copies `index.html` to `404.html` so a hard refresh on a deep link (e.g. `/Fitmeal/recipes/protein-oatmeal`) still loads the app instead of a host 404.

To turn it on:

1. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions** (one-time; this repo isn't currently serving a Pages site).
2. Deploy the API first (steps 1–3 above) and note its `https://.../api` URL.
3. Open **Settings → Secrets and variables → Actions → Variables** and add:

   | Variable | Value |
   | --- | --- |
   | `VITE_API_URL` | `https://fitmeal-api.onrender.com/api` (your deployed API) |
   | `VITE_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |

   These are read at build time by the workflow, the same way `VITE_*` values are read on Render — see step 4 above for why the value must include `/api` and why a change needs a new build to take effect.
4. Push to `main` (or run the workflow manually from the **Actions** tab) and wait for the `Deploy frontend to GitHub Pages` run to finish. The site is then live at `https://razidorra.github.io/Fitmeal/`.
5. Add `https://razidorra.github.io` as an allowed origin in Clerk (see step 5 above) — without it, sign-in will fail on the Pages URL even though it works on Render.

Until `VITE_API_URL` is set, the build still deploys — the public Home and Recipes pages work, but sign-in, the planner, progress, and the assistant will fail since they have nothing to call.

## Operations and hardening

### Free-service behavior

Render free web services spin down after 15 minutes without inbound traffic and may take about a minute to wake. The first API request after inactivity can therefore be slow. Static sites do not have the same server cold start.

### CORS

The API currently uses `cors()`, which permits all origins. This supports local development and Render's separately hosted frontend. For a hardened release, configure an allowed origin environment variable and restrict production requests to the deployed frontend domain.

### Data persistence

Application data is stored in MongoDB, not on Render's local filesystem. Render service filesystems are ephemeral, so do not add upload or database features that rely on local files without external storage.

### Secrets and logs

- Keep `CLERK_SECRET_KEY`, `MONGODB_URI`, and `GROQ_API_KEY` in the API service only.
- Treat `VITE_*` values as public because they are compiled into browser assets.
- Rotate a credential immediately if it appears in git, build output, screenshots, or logs.
- Do not log request authorization headers or full connection strings.

### Monitoring

The configured `/api/health` endpoint confirms that Express is running. It does not currently test MongoDB, Clerk, or Groq connectivity. Use the production smoke test and Render/Atlas dashboards when diagnosing those dependencies.

## Alternative hosts

Any Node host can run the API with:

```text
Build: npm install && npm run build -w backend
Start: npm run start
```

Any static host can run the frontend with:

```text
Build: npm install && npm run build -w frontend
Publish: frontend/dist
Rewrite: /* -> /index.html
```

Replicate the environment variables, HTTPS API URL, SPA rewrite, Clerk domain configuration, and MongoDB network access described above.
