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

## Current asset update — 2026-09-20 (verified)
### Latest user decisions (Indonesian)
- "Hanya buat dan pasang aset baru: tidak perlu menambahkan fitur generator di aplikasi." No AI generator, AI keys, upload endpoints or AI SDK added to the app.
- New high-quality set for all 5 themes + tile skins + avatars/brand; old generated files must stay as rewards. Rewards mixed account level, claimed achievements and daily login.
- "Nah sekarang bagian rekomendasi dari kamu, tambahkan aset gambar apapun yang direkomendasikan oleh mu hehehe" — added coordinated minigame/menu/booster art, frames, victory particles and chest art.
- "Jangan lupa update harga item yang dijual, sesuaikan berdasarkan kualitas" — quality-tiered permanent cosmetics and themes; consumable booster prices unchanged.
- "Ga perlu di screenshot ya, aku sudah lihat kok di pratinjau!" — user has viewed preview; keep final verification consolidated and avoid repeated visual passes.
### Implemented in current change
- 124 new local transparent WebP assets (~1.49 MB combined): 80 icons (16 each Sakura, Bakery, Galaxy, Meadow, Fruit), 9 blank tile surfaces, 9 avatars, 3 profile rings, 3 victory particles, 3 chests, 16 game/menu/booster icons, one brand mark; plus PNG favicon/touch icon.
- Actual generator reported Gemini 3.1 Flash Image preview, requested high quality. No GPT-6 image generator was used. Generated sources/provenance in `scripts/art_sources.json`; non-runtime originals in `scripts/art-originals/`; repeatable offline white-background removal and sprite slicing in `scripts/prepare_premium_art.py`. Old scripts/art and public/art assets not deleted or overwritten.
- Vanilla matching tiles preserved. Summer Club remains initial active theme. New Meadow is free for every account. New default Pearl tile skins cover 1×1, both domino directions and 2×2; default block/arrow/effect assets are free.
- Real bitmap cosmetics rendered in Onet, Block Puzzle, portraits, victory effects and store previews. Skins are blank material surfaces, not matching icons. Store excludes reward items. 1×1 cosmetic slot added with shared ownership/equip validation.
- New logo in home, login/startup via theme, static boot loader, preloading and favicons. Updated minigame selection icons and home imagery; shared logo map replaces matching UI illustrations. Asset cache version bumped for clean files.
- `tileCatalog.js`/theme registry now include 15 themes / 209 matching images: original 79 + new 80 + 50 legacy reward icons. Deep theme merge no longer mixes vanilla tile IDs into themed icon sets. Gallery counts dynamic.
- 5 old generated theme sets become distinct reward editions; 12 old avatar/skin images wired as earned cosmetics. Legacy files/ownership retained, including older SVG sources not used for new store rendering.
- Shared `artRewards.js`: account levels 3/5 for reward Sakura/Bakery, 3 achievement tiers for Galaxy, login days 3/7 for Meadow/Fruit. Other old skins/avatars unlock through mixed milestones. Collection > Gaya shows requirements, progress and equip. No reward-edition purchases accepted by server.
- New idempotent `DAILY_CHECK_IN` gameplay reward mutation auto-queued on app opening / WIB date change; server ignores client dates and persists login day/statistics/reward ownership. No authentication logic modified. Unlocks also evaluated after existing gameplay/missions/achievement mutations.
- Theme screen updated to club-style image catalog with normal/reward tabs; remaining legacy-screen redesign is still separate backlog.
- Prices: free Meadow + defaults; Fruit 100, Bakery 110, Sakura 120, Galaxy 150 Permen. Bitmap cosmetics 35–90. Classic pre-existing themes retain 60–100 prices. Source-of-truth price is shared economy/catalog, used by frontend and authoritative CDE API. Existing owners not charged again.
### Environment restoration
- Fork omitted `.env` and root node_modules; restored root dependencies (Node22 existing dependency) and env-only previous Express/Vite setup. Root app on3000 + API8001, unrelated template backend stopped as in prior working setup. No supervisor configuration edited.
- Preview URL is the value in `/app/frontend/.env` REACT_APP_BACKEND_URL. Existing Supabase/auth preview adapter remains MOCKED; real Supabase credentials absent, production persistence NOT verified.
### Verification / remaining priorities
- TypeScript lint and production build passed. Clean sprite review complete. Consolidated test pass: 25 backend tests passed (including actual priced purchase/debit/persistence, forged-price rejection, equip guards, free theme, check-in idempotency, alpha and asset delivery checks). Ten new/reward themes × levels 1/3/7 generated solvable boards with correct tile IDs.
- Browser verified login/startup/home/store pricing and theme equip, no horizontal overflow on mobile390×844 and desktop1920×800. Targeted follow-up verified all60 actual Onet buttons have Pearl image backgrounds and correct Meadow icons. Initial reported missing-skin finding was a test-selector false positive: `[data-testid^='onet-tile-']` selected `onet-tile-grid`, not a tile. Use `button[data-tile-id]` for assertions.
- Repeated-login issue was forced-click timing during entry animation, not reproduced with stable-button actionability checks. New registration, actual free Meadow equip, then sign-out/existing-account sign-in passed. No auth application code changed. Actual reward threshold/WIB-midnight/inherited ownership/idempotency assertions also passed.
- Reports: `/app/test_reports/iteration_1.json` (original findings), `/app/test_reports/art_final_verification.json` (follow-up resolutions), `/app/test_reports/pytest/pytest_results_iteration_latest.xml`. Not all minigame rounds were played to completion in this asset pass; catalog delivery and procedural gameplay generation are covered. Real Supabase remains unverified/MOCKED in preview.
- P0 current: none unresolved in the tested asset/pricing/reward scope. User review of subjective artwork/value remains welcome.
- P1 carry-over: restyle remaining Achievements/Chests/Collection/Multiplayer/Block/Notifications to 100% club-v3; compact home; game-over returns to Level Select; distinguish Challenge Center vs Level Select.
- P2: seasonal cosmetic collections, player feedback on perceived quality/value; real Supabase verification with existing project credentials remains untested.