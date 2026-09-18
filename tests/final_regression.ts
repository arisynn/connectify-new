import assert from 'node:assert/strict';
import { generateBoard, isBoardSolvable, countRemaining, findHint, clearMatchedGroups, guaranteedShuffle } from '../src/core/board.js';
import { seededRandom } from '../src/core/random.js';
import { ROWS, COLS } from '../src/core/config.js';
import { tileIdsFor, BEACH_TILES, TILE_SETS } from '../src/core/tileCatalog.js';
import { getRandomPieces } from '../src/game/block-puzzle/core/pieces.ts';
import { generateProceduralLevel } from '../src/game/block-puzzle/core/pcg.ts';
import { RewardEngine } from '../src/core/reward.js';
import { claimMissionReward, generateDailyMissions, checkDailyMissions } from '../src/core/misiHarian.js';
import { getTodayKey, DAILY_INCOME_CAP } from '../src/core/economy.js';
import { getAccountXP } from '../src/core/progression.js';

const themes = ['sweets', 'ocean', 'forest', 'candy', 'space'];
const levels = [1, 2, 3, 6, 21];

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

const serializeBoard = (b: any[][]) => JSON.stringify(b.map(row => row.map(cell => {
  if (!cell) return 0;
  const { id, isSlave, masterR, masterC, groupRows, groupCols, splitAxis, splitDepth } = cell;
  return { id, isSlave: !!isSlave, masterR, masterC, groupRows, groupCols, splitAxis, splitDepth };
})));

const assertNoOrphanSlaves = (board: any[][]) => {
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      const t = board[r][c];
      if (!t || !t.isSlave) continue;
      assert.ok(Number.isInteger(t.masterR) && Number.isInteger(t.masterC), `Slave missing master coords at ${r},${c}`);
      const master = board[t.masterR]?.[t.masterC];
      assert.ok(master && !master.isSlave, `Orphan slave at ${r},${c}`);
      assert.equal(master.id, t.id, `Slave/master ID mismatch at ${r},${c}`);
    }
  }
};

const runToZeroAndCollectIds = (initialBoard: any[][], theme: string) => {
  let board = clone(initialBoard);
  const seen = new Set<string>();
  for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) if (board[r][c]) seen.add(board[r][c].id);
  for (let i = 0; i < 220; i++) {
    if (countRemaining(board) === 0) return { solved: true, seen };
    const hint = findHint(board);
    assert.ok(hint, `Expected hint while solving ${theme}, step ${i}`);
    board = clearMatchedGroups(board, hint!.p1, hint!.p2, theme);
    for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) if (board[r][c]) seen.add(board[r][c].id);
  }
  return { solved: countRemaining(board) === 0, seen };
};

const shapeId = (piece: any) => String(piece.id).split('-').slice(0, -1).join('-');
const canPlace = (piece: any, row: number, col: number, board: string[][], obstacles: string[][] | null = null) => {
  const obs = obstacles || Array.from({ length: 10 }, () => Array(10).fill(''));
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c] !== 1) continue;
      const br = row + r, bc = col + c;
      if (br < 0 || br >= 10 || bc < 0 || bc >= 10) return false;
      if (board[br][bc] !== '') return false;
      if (['wood', 'metal-2', 'metal-1', 'stone'].includes(obs[br][bc])) return false;
    }
  }
  return true;
};

const canFitSomewhere = (piece: any, board: string[][], obstacles?: string[][]) => {
  for (let r = 0; r < 10; r++) for (let c = 0; c < 10; c++) if (canPlace(piece, r, c, board, obstacles)) return true;
  return false;
};

