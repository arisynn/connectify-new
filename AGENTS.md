# Base44 Setup Notes — Connectify

## What this app is
A Vite + React + TypeScript block-puzzle game ("Connectify") with an Express API server. Single-origin: Express serves both the Vite dev frontend (middleware mode) and `/api/*` endpoints on one port.

## How it runs
- `npm run dev` → `tsx server.ts` → Express + Vite middleware on port 3000.
- `npm run build` produces a production bundle (`dist/`); `npm start` runs it. We use dev mode for live reload.

## No credentials needed for preview
The app has a **built-in mock Supabase** on both sides:
- **Backend** (`api/supabase.ts`): in-memory mock DB activates when `NODE_ENV !== 'production'` AND `PREVIEW_MODE === 'true'` AND no real Supabase URL/key. Mock tokens (`mock-token:<email>`) are accepted by `auth.getUser`.
- **Frontend** (`src/lib/supabase.ts`): localStorage-based mock auth activates when `import.meta.env.DEV` is true and no Supabase keys. signUp/signIn work locally; access tokens are `mock-token:<email>`.

Both mocks interoperate: frontend mock auth produces `mock-token:` tokens that the backend mock accepts.

## Required env vars (set in docker-compose.base44.yml)
- `PORT=3000` — Express listen port (required, server throws without it).
- `NODE_ENV=development` — keeps Vite in middleware/dev mode and enables backend mock.
- `PREVIEW_MODE=true` — gates the backend mock DB.
- `REACT_APP_BACKEND_URL=https://3000-${BASE44_PUBLIC_HOST_SUFFIX}` — **required by the frontend** (`src/lib/api.ts` throws without it). Single-origin, so it's the same as the page URL. Baked into the client via Vite `define` at startup.
- `PREVIEW_DATA_FILE=/tmp/preview-data.json` — optional persistence path for the backend mock.

## Optional real Supabase
To use a real backend instead of the mock, provide `SUPABASE_URL` and `SUPABASE_ANON_KEY` (frontend) + `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` (backend) as secrets. SQL migrations are in `supabase/migrations/`. Without these, the app runs fully on mocks.

## Verifying it works
1. `docker compose -f docker-compose.base44.yml up -d`
2. `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` → 200
3. `curl -s http://localhost:3000/src/main.tsx` → 200 (live source, not prebuilt)
4. `curl -s -X POST "http://localhost:3000/api/cde?action=check_username" -H "Content-Type: application/json" -d '{"username":"test"}'` → `{"exists":false}` (mock DB responding)
5. Logs should show `[DEV] Supabase URL or Key is missing or invalid. Using in-memory mock database.`

## Architecture notes
- `server.ts` — Express entry; mounts `/api/multiplayer` and `/api/cde`, then Vite middleware.
- `api/cde.ts` — main game API (accounts, profiles, economy, chests, missions, achievements). Large file with many action handlers.
- `api/multiplayer.ts` — multiplayer room management (friendly matches only, no wagers).
- `src/core/` — game logic (economy, cosmetics, rewards, missions, DDA, PCG, levels).
- `src/game/` — Phaser game scenes.
- `src/screens/` — React screens (boot, login, lobby, shop, etc.).
