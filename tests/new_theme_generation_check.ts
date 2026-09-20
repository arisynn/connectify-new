import assert from 'node:assert/strict';
import { generateBoard, isBoardSolvable, countRemaining } from '../src/core/board.js';
import { seededRandom } from '../src/core/random.js';
import { ROWS, COLS } from '../src/core/config.js';
import { tileIdsFor } from '../src/core/tileCatalog.js';

const THEMES = ['sakura', 'bakery', 'galaxy', 'meadow', 'fruit', 'reward_sakura', 'reward_bakery', 'reward_galaxy', 'reward_meadow', 'reward_fruit'];

for (const theme of THEMES) {
  for (const level of [1, 3, 7]) {
    const board = generateBoard(theme as any, level, seededRandom(`theme-${theme}-lv-${level}`));
    assert.equal(countRemaining(board), 60, `${theme} level ${level} should have 60 occupied cells`);
    assert.equal(isBoardSolvable(board), true, `${theme} level ${level} should be solvable`);

    const allowed = new Set(tileIdsFor(theme));
    let masters = 0;
    for (let r = 1; r <= ROWS; r++) {
      for (let c = 1; c <= COLS; c++) {
        const tile = board[r][c];
        if (!tile || tile.isSlave) continue;
        masters += 1;
        assert.ok(allowed.has(tile.id), `${theme} used out-of-catalog tile id ${tile.id}`);
      }
    }
    assert.ok(masters >= 20, `${theme} should have enough master tiles for gameplay`);
  }
}

console.log(JSON.stringify({ ok: true, themesChecked: THEMES.length }));