const testBoardHelpers = () => {
  for (const theme of themes) {
    for (const level of levels) {
      const seed = `seed-${theme}-${level}`;
      const b1 = generateBoard(theme as any, level, seededRandom(seed));
      const b2 = generateBoard(theme as any, level, seededRandom(seed));
      assert.equal(serializeBoard(b1), serializeBoard(b2), `Non-deterministic board ${theme} L${level}`);

      const occupied = countRemaining(b1);
      assert.equal(occupied, 60, `Expected 60 occupied cells for ${theme} L${level}, got ${occupied}`);
      assertNoOrphanSlaves(b1);
      assert.equal(isBoardSolvable(b1), true, `Board not solvable ${theme} L${level}`);

      const solved = runToZeroAndCollectIds(b1, theme);
      assert.equal(solved.solved, true, `Solver did not reach zero ${theme} L${level}`);
      const catalog = new Set(tileIdsFor(theme));
      const missing = [...catalog].filter(id => !solved.seen.has(id));
      assert.equal(missing.length, 0, `Missing assets in evolution for ${theme} L${level}: ${missing.join(',')}`);

      const shuffled = guaranteedShuffle(clone(b1), seededRandom(`shuffle-${theme}-${level}`));
      const hint = findHint(shuffled);
      assert.ok(hint, `guaranteedShuffle produced no hint for ${theme} L${level}`);
      const ids = new Map<string, number>();
      for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) {
        const t = shuffled[r][c];
        if (!t || t.isSlave) continue;
        ids.set(t.id, (ids.get(t.id) || 0) + 1);
      }
      for (const [id, n] of ids) assert.equal(n % 2, 0, `Odd pair count after shuffle for ${id}`);
    }
  }
};

const makeBoard = () => Array.from({ length: ROWS + 2 }, () => Array(COLS + 2).fill(0));
const testSplitSemantics = () => {
  for (const splitAxis of ['horizontal', 'vertical'] as const) {
    const board = makeBoard();
    const id = splitAxis === 'horizontal' ? 'beach_ball' : 'beach_hat';
    board[1][1] = { id, groupRows: 2, groupCols: 2, splitAxis };
    board[1][2] = { id, isSlave: true, masterR: 1, masterC: 1 };
    board[2][1] = { id, isSlave: true, masterR: 1, masterC: 1 };
    board[2][2] = { id, isSlave: true, masterR: 1, masterC: 1 };
    board[1][4] = { id, groupRows: 2, groupCols: 2, splitAxis };
    board[1][5] = { id, isSlave: true, masterR: 1, masterC: 4 };
    board[2][4] = { id, isSlave: true, masterR: 1, masterC: 4 };
    board[2][5] = { id, isSlave: true, masterR: 1, masterC: 4 };
    const after = clearMatchedGroups(board, { r: 1, c: 1 }, { r: 1, c: 4 }, 'sweets');

    const masters = [] as Array<{ r: number; c: number; id: string }>;
    for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) {
      const t = after[r][c];
      if (t && !t.isSlave) masters.push({ r, c, id: t.id });
    }
    assert.equal(masters.length, 4, `Expected 4 master children for ${splitAxis}`);
    const left = masters.filter(m => m.c <= 2).sort((a, b) => (a.r - b.r) || (a.c - b.c));
    const right = masters.filter(m => m.c >= 4).sort((a, b) => (a.r - b.r) || (a.c - b.c));
    assert.equal(left.length, 2);
    assert.equal(right.length, 2);
    assert.notEqual(left[0].id, left[1].id, 'Sibling IDs must differ (left parent)');
    assert.notEqual(right[0].id, right[1].id, 'Sibling IDs must differ (right parent)');
    assert.equal(left[0].id, right[0].id, 'Corresponding first children should match');
    assert.equal(left[1].id, right[1].id, 'Corresponding second children should match');
  }

  // domino horizontal
  const domH = makeBoard();
  domH[3][1] = { id: 'beach_ball', groupRows: 1, groupCols: 2 };
  domH[3][2] = { id: 'beach_ball', isSlave: true, masterR: 3, masterC: 1 };
  domH[3][4] = { id: 'beach_ball', groupRows: 1, groupCols: 2 };
  domH[3][5] = { id: 'beach_ball', isSlave: true, masterR: 3, masterC: 4 };
  const ah = clearMatchedGroups(domH, { r: 3, c: 1 }, { r: 3, c: 4 }, 'sweets');
  const hMasters: any[] = [];
  for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) if (ah[r][c] && !ah[r][c].isSlave) hMasters.push({ r, c, id: ah[r][c].id });
  assert.equal(hMasters.length, 4);

  // domino vertical
  const domV = makeBoard();
  domV[1][1] = { id: 'beach_hat', groupRows: 2, groupCols: 1 };
  domV[2][1] = { id: 'beach_hat', isSlave: true, masterR: 1, masterC: 1 };
  domV[1][3] = { id: 'beach_hat', groupRows: 2, groupCols: 1 };
  domV[2][3] = { id: 'beach_hat', isSlave: true, masterR: 1, masterC: 3 };
  const av = clearMatchedGroups(domV, { r: 1, c: 1 }, { r: 1, c: 3 }, 'sweets');
  const vMasters: any[] = [];
  for (let r = 1; r <= ROWS; r++) for (let c = 1; c <= COLS; c++) if (av[r][c] && !av[r][c].isSlave) vMasters.push({ r, c, id: av[r][c].id });
  assert.equal(vMasters.length, 4);
};

