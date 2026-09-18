import { ROWS, COLS } from './config.js';
import { getTileVarietyCount } from './difficulty.js';
import { tileIdsFor } from './tileCatalog.js';

export const groupSize = tile => ({ rows: tile?.groupRows || (tile?.isSplit && tile.splitOrientation === 'vertical' ? 2 : 1), cols: tile?.groupCols || (tile?.isSplit && tile.splitOrientation === 'horizontal' ? 2 : 1) });
export const getTileCells = (r, c, tile) => {
  const { rows, cols } = groupSize(tile);
  return Array.from({ length: rows * cols }, (_, i) => ({ r: r + Math.floor(i / cols), c: c + i % cols }));
};
const sameShape = (a,b) => groupSize(a).rows === groupSize(b).rows && groupSize(a).cols === groupSize(b).cols;
export const canMatch = (a,b) => !!a && !!b && !a.isSlave && !b.isSlave && a.id === b.id && sameShape(a,b);
const shuffle = (items, rng = Math.random) => {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i+1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
};
export const getPath = (board, r1, c1, r2, c2, ignoredTiles = []) => {
  const a = board?.[r1]?.[c1], b = board?.[r2]?.[c2];
  if (!canMatch(a,b) || (r1 === r2 && c1 === c2)) return null;
  const starts = getTileCells(r1,c1,a), ends = getTileCells(r2,c2,b);
  const endpoint = new Set(ends.map(p => `${p.r},${p.c}`));
  const allowed = new Set([...starts,...ends,...ignoredTiles.flatMap(p => getTileCells(p.r,p.c,board[p.r][p.c]))].map(p => `${p.r},${p.c}`));
  const dirs = [[-1,0,'up','down'],[0,1,'right','left'],[1,0,'down','up'],[0,-1,'left','right']];
  for (const start of starts) {
    const queue = [{...start, dir:-1, turns:0, points:[start]}], seen = new Map();
    for (let index = 0; index < queue.length; index++) {
      const cur = queue[index];
      for (let dir=0; dir<4; dir++) {
        const [dr,dc,name,opposite] = dirs[dir];
        if (cur.dir === -1 && a.openSide && a.openSide !== name) continue;
        const turns = cur.turns + (cur.dir !== -1 && cur.dir !== dir ? 1 : 0);
        if (turns > 2) continue;
        const r=cur.r+dr, c=cur.c+dc;
        if (r<0 || c<0 || r>=board.length || c>=board[0].length || (board[r][c] !== 0 && !allowed.has(`${r},${c}`))) continue;
        const points = cur.dir === dir ? [...cur.points.slice(0,-1),{r,c}] : [...cur.points,{r,c}];
        if (endpoint.has(`${r},${c}`) && (!b.openSide || b.openSide === opposite)) return {path: points};
        const key = `${r},${c},${dir}`;
        if ((seen.get(key) ?? 3) <= turns) continue;
        seen.set(key,turns); queue.push({r,c,dir,turns,points});
      }
    }
  }
  return { error:'NO_PATH' };
};
export const findHint = board => {
  const tiles=[];
  for (let r=1;r<=ROWS;r++) for(let c=1;c<=COLS;c++) if(board[r][c] && !board[r][c].isSlave) tiles.push({r,c});
  for(let i=0;i<tiles.length;i++) for(let j=i+1;j<tiles.length;j++) {
    const a=tiles[i],b=tiles[j];
    if(!canMatch(board[a.r][a.c],board[b.r][b.c])) continue;
    const result=getPath(board,a.r,a.c,b.r,b.c);
    if(result?.path) return {p1:a,p2:b,path:result.path};
  }
  return null;
};
export const countRemaining = board => board?.flat().filter(Boolean).length || 0;
export const getMatchAction = (board, a, b) => {
  const tileA = board?.[a?.r]?.[a?.c];
  if (!tileA) return 'clear';
  const { rows, cols } = groupSize(tileA);
  if (rows === 2 && cols === 2) return 'split_to_1x2';
  if ((rows === 1 && cols === 2) || (rows === 2 && cols === 1)) return 'split_to_1x1';
  return 'clear';
};

