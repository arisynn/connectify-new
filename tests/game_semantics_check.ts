import assert from 'node:assert/strict';
import { generateBoard, findHint, isBoardSolvable, guaranteedShuffle, groupSize } from '../src/core/board.js';
import { getOnetDifficulty } from '../src/core/difficulty.js';
import { tileIdsFor } from '../src/core/tileCatalog.js';
import { ALL_PIECES } from '../src/game/block-puzzle/core/pieces.ts';

const levels = [1, 4, 8, 15, 30];
const seeds = [11, 29, 47];

function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function masters(board: any[][]) {
  const out: { r: number; c: number; tile: any }[] = [];
  for (let r = 1; r <= 10; r++) {
    for (let c = 1; c <= 6; c++) {
      const t = board[r]?.[c];
      if (t && !t.isSlave) out.push({ r, c, tile: t });
    }
  }
  return out;
}

function occupiedCellCount(board: any[][]) {
  let count = 0;
  for (let r = 1; r <= 10; r++) for (let c = 1; c <= 6; c++) if (board[r]?.[c]) count += 1;
  return count;
}

function adjacencyEqualPairs(board: any[][]) {
  let total = 0;
  for (let r = 1; r <= 10; r++) {
    for (let c = 1; c <= 6; c++) {
      const t = board[r]?.[c];
      if (!t || t.isSlave) continue;
      const right = board[r]?.[c + 1];
      const down = board[r + 1]?.[c];
      if (right && !right.isSlave && right.id === t.id) total += 1;
      if (down && !down.isSlave && down.id === t.id) total += 1;
    }
  }
  return total;
}

function avgDistanceById(board: any[][]) {
  const byId: Record<string, { r: number; c: number }[]> = {};
  for (const m of masters(board)) {
    byId[m.tile.id] = byId[m.tile.id] || [];
    byId[m.tile.id].push({ r: m.r, c: m.c });
  }
  let total = 0;
  let pairs = 0;
  for (const cells of Object.values(byId)) {
    for (let i = 0; i + 1 < cells.length; i += 2) {
      const a = cells[i], b = cells[i + 1];
      total += Math.abs(a.r - b.r) + Math.abs(a.c - b.c);
      pairs += 1;
    }
  }
  return pairs ? total / pairs : 0;
}

const summary: any = {
  perLevel: {},
  lowTier: { adj: 0, dist: 0, n: 0 },
  highTier: { adj: 0, dist: 0, n: 0 },
};

for (const level of levels) {
  const diff = getOnetDifficulty(level);
  const idsSeen = new Set<string>();
  for (const seed of seeds) {
    const rng = mulberry32(seed + level * 9973);
    const board = generateBoard('candy', level, rng);

    assert.equal(occupiedCellCount(board), 60, `Level ${level} seed ${seed}: board must occupy 60 cells`);
    assert.equal(isBoardSolvable(board), true, `Level ${level} seed ${seed}: board must be solvable`);
    assert.ok(findHint(board), `Level ${level} seed ${seed}: board must have hint`);

    const pairCounts: Record<string, number> = {};
    for (const m of masters(board)) {
      const size = groupSize(m.tile);
      const key = `${m.tile.id}|${size.rows}x${size.cols}`;
      pairCounts[key] = (pairCounts[key] || 0) + 1;
      idsSeen.add(m.tile.id);
      if (m.tile.openSide) {
        assert.equal(Boolean(m.tile.isSlave), false, `Level ${level}: arrow tile cannot be slave`);
        assert.equal(size.rows * size.cols, 1, `Level ${level}: arrow tile cannot be grouped tile`);
      }
    }
    Object.entries(pairCounts).forEach(([k, n]) => assert.equal(n % 2, 0, `Level ${level}: odd group count for ${k}`));

    const arrowTiles = masters(board).filter(m => !!m.tile.openSide).length;
    if (level < 8) assert.equal(arrowTiles, 0, `Level ${level}: arrows should not appear before level 8`);
    if (level >= 8) assert.ok(arrowTiles >= 1, `Level ${level}: arrows should appear from level 8`);

    const shuffled = guaranteedShuffle(board, mulberry32(seed + 123456), level);
    assert.ok(findHint(shuffled), `Level ${level} shuffled: must still have hint`);
    assert.equal(isBoardSolvable(shuffled), true, `Level ${level} shuffled: must remain solvable`);
    const shuffledArrows = masters(shuffled).filter(m => !!m.tile.openSide).length;
    if (level < 8) assert.equal(shuffledArrows, 0, `Level ${level} shuffled: arrows before level 8`);
    if (level >= 8) assert.ok(shuffledArrows >= 1, `Level ${level} shuffled: arrows missing for high level`);

    const adj = adjacencyEqualPairs(board);
    const dist = avgDistanceById(board);
    if (level <= 4) {
      summary.lowTier.adj += adj;
      summary.lowTier.dist += dist;
      summary.lowTier.n += 1;
    }
    if (level >= 15) {
      summary.highTier.adj += adj;
      summary.highTier.dist += dist;
      summary.highTier.n += 1;
    }
  }
  summary.perLevel[level] = { uniqueIds: idsSeen.size, arrowPairsTarget: diff.arrowPairs };
  if (level >= 8) {
    assert.ok(idsSeen.size >= 15, `Level ${level}: expected near-full artwork participation (>=15), got ${idsSeen.size}`);
  }
}

const lowAdj = summary.lowTier.adj / summary.lowTier.n;
const highAdj = summary.highTier.adj / summary.highTier.n;
const lowDist = summary.lowTier.dist / summary.lowTier.n;
const highDist = summary.highTier.dist / summary.highTier.n;
assert.ok(highAdj <= lowAdj, `High tier adjacent matches should not exceed low tier average (${highAdj} > ${lowAdj})`);
assert.ok(highDist >= lowDist, `High tier average distance should be >= low tier (${highDist} < ${lowDist})`);

const pool = tileIdsFor('candy');
assert.equal(pool.length, 16, 'Candy tile pool should have 16 artworks');

const SHAPE_KEYS = ['dot', 'bar2h', 'bar2v', 'bar3h', 'bar3v', 'bar4h', 'bar4v', 'square', 'corner', 'L', 'T'];
const variantIds = new Set(
  ALL_PIECES.map((p: any) => SHAPE_KEYS.find(k => String(p.id).startsWith(`${k}-`))).filter(Boolean) as string[]
);
assert.equal(variantIds.size, 11, `Block catalog should contain 11 orientation variants, got ${variantIds.size}`);
['U', 'plus', 'pentomino'].forEach(invalid => {
  for (const id of variantIds) {
    assert.equal(id.toLowerCase().includes(invalid), false, `Invalid shape found: ${id}`);
  }
});

console.log(JSON.stringify({
  ok: true,
  uniqueIdsByLevel: summary.perLevel,
  lowTier: { adj: lowAdj, dist: lowDist },
  highTier: { adj: highAdj, dist: highDist },
  pieceVariants: variantIds.size,
}));
