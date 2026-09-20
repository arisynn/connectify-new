import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { BEACH_TILES, TILE_SETS } from '../src/core/tileCatalog.js';
import { THEME_PRICES } from '../src/core/economy.js';
import { ART_REWARDS } from '../src/core/artRewards.js';
import { COSMETICS, DEFAULT_COSMETICS } from '../src/core/cosmetics.js';

const themes = ['sweets', 'ocean', 'forest', 'candy', 'space', 'sakura', 'bakery', 'galaxy', 'meadow', 'fruit'];
const rewardThemes = ['reward_sakura', 'reward_bakery', 'reward_galaxy', 'reward_meadow', 'reward_fruit'];

assert.equal(BEACH_TILES.length, 15, 'Vanilla tile IDs must stay at 15');
for (const id of ['candy', 'ocean', 'forest', 'space', 'sakura', 'bakery', 'galaxy', 'meadow', 'fruit']) {
  assert.equal((TILE_SETS as any)[id].length, 16, `${id} must contain exactly 16 tile IDs`);
}
for (const id of rewardThemes) {
  assert.equal((TILE_SETS as any)[id].length, 10, `${id} must contain exactly 10 reward tile IDs`);
}

const totalCatalogIds = new Set<string>([
  ...BEACH_TILES,
  ...Object.values(TILE_SETS).flat() as string[],
]).size;
assert.equal(totalCatalogIds, 209, 'Total tile ID catalog should be 209');

assert.deepEqual(
  {
    fruit: THEME_PRICES.fruit,
    bakery: THEME_PRICES.bakery,
    sakura: THEME_PRICES.sakura,
    galaxy: THEME_PRICES.galaxy,
    meadow: THEME_PRICES.meadow,
  },
  { fruit: 100, bakery: 110, sakura: 120, galaxy: 150, meadow: 0 },
  'Theme prices must match agreed catalog'
);

assert.deepEqual(
  {
    reward_sakura: ART_REWARDS.reward_sakura,
    reward_bakery: ART_REWARDS.reward_bakery,
    reward_galaxy: ART_REWARDS.reward_galaxy,
    reward_meadow: ART_REWARDS.reward_meadow,
    reward_fruit: ART_REWARDS.reward_fruit,
  },
  {
    reward_sakura: { kind: 'level', target: 3 },
    reward_bakery: { kind: 'level', target: 5 },
    reward_galaxy: { kind: 'achievement', target: 3 },
    reward_meadow: { kind: 'login', target: 3 },
    reward_fruit: { kind: 'login', target: 7 },
  },
  'Reward boundary rules changed unexpectedly'
);

const themeUtilsSource = readFileSync('/app/src/core/theme/utils.ts', 'utf-8');
assert.ok(
  themeUtilsSource.includes("if (customTheme.assets?.tiles) resolved.assets.tiles = { ...customTheme.assets.tiles }"),
  'resolveTheme must preserve custom tile keys and avoid vanilla deep-merge contamination'
);

for (const [slot, id] of Object.entries(DEFAULT_COSMETICS)) {
  const found = COSMETICS.find((c) => c.id === id);
  assert.ok(found, `Default cosmetic missing for slot ${slot}`);
  assert.equal(found?.price, 0, `Default cosmetic for ${slot} must be free`);
}

const paidAtelier = COSMETICS.filter((c) => typeof c.price === 'number' && c.price > 0 && !c.reward);
assert.ok(paidAtelier.every((c) => c.price >= 35 && c.price <= 90), 'Paid cosmetics must stay within 35-90 range');

console.log(JSON.stringify({ ok: true, totalCatalogIds, paidCount: paidAtelier.length }));
