# FitMeal build plan

## Purpose

FitMeal provides simple meal-planning and weight-check-in tools. It is an educational planning aid, not medical advice.

## Current scope

1. Show a public nutrition-focused home page.
2. Show recipes for weight loss, maintenance, and weight gain with estimated nutrition values.
3. Show ingredients and preparation steps for each recipe.
4. Read the latest saved profile from MongoDB.
5. Generate a meal plan based on that profile.
6. Record and display weight check-ins.

The profile form and AI assistant were intentionally removed from the public frontend.

## Architecture

```text
React + Vite browser app
        |
        | /api requests
        v
Express API on port 4000
        |
        v
MongoDB
```

During development, Vite proxies `/api` to the Express API. Production deployments must either serve both from one origin or configure `VITE_API_URL` with the public API URL.

## Functional requirements

- `GET /api/health` returns `{ "ok": true }`.
- Profiles, meal plans, and check-ins are validated by the backend.
- Planner and progress screens show a clear loading, empty, or error state.
- The frontend must not contain API keys or database credentials.
- Clerk provides optional sign-in, sign-up, and session middleware when its environment keys are configured.

## Non-functional requirements

- Use TypeScript throughout the application source.
- Keep UI text and error messages understandable for end users.
- Keep components focused and avoid premature abstractions.
- `npm run build` must build frontend and backend successfully.

## Follow-up decisions needed

The planner and progress screens still need a saved profile, but the public profile form was removed. Choose one before the next feature work:

1. Add a simple administrator-only profile creation flow.
2. Replace personalised features with non-profile-based content.
3. Remove the planner and progress features as well.
