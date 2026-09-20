# Connectify Club — Seasonal Stories

## Original request
"Ini sebenernya game nya udh bagus ya udh bagus bngt. Nah cuman aku pengen konsistensi kan tampilan nya semuanya, soalnya belum konsisten kan sama tampilan baru nya, ini kayak 75% baru 25% masih yang lama, terus kalau bisa pakai 1 tombol untuk 1 fitur aja biar bagus, nah contoh nih di tab playing game harusnya tuh langsung pakai file yang level select, jadi pas game over terus ke menu tetep kembali ke layar itu, untuk yang sekarang kayak beda gitu frontend nya yang pusat tantangan kalo ga salah, atur saja deh analisis dulu ya biar makin bagus. Nah udh. Itu aja kayaknya. Terus aku pengen kamu update kali ini lebih fokus ke perbanyak tema, jual kosmetik, perbanyak asets gambar biar game nya bagus nggak pakai svg semua. Udh sih, cuma perbanyak trma sama assets gambar saja di prioritaskan. Nah sama assets gambar lama, itu klo bisa digunakan gunakan aja kalau gabisa gapapa hapus saja. Klo bisa kamu ngasih pertanyaan nya setelah kamu menganalisis game nya ya nanti aku jawab hal yang ga kamu pahami biar ga salah paham"

## Explicit corrections and additional scope
- ALL old image files must stay untouched: "Asets lama ga usah di apa apain udh bagus itu kesalahan prompt".
- Onet tile skins sold as complete same-material sets for 1×1, domino 1×2 / 2×1, and 2×2; never separate purchases. Upgrade legacy partial owners freely.
- Animated cosmetics for Onet, Block, and other games. Delete Challenge Center. All games equal/main games, no minor-game label.
- Fix Block dragged pieces using default rendering instead of equipped bitmap skin. Refresh all popups and screen layouts.
- Improve Memory with illustrated cards and mechanics. Fruit Merge with original fruit artwork requested but explicitly allowed to wait until current work is finished.
- Update missions/achievements. Make achievements prominent. All completed-round progress feeds missions, achievements, statistics.
- Home must fit one viewport without scrolling, retaining original features.

## Architecture / preserved systems
- Existing root-level Vite + React + TypeScript application, Express + API handlers, not FastAPI/React scaffold. State-screen navigation in GameContext.
- Node 22 binary at node_modules/node/bin/node; `yarn install --frozen-lockfile --ignore-engines` needed under base container's Node 20. Build/lint through PATH=/app/node_modules/node/bin:$PATH.
- Supervisor `frontend` runs root `yarn dev`, launches UI 3000 and API 8001; unused template `backend` supervisor process stopped. URLs/settings in .env; frontend/.env contains external backend URL for testing convention. No Supabase keys supplied. Existing PREVIEW_MODE store persists /app/.preview/data.json. Public production auth integration remains pre-existing configuration-dependent and was not changed.
- CDE optimistic transactions/outbox plus authoritative server, central shared economy/cosmetics/reward modules. Existing Permen 100/day cap retained. No payment provider added.
- Existing game mechanics, accounts, assets, achievements/mission claims preserved. Legacy `challenges` route redirects to `levels`; ChallengeScreen file deleted. navigate callback must remain stable to avoid boot effects firing again.

## Implemented
1. Four themes: Autumn Harvest, Magic Atelier, Retro Arcade, Alpine Winter; 16 distinct WebP matching tiles each. 86 NEW processed image assets overall: 64 theme tiles, 16 cosmetics, 6 Memory card/face/deck images. Source sheets, manifests, extraction scripts retained in scripts/ and public/art/premium. Existing public/art and src/assets tracked files unchanged.
2. Shared seasonal catalog with avatar, frame, block, victory effects, new skins. Ten complete tile sets (nine purchasable; Pearl free). Atomic ownership/equip across all three footprints. Existing individual skin owner derives full set ownership. Server rejects purchasing hidden individual tile parts.
3. Twelve gameplay animation cosmetics: 4 each for Onet match/split, Block/Infinity line clear (also duel blocks), Memory matched cards. Four illustrated Memory backs (one free). Store previews use actual sprite animations, themed 16-image previews, confirmation dialogs, balance validation, equip/unequip, ownership filters.
4. Canonical Choose Game screen for Onet, Block, Memory, Triple, Infinity, Sprint, multiplayer. Back/results lead to same screen. No Challenge Center UI. Selection-page scroll preserved.
5. Refreshed Onet, Block results, Memory and Triple layouts. Block bitmap textures consistent in tray, ghost, drag overlay, placed cells, and multiplayer; holes remain empty. Uniform modals, keyboard focus traps, portal-backed store/account/room/settings dialogs. No duplicate close/buy-or-equip buttons.
6. Memory: 6/8/12-pair difficulty choices (capped to available distinct art), 2.3s initial peek with frozen timer, 3D card flip, anti-double-click locks, match animation, +30 streak bonuses capped after five steps, remaining-time win bonus, accurate combo result payload.
7. Unified GameShell for achievements, collection, chest, notification, settings, stats. Home grid fits viewport; headline/decorations scale down, XP/rounds/record/ready missions/wallet/profile/chests/notifications/nav remain. Added visible Achievement tile.
8. Prominent Progres navigation (Misi / Pencapaian / Statistik), per-game stats and five new achievements. Dedicated daily/weekly Memory & Triple missions introduced without deleting existing progress/claims. Game-specific match events prevent Memory filling Onet missions. Results deduped by runId. Per-game matches/time/combo counters and newly claimable achievement notifications.

## Verification state
- TypeScript check and production build passed before last navigation stabilization; final rerun required.
- Desktop screenshot flows passed: shop, full skin preview, dragged block uses equipped cloud.webp, game back returns Choose Game, Onet board visible, Home scrollHeight==clientHeight, Achievement screen accessible, six daily missions, Memory relaxed deck 12 cards + frozen 75s preview.
- Comprehensive testing agent pending: purchases, legacy ownership, exact result/mission/achievement/statistics linkage, responsive 320/390/768/1920 and dark mode, no asset overwrites.

## Prioritized backlog / next tasks
- P0: complete integrated QA, fix all findings, recheck mobile Home all features within viewport.
- P1 NEXT (user deferred): Fruit Merge as a main game; original fruit progression artwork; merge/drop physics, loss/retry, score/combos, shared mission/achievement/statistics events, bitmap cosmetic previews. Do not create a nonfunctional menu button now.
- P2: further card decks/theme seasons after feedback; improve artwork-specific animation variations without mechanical advantage.
- Existing integration limitation: no production Supabase credentials in workspace; real-project cloud login was not part of this change. Preview account credentials in test_credentials.md.