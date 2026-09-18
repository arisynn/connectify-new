# Connectify — Mobile & Gameplay Polish

## Original problem statement (current request)
Tolong update game web ku. Perbarui tampilan untuk versi mobile , versi dekstop udh bagus sepertinya, terus ini ( polish animasi nya soalnya kan animasi nya baru yang untuk tile 1×1 ya, nah tambahin sekarang, terus tile yang pecah tuh beda beda jenis keluar nya, apalagi yang udh jadi 1×1 harus beda beda, dan satu lagi, gunakan semua aset tile, klo gasalah asets vanila itu ada 15, untuk tema lain gatau aku lupa ) terus update engine level generator game onet dan block puzzle, update mekanik game nya, revamp mission nya, update tampilan menyeluruh, kalau emang tombol frontend atau logo nya klo ada yang perlu svg pake svg aja, kalo perlu assets pake asets, level akun juga perbarui, update yang paling rekomended, jangan terlalu banyak test, test nya kalau sudah perbarui semua aja biar sedikit hemat kredit. Animasi nya perbagus, terus isi menu app nya juga perbarui, pokonya polish jadi bagus yaa game nyaa !

User approved autonomous recommended changes, testing consolidated at end, optional extra assets, and explicitly preserving the existing game style. Additional input: "Kalau perlu asets tambahan tambahan aja biar game nya makin bagus ya ! Perbarui ui dan ux nya lebih bagus tapi tetep pertahankan style game nya. Kamu bebas memberikan saran tambahan apapun".

## Architecture retained
- Actual app is root `/app`: Vite + React + Tailwind 4 + motion, Express API (`server.ts`, `api/cde.ts`, `api/multiplayer.ts`), Supabase. NOT the standard FastAPI template.
- Shared pure helpers under `src/core` power optimistic client updates and authoritative API updates.
- Existing single-currency Permen economy preserved: direct gameplay awards XP/chest points and mission progress, not currency. Permen claimed through established mission/chest/achievement flows with existing 100/day cap.
- Preview supervisor's `frontend` launcher runs the root Express/Vite app on PORT=3000 with API_PORT=8001. Unrelated starter Python backend is stopped to avoid occupying 8001.
- Node 22 added via yarn as dev dependency for current Supabase package compatibility. Launcher uses node22 and tsx watch; excludes Vite's generated timestamp modules and `.preview` JSON to avoid restart loops.
- `.env` holds PORT, API_PORT, REACT_APP_BACKEND_URL, PREVIEW_MODE=true, PREVIEW_DATA_FILE. No actual Supabase keys present here. Existing development-only Supabase/auth adapter enabled; server profile data persists at `/app/.preview/data.json`. Production still requires real Supabase configuration and rejects preview adapter use.
- No new external integration, no new currency, no asset-generation service. Reused all 79 existing tile images; lucide SVG controls.

## Implemented
### Onet
- Full catalog participation: 15 vanilla/Summer Club, 16 each candy/ocean/forest/space. Removed previous hard 12-asset limit.
- Hierarchy: 2×2 splits into horizontal OR vertical dominoes, dominoes into 1×1. Siblings get distinct new asset IDs; corresponding children of both parents remain valid matched pairs.
- Pure deterministic split logic and seeded RNG. Daily boards now seeded by WIB date and theme. Regular levels vary hierarchy/footprints, recovery rounds, and timer budget (120–160s; daily timer retains its existing rule).
- Full-board solver checks during bounded generation, constructive fallback, paired recovery when a board becomes stuck. Frame coordinates/slave cells preserved.
- Full-footprint SVG match rings, path animation, separating image halves, spring-reveal children, 4 image shards + 8 deterministic themed particles per unit match. Reduced-motion support.
- Responsive measured board area, compact mobile timer/score header, remaining cells/difficulty line, touch-friendly labeled boosters, revamped result/pause dialogs, XP/level-up feedback.

