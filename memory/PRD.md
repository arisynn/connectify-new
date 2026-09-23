# Connectify Club — Game Hub (Poki-style) + per-game sites

## Original request (2026-09-23, Indonesian)
Setiap game punya layar sendiri (seperti Poki: tap game = buka "web" berbeda). Hub = launcher. Tombol kembali ke hub di header game dengan konfirmasi. Satu currency (Permen) untuk semua game. Misi, pencapaian, dan toko pindah ke masing-masing game; hub punya achievement meta + toko kosmetik profil. Peti dihapus → hadiah login. Supabase satu-satunya source of truth (tanpa mock/preview). Selesaikan rename Star Patrol → Infinity. Login pintar: nama belum ada → daftar, nama ada → masuk. UI tidak numpuk, padding/gap konsisten, tidak ada tombol duplikat (pertahankan bottom tab). Tema termasuk milik Onet. Multiplayer ditunda.

## Architecture
- Root Vite + React + TS app; Express `server.ts` (UI :3000, API :8001) via supervisor `frontend` (`/app/frontend/package.json` start script). Node 22 binary in `node_modules/node/bin`; run `yarn install --ignore-engines`, typecheck `PATH=/app/node_modules/node/bin:$PATH npx tsc --noEmit`.
- Config in `/app/.env` (PORT, API_PORT, REACT_APP_BACKEND_URL, SUPABASE_URL, SUPABASE_SECRET_KEY, SUPABASE_ANON_KEY, VITE_*). `api/supabase.ts` and `src/lib/supabase.ts` have NO mock fallback — missing keys fail fast.
- Supabase project ymunfgclqfdqaczluqti: tables cde_accounts, cde_profiles (permen + profile_data jsonb), cde_operations_log, cde_recovery_codes, mp_rooms; RPC cde_mutate_state (idempotent, revision-checked). No schema change needed.
- CDE: optimistic client (`src/core/cde/CDE.ts`) + authoritative server (`api/cde.ts`) share pure helpers in `src/core/*`. Operation types: UPDATE_PROFILE, UPDATE_GAME_STATE, PURCHASE_ITEM, USE_ITEM, PROCESS_WIN, CLAIM_MISSION_REWARD, CLAIM_ACHIEVEMENT_REWARD, CLAIM_LOGIN_REWARD, DAILY_CHECK_IN. Chest ops removed.
- Navigation (`GameContext`): screens home | game-hub | play | block-puzzle | memory | triple | star-patrol | star-hangar | toko | tema | prestasi | statistik | profile | … `openGame(id, tab)` sets activeGame + opens the game site. Game screens return to `game-hub`.
- Game registry `src/core/games.ts`: id/name/palette/cover/modes/status/stats per game (onet, block, memory, triple, star=Infinity). Palette overrides `--club-*` tokens so each game site looks distinct.
- Missions (`misiHarian.js`, `misiMingguan.js`): every mission has `game`; deterministic per-game pick (daily 3/2/2/2/2, weekly 2/1/1/1/1); `updateMissions(profile,event,amount,game)` scopes progress to the producing game; legacy sets archived to `pendingMissions`.
- Achievements (`achievements.js`): `game` field ('hub' for meta: total_score, high_score, levels_cleared, daily_missions, loyalty, blocks_cleared, theme_purchases, club_explorer, first_win, permen_earned, login_streak). `achievementsFor(game)`.
- Login reward (`loginReward.js`): streak schedule 5/5/6/7/8/9/10 Permen + 20 XP, one claim per WIB day, respects 100/day cap.
- Shop (`ShopPanel`): hub = profile cosmetics only; onet = skin/tema/item; block = skin/item; memory = skin/item; triple = (themes from Onet); star = ships & lasers/item/upgrade. `productGames()` (shuffle sold in onet+block).
- Auth (`CDEAuth.smartLogin`): signIn → if invalid credentials and name unknown → signUp + provision; if name known → "kata sandi salah". `check_username` exact match on cleaned name.

## Implemented 2026-09-23
- Poki-style hub (`MainLobby`): cover tiles per game, XP, login reward, hub achievements link, Main bareng tile. MobileNav: Hub / Pencapaian / Toko / Profil.
- Game site (`GameHubScreen`): header (back-to-hub with confirmation modal, brand, wallet), hero + modes, bottom tab bar Main/Misi/Pencapaian/Toko/Statistik (single source of navigation, no duplicates), panels: MissionPanel, AchievementPanel, ShopPanel, stats.
- Chest feature fully removed (screen, core, ops, missions, achievements, avatar requirement). Star Patrol → Infinity renamed everywhere; StarConfig damage/wingman upgrades wired.
- Smart one-step login screen with live name lookup hint.
- Spacing scale in `game-hub.css` (8/12/16/24/32).

## Backlog
- P1: Hub theme (user idea "tema game hub"), per-game onboarding art (generated assets), multiplayer polish (deferred by user).
- P2: Remove legacy `backend/` FastAPI tests folder; optional per-game fonts.
