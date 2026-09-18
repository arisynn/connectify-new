import {
  generateBoard,
  findHint,
  clearMatchedGroups,
  countRemaining,
  guaranteedShuffle,
  groupSize,
} from '../src/core/board.js';
import { ROWS, COLS } from '../src/core/config.js';

const assert = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const seeded = (seed) => {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1000000) / 1000000;
  };
};

const summarizeGroups = (board) => {
  const masters = [];
  const slaveErrors = [];
  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      const t = board[r][c];
      if (!t) continue;
      if (t.isSlave) {
        const m = board[t.masterR]?.[t.masterC];
        if (!m || m.isSlave) slaveErrors.push(`${r},${c}`);
      } else {
        const { rows, cols } = groupSize(t);
        masters.push({ r, c, id: t.id, rows, cols });
      }
    }
  }
  return { masters, slaveErrors };
};

const hasShapePair = (masters, rows, cols) => {
  const list = masters.filter((m) => m.rows === rows && m.cols === cols);
  return list.length >= 2;
};

const checkBoard = (theme, level, rngSeed) => {
  const board = generateBoard(theme, level, seeded(rngSeed));
  assert(board.length === ROWS + 2, `Board rows mismatch for ${theme}/${level}`);
  assert(board[0].length === COLS + 2, `Board cols mismatch for ${theme}/${level}`);

  const { masters, slaveErrors } = summarizeGroups(board);
  assert(slaveErrors.length === 0, `Orphan slave cells found: ${slaveErrors.join(' | ')}`);

  const parity = new Map();
  for (const m of masters) {
    const key = `${m.id}|${m.rows}x${m.cols}`;
    parity.set(key, (parity.get(key) || 0) + 1);
  }
  for (const [k, n] of parity.entries()) {
    assert(n % 2 === 0, `Unpaired master group count for ${k}: ${n}`);
  }

  if (level >= 3 && level < 6) assert(hasShapePair(masters, 1, 2), 'Missing 1x2 pair at level 3+');
  if (level >= 6) assert(hasShapePair(masters, 2, 2), 'Missing 2x2 pair at level 6+');
  if (level >= 9) assert(hasShapePair(masters, 2, 1), 'Missing 2x1 pair at level 9+');

  const firstHint = findHint(board);
  assert(!!firstHint, `No initial hint for ${theme}/${level}`);
  if (firstHint) {
    const before = countRemaining(board);
    const b2 = clearMatchedGroups(board, firstHint.p1, firstHint.p2);
    const after = countRemaining(b2);
    assert(after < before, `clearMatchedGroups did not reduce tiles for ${theme}/${level}`);
  }

  return board;
};

const clearAllWithHints = (board) => {
  let b = board;
  let guard = 0;
  let freeShuffleCount = 0;
  while (countRemaining(b) > 0 && guard < 300) {
    guard += 1;
    const hint = findHint(b);
    if (!hint) {
      freeShuffleCount += 1;
      b = guaranteedShuffle(b);
      continue;
    }
    b = clearMatchedGroups(b, hint.p1, hint.p2);
  }
  assert(countRemaining(b) === 0, `Board not fully clearable, remaining=${countRemaining(b)}`);
  return freeShuffleCount;
};

try {
  const themes = ['ocean', 'forest', 'candy', 'space'];
  const levels = [1, 3, 6, 9, 12];
  for (const theme of themes) {
    for (const level of levels) checkBoard(theme, level, level * 971 + theme.length);
  }

  const stress = [];
  for (let i = 1; i <= 30; i++) {
    const board = checkBoard('ocean', 9 + (i % 5), i * 37);
    stress.push(clearAllWithHints(board));
  }
  console.log('Onet helper tests passed', { maxShuffleNeeded: Math.max(...stress) });
} catch (e) {
  console.error('Onet helper tests FAILED:', e.message);
  process.exit(1);
}