const testBlockPiecesAndPcg = () => {
  const empty = Array.from({ length: 10 }, () => Array(10).fill(''));
  const pieces = getRandomPieces(3, empty, (p, r, c, b, o) => canPlace(p, r, c, b, o));
  assert.equal(pieces.length, 3);
  const shapeSet = new Set(pieces.map(shapeId));
  assert.equal(shapeSet.size, 3, 'Expected unique shape IDs in tray');
  pieces.forEach((p, i) => assert.equal(canFitSomewhere(p, empty), true, `Initial piece ${i} must fit on empty board`));

  const crowded = Array.from({ length: 10 }, () => Array(10).fill('x'));
  crowded[9][9] = '';
  const crowdedPieces = getRandomPieces(3, crowded, (p, r, c, b, o) => canPlace(p, r, c, b, o));
  assert.equal(crowdedPieces.some(p => canFitSomewhere(p, crowded)), true, 'At least one crowded-board piece should fit');

  for (const level of [21, 22, 35, 42]) {
    const a = generateProceduralLevel(level, 'normal', 'seed-A');
    const b = generateProceduralLevel(level, 'normal', 'seed-A');
    assert.deepEqual(a, b, `PCG must be deterministic at level ${level}`);
    const seen = new Set<string>();
    a.obstacles.forEach(o => {
      assert.ok(o.r >= 0 && o.r < 10 && o.c >= 0 && o.c < 10, `Obstacle out of range at L${level}`);
      const key = `${o.r}:${o.c}`;
      assert.equal(seen.has(key), false, `Duplicate obstacle position at L${level}`);
      seen.add(key);
    });

    const main = a.missions[0];
    if (main.type === 'destroy_wood' || main.type === 'destroy_ice' || main.type === 'destroy_gems') {
      const type = main.type === 'destroy_wood' ? 'wood' : main.type === 'destroy_ice' ? 'ice' : 'gem';
      const count = a.obstacles.filter(o => o.type === type).length;
      assert.ok(main.target <= count, `Destroy target exceeds actual obstacles for L${level}`);
    }

    let hasLanding = false;
    for (let r = 0; r <= 7; r++) {
      for (let c = 0; c <= 7; c++) {
        const clear = Array.from({ length: 3 }, (_, dr) => Array.from({ length: 3 }, (_, dc) => !seen.has(`${r + dr}:${c + dc}`))).flat().every(Boolean);
        if (clear) hasLanding = true;
      }
    }
    assert.equal(hasLanding, true, `Missing 3x3 landing area for L${level}`);
  }
};

const baseProfile = {
  playerName: 'Regression',
  statistics: {},
  processedRuns: [],
  highestLevel: 3,
  blockPuzzleLevel: 2,
  winStreak: 0,
};