export const clearMatchedGroups = (board, a, b) => {
  const next = board.map(row => [...row]);
  const tileA = board[a.r]?.[a.c];
  const tileB = board[b.r]?.[b.c];
  if (!tileA || !tileB) return next;

  const { rows, cols } = groupSize(tileA);

  // 1. Tile 2x2 split: masing-masing 2x2 terbelah menjadi dua buah tile 1x2 horizontal!
  if (rows === 2 && cols === 2) {
    for (const p of [a, b]) {
      const origId = board[p.r][p.c].id;
      const animBase = Date.now() + Math.random();
      // Tile 1x2 atas (baris p.r, kolom p.c dan p.c+1)
      next[p.r][p.c] = {
        id: origId,
        groupRows: 1,
        groupCols: 2,
        isSplit: true,
        splitOrientation: 'horizontal',
        openSide: null,
        splitAnimKey: animBase,
        justSplit: true,
      };
      next[p.r][p.c + 1] = {
        id: origId,
        isSlave: true,
        masterR: p.r,
        masterC: p.c,
      };

      // Tile 1x2 bawah (baris p.r+1, kolom p.c dan p.c+1)
      next[p.r + 1][p.c] = {
        id: origId,
        groupRows: 1,
        groupCols: 2,
        isSplit: true,
        splitOrientation: 'horizontal',
        openSide: null,
        splitAnimKey: animBase + 1,
        justSplit: true,
      };
      next[p.r + 1][p.c + 1] = {
        id: origId,
        isSlave: true,
        masterR: p.r + 1,
        masterC: p.c,
      };
    }
    return next;
  }

  // 2. Tile 1x2 horizontal split: terbelah menjadi dua buah tile 1x1!
  if (rows === 1 && cols === 2) {
    for (const p of [a, b]) {
      const origId = board[p.r][p.c].id;
      const animBase = Date.now() + Math.random();
      next[p.r][p.c] = {
        id: origId,
        groupRows: 1,
        groupCols: 1,
        isSplit: false,
        openSide: null,
        splitAnimKey: animBase,
        justSplit: true,
      };
      next[p.r][p.c + 1] = {
        id: origId,
        groupRows: 1,
        groupCols: 1,
        isSplit: false,
        openSide: null,
        splitAnimKey: animBase + 1,
        justSplit: true,
      };
    }
    return next;
  }

  // 3. Tile 2x1 vertikal split: terbelah menjadi dua buah tile 1x1!
  if (rows === 2 && cols === 1) {
    for (const p of [a, b]) {
      const origId = board[p.r][p.c].id;
      const animBase = Date.now() + Math.random();
      next[p.r][p.c] = {
        id: origId,
        groupRows: 1,
        groupCols: 1,
        isSplit: false,
        openSide: null,
        splitAnimKey: animBase,
        justSplit: true,
      };
      next[p.r + 1][p.c] = {
        id: origId,
        groupRows: 1,
        groupCols: 1,
        isSplit: false,
        openSide: null,
        splitAnimKey: animBase + 1,
        justSplit: true,
      };
    }
    return next;
  }

  // 4. Tile 1x1 biasa: hilangkan kedua tile (sel diatur ke 0)
  for (const p of [a, b]) {
    for (const cell of getTileCells(p.r, p.c, board[p.r][p.c])) {
      next[cell.r][cell.c] = 0;
    }
  }
  return next;
};

export const generateBoard = (themeKey, level = 1, rng = Math.random) => {
  const board=Array.from({length:ROWS+2},()=>Array(COLS+2).fill(0));
  const ids=shuffle(tileIdsFor(themeKey),rng).slice(0,getTileVarietyCount(level,tileIdsFor(themeKey).length));
  const placeGroup=(r,c,id,rows,cols) => {
    const tile={id,groupRows:rows,groupCols:cols,isSplit:rows*cols>1,openSide:null};
    for(const cell of getTileCells(r,c,tile)) board[cell.r][cell.c]=cell.r===r && cell.c===c ? tile : {id,isSlave:true,masterR:r,masterC:c};
  };
  // Reserve paired adjacent footprints first; placing both is atomic, never an orphan group.
  if(level>=2) {
    const is2x2 = level >= 3;
    const r = level >= 4 ? 4 : 2;
    const rows = is2x2 ? 2 : 1;
    placeGroup(r, 1, ids[0], rows, 2);
    placeGroup(r, 4, ids[0], rows, 2);
  }
  if(level>=7) {
    placeGroup(7, 2, ids[1], 1, 2);
    placeGroup(7, 4, ids[1], 1, 2);
  }
  const positions=[];
  for(let r=1;r<=ROWS;r++) for(let c=1;c<=COLS;c++) if(!board[r][c]) positions.push({r,c});
  const tiles=[];
  for(let i=0;i<positions.length/2;i++) {const id=ids[i%ids.length];tiles.push({id,openSide:null},{id,openSide:null});}
  const mixed=shuffle(tiles,rng);
  positions.forEach((p,i)=>board[p.r][p.c]=mixed[i]);
  return findHint(board) ? board : guaranteedShuffle(board);
};
export const placeTilesSmartly = (tiles, currentBoard, positions) => {
  const b=currentBoard ? currentBoard.map(row=>[...row]) : Array.from({length:ROWS+2},()=>Array(COLS+2).fill(0));
  const pos=positions || Array.from({length:ROWS*COLS},(_,i)=>({r:Math.floor(i/COLS)+1,c:i%COLS+1}));
  shuffle(tiles).forEach((tile,i)=>{if(pos[i]) b[pos[i].r][pos[i].c]=tile;});
  return guaranteedShuffle(b);
};
export const guaranteedShuffle = currentBoard => {
  let board=currentBoard.map(row=>row.map(t=>t ? {...t,openSide:null} : 0));
  const pos=[];
  for(let r=1;r<=ROWS;r++) for(let c=1;c<=COLS;c++) if(board[r][c] && !board[r][c].isSlave && !board[r][c].isSplit) pos.push({r,c});
  const tiles=pos.map(p=>board[p.r][p.c]);
  for(let attempt=0;attempt<20;attempt++) {
    const mixed=shuffle(tiles);pos.forEach((p,i)=>board[p.r][p.c]=mixed[i]);
    if(findHint(board) || !countRemaining(board)) return board;
  }
  // Pathologically blocked footprints: dissolve groups into paired unit tiles, preserving every cell.
  const all=[];
  for(let r=1;r<=ROWS;r++) for(let c=1;c<=COLS;c++) if(board[r][c]) all.push({r,c});
  const counts={};for(const p of all) counts[board[p.r][p.c].id]=(counts[board[p.r][p.c].id]||0)+1;
  const pairs=Object.entries(counts).flatMap(([id,n])=>Array(Math.floor(n/2)).fill(id));
  let simulation=board.map(row=>row.map(t=>t?{id:'path-probe',openSide:null}:0));
  for(const id of pairs){
    const hint=findHint(simulation);if(!hint)break;
    for(const p of [hint.p1,hint.p2])board[p.r][p.c]={id,openSide:null};
    simulation=clearMatchedGroups(simulation,hint.p1,hint.p2);
  }
  return board;
};