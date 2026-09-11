# Isharati website

This folder is the tutor website. It is not scaffolded yet on purpose — the machine is tight on disk, and the API contract is ready first.

## Intended stack

Next.js (App Router) + TypeScript + Tailwind, Arabic RTL.

When you are ready to generate the app **inside this folder**:

```bash
cd frontend
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir
```

Keep `src/lib/api.ts`. That file is the typed client for the FastAPI backend.

## Talk to the backend

Dev API: `http://127.0.0.1:8000`

Set `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000` after you scaffold Next.js.

The backend already allows CORS from `http://localhost:3000`.

## Feature folders

| Folder | Tutor job | Backend routes |
|---|---|---|
| `src/features/learn` | Show a sign, teach a word | `/text-to-sign`, `/video/{id}` |
| `src/features/practice` | Student signs, get feedback | `/sign-to-text` |
| `src/features/translate` | Free-form both directions | all routes |

Build those as UI. Do not reimplement the model here.