const testRewardEngineAndMissions = () => {
  const onet = RewardEngine.processWin(clone(baseProfile), { game: 'onet', runId: 'r1', isWinner: true, score: 1000, highestCombo: 4, matches: 12, level: 1 });
  const block = RewardEngine.processWin(clone(baseProfile), { game: 'block', runId: 'r2', isWinner: true, score: 900, highestCombo: 2, linesCleared: 3, blocksCleared: 20, stars: 2, level: 2 });
  const mini = RewardEngine.processWin(clone(baseProfile), { game: 'memory', runId: 'r3', isWinner: true, score: 300, highestCombo: 1 });
  assert.ok(onet.rewardResult.xp >= 100, 'Onet win XP missing');
  assert.ok(block.rewardResult.xp >= 100, 'Block win XP missing');
  assert.ok(mini.rewardResult.xp >= 100, 'Minigame win XP missing');

  const loss = RewardEngine.processWin(clone(baseProfile), { game: 'onet', runId: 'r4', isWinner: false, score: 3800 });
  assert.equal(loss.rewardResult.xp <= 40, true, 'Loss XP must be bounded to <= 40');

  const first = RewardEngine.processWin(clone(baseProfile), { game: 'onet', runId: 'dup-run', isWinner: true, score: 500 });
  const second = RewardEngine.processWin(clone(first.profile), { game: 'onet', runId: 'dup-run', isWinner: true, score: 500 });
  assert.equal(getAccountXP(second.profile), getAccountXP(first.profile), 'Duplicate runId should not award XP again');

  const legacy = { statistics: { totalWins: 5 }, highestLevel: 4 } as any;
  const beforeLegacyXP = getAccountXP(legacy);
  const afterLegacy = RewardEngine.processWin(legacy, { game: 'onet', runId: 'legacy-1', isWinner: true, score: 200 });
  assert.ok(getAccountXP(afterLegacy.profile) > beforeLegacyXP, 'Legacy profile XP did not migrate/grow');

  const profileForClaim = {
    statistics: {},
    economy: { day: getTodayKey(), earned: DAILY_INCOME_CAP - 5 },
    dailyMissionsDate: getTodayKey(),
    activeMissions: [{ id: 'd_test', type: 'match', progress: 1, target: 1, claimed: false, rewardType: 'permen', rewardAmount: 5, difficulty: 'Mudah', title: 't', desc: 'd' }],
    activeWeeklyMissions: [],
  } as any;
  const c1 = claimMissionReward(profileForClaim, 'd_test');
  assert.equal(c1.error, null);
  const xp1 = getAccountXP(c1.profile);
  const c2 = claimMissionReward(c1.profile, 'd_test');
  assert.equal(c2.error, 'MISSION_ALREADY_CLAIMED');
  assert.equal(getAccountXP(c2.profile), xp1, 'Mission claim awarded XP more than once');

  const missions = generateDailyMissions({ highestLevel: 8 } as any);
  const categories = new Set(missions.map((m: any) => m.category));
  ['welcome', 'onet', 'block', 'skill', 'arcade'].forEach(cat => assert.equal(categories.has(cat), true, `Missing daily slot ${cat}`));

  const yesterday = new Date(Date.now() - 86400000);
  const yesterdayKey = getTodayKey(yesterday.getTime());
  const oldProfile = {
    highestLevel: 4,
    activeMissions: [{ id: 'd_old', progress: 1, target: 1, claimed: false, difficulty: 'Mudah', scope: 'daily' }],
    dailyMissionsDate: yesterdayKey,
    activeWeeklyMissions: [],
    weeklyMissionsWeek: '1999-W1',
  } as any;
  const refreshed = checkDailyMissions(oldProfile);
  assert.equal((refreshed.pendingMissions || []).some((m: any) => String(m.id).includes('d_old')), true, 'In-progress completed daily mission not preserved to pending');
};

const main = () => {
  console.log('Running consolidated regression checks...');
  testBoardHelpers();
  testSplitSemantics();
  testBlockPiecesAndPcg();
  testRewardEngineAndMissions();
  console.log('All consolidated regression checks passed.');
};

main();