### Block Puzzle
- Actual weighted shape selection, distinct playable choices, crowd-aware weighting; choices consider obstacles and current free space. Does not promise the board remains solvable after arbitrary future player choices.
- Replaced expensive/inaccurate synchronous bot PCG for levels >20 with deterministic bounded construction: 3×3 landing zone, per-row/column obstacle limits, chapter objectives, recovery pacing and feasible obstacle targets. First 20 authored levels retained.
- Fixed perfect-clear detection to account for unique cells and surviving obstacles.
- Live level objectives, clear animation, predictive line highlights while dragging, invalid-placement feedback, pointer-cancel protection, mobile board/tray/footer fit. Desktop boosters stacked to avoid clipping.

### Missions / Account / Menus
- New daily slots: welcome round, Onet, Block Puzzle, skill, arcade. Weekly slots include block and discovery objectives. No forced spending mission in new daily rotation.
- Split and round-completion event tracking added. Existing active mission progress/claims preserved through period reset; archived rewards remain available.
- Mission UI: daily/weekly/saved tabs, completion track, sorted claimable cards, game badges, Permen+XP rewards, direct play buttons, WIB reset countdown and empty state.
- Real account XP from all four games and mission claims; separate from Onet campaign level. Idempotent run/claim awards; legacy progress converted once when first XP is awarded. Six account titles; lobby progress and profile journey.
- Refined mobile lobby, five bottom tabs hidden during gameplay, direct Onet/Block shortcuts, preserved desktop two-column composition and original Fredoka/Outfit pastel tactile style.
- Collection theme gallery displays all 79 tile images. Notifications mark read in one mutation and deep-link to appropriate rewards screens.
- Profile/ledger/theme/settings shortcuts and improved mobile long-name handling. Authoritative account username included in get_profile and consumed on sync so restored accounts don't fall back to Player.

## Verification and resolved issues
- One consolidated testing-agent pass: `/app/test_reports/iteration_1.json`; helper tests `/app/tests/final_regression.ts` passed across 5 themes × 5 levels, splits, solvability, deterministic PCG, XP and claim idempotency; lint/build passed.
- Initial API failures traced to missing PREVIEW_MODE flag, now configured. This also resolved hints not decrementing due missing initialized profile.
- Targeted existing backend checks after fix: CDE 10/10, multiplayer 7/7. Reports under `/app/test_reports/pytest/*_after_fix.xml`.
- Real browser play completed Onet L1 and L2, then matched 2×2 at L3 and observed four children with two distinct image IDs. Hint count 3→2. Three rapid pause/resume cycles and exit visibility passed.
- Mission d_play claimed through UI; server GET independently confirmed 325 accountXP and 5 Permen, preserved after server restart and new browser context.
- Final mobile 390×844 + desktop 1920×800 screenshots: no horizontal overflow. Desktop bomb button verified fully inside sidebar. Name restored correctly; profile shows level3. Screenshots `/app/final-verified-*.jpg`.
- Production Supabase integration was NOT exercised because real project credentials are absent; pre-existing preview adapter is dev-only. No unresolved defects from this task's final tested paths. See final verification report for scope.

## Prioritized backlog / next tasks
- P0: No outstanding blocker in verified preview flows. Validate existing real Supabase project/RPCs with actual credentials before claiming production persistence verified.
- P1: Tune procedural Block levels using player sessions and difficulty telemetry (construction guarantees valid objectives/space, not a complete long-term solution).
- P1: Optional weekly themed events with cosmetic rewards; keep current currency economy intact.
- P2: Reduced-effects setting independent of OS, further theme-specific sound/haptics, accessible Onet keyboard grid navigation.
- P2: Shared score/result cards and optional account-title cosmetic unlocks.

## Prior implementation retained
Existing shop, achievements, chest rewards/timers, inventory, avatars, theme ownership/equip, minigames, multiplayer, ledger, profile settings and statistics retained. Older PRD currency reward numbers were stale and are superseded by current `src/core/economy.js`, not changed as part of this polish.