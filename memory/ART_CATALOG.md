# Connectify Atelier — 2026-09-20

## Asset delivery
- 124 transparent WebP sprites, approximately 1.49 MB combined, in `public/art/premium`.
- 5 Onet themes ×16 images; 9 blank material surfaces; 9 avatar portraits; 3 avatar rings; 3 celebration particles; 3 chest images; 16 UI/minigame/booster icons; 1 brand mark. Separate 64px favicon and 180px touch icon PNGs.
- Generated with reported `gemini-3.1-flash-image-preview`, high quality requested. Asset creation only; no AI integration/key/SDK added to the game.
- `scripts/art_sources.json` records sources. `scripts/prepare_premium_art.py` builds transparent optimized sprites from white-background source sheets. `scripts/art-originals` retains source iterations. No original `/public/art` legacy images or vanilla tile PNGs were overwritten.

## Pricing (Permen, permanent purchases)
- Free: Summer Club, new Meadow Atelier; Pearl1×1, Pearl Duo, Pearl Cube, Pearl Compass, Pearl Blocks, Blossom Burst.
- New themes: Fruit100, Bakery110, Sakura120, Midnight Galaxy150.
- Classic themes: Ocean60, Forest80, Candy80, Space100.
- Avatar portraits:60–90. Profile frames:50–75. 1×1 skins:35–50. Domino skins:55–60. 2×2 skins:70–80. Direction skins:35–40. Block skins:80–90. Victory effects:60–65.
- Booster prices unchanged: hint8, shuffle12, hammer14, bomb18. No power advantages added. Existing owners retain their items.
- Source of truth is `src/core/economy.js` + `src/core/cosmetics.js`, shared with authoritative API. Client-supplied prices ignored. Legacy reward items have no purchase price and cannot be purchased.

## Legacy reward editions
- Sakura: account level3. Bakery: account level5. Galaxy:3 claimed achievement tiers. Meadow:3 login days. Fruit:7 login days.
- 12 legacy avatar/skin items use mixed milestones; all rules in `src/core/artRewards.js`.
- Collection > Gaya > Hadiah perjalanan lists cosmetic requirements and progress; Collection > Tema or Tema > Edisi hadiah lists reward themes.
- Daily check-in is an idempotent game reward operation using server WIB date, not new authentication logic. No currency is granted by check-in; it advances old-art unlocks and existing login-day achievement progress.

## Follow-up backlog
- Remaining club-v3 screens, compact homepage, Level Select return routing, and differentiating Challenge Center content.
- Possible enhancement: seasonal coordinated cosmetic collections, keeping free milestone rewards.