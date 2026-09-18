import React, { RefObject, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ROWS, COLS } from '../../core/config';
import { groupSize } from '../../core/board';
import { useTheme } from '../../core/theme/ThemeProvider';

interface Props {
  boardRef: RefObject<HTMLDivElement>; board: any[][]; selected: any; activePaths: any[];
  hintTiles: any; directionErrorTiles: any[]; matchingTiles: any[]; floatingTexts: any[];
  onTileClick: (r:number,c:number)=>void;
}

const getStartSide = (dx: number, dy: number): string => {
  if (dx > 0) return 'right';
  if (dx < 0) return 'left';
  if (dy > 0) return 'bottom';
  if (dy < 0) return 'top';
  return 'top';
};

const generateRingPath = (size: number, r: number, startSide: string): string => {
  const half = size / 2;
  const top = -half;
  const bottom = half;
  const left = -half;
  const right = half;
  let d = '';

  if (startSide === 'top') {
    d += `M 0 ${top} L ${right - r} ${top} Q ${right} ${top} ${right} ${top + r} L ${right} ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} L ${left + r} ${bottom} Q ${left} ${bottom} ${left} ${bottom - r} L ${left} ${top + r} Q ${left} ${top} ${left + r} ${top} Z`;
  } else if (startSide === 'right') {
    d += `M ${right} 0 L ${right} ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} L ${left + r} ${bottom} Q ${left} ${bottom} ${left} ${bottom - r} L ${left} ${top + r} Q ${left} ${top} ${left + r} ${top} L ${right - r} ${top} Q ${right} ${top} ${right} ${top + r} Z`;
  } else if (startSide === 'bottom') {
    d += `M 0 ${bottom} L ${left + r} ${bottom} Q ${left} ${bottom} ${left} ${bottom - r} L ${left} ${top + r} Q ${left} ${top} ${left + r} ${top} L ${right - r} ${top} Q ${right} ${top} ${right} ${top + r} L ${right} ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} Z`;
  } else if (startSide === 'left') {
    d += `M ${left} 0 L ${left} ${top + r} Q ${left} ${top} ${left + r} ${top} L ${right - r} ${top} Q ${right} ${top} ${right} ${top + r} L ${right} ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} L ${left + r} ${bottom} Q ${left} ${bottom} ${left} ${bottom - r} Z`;
  } else {
    d += `M 0 ${top} L ${right - r} ${top} Q ${right} ${top} ${right} ${top + r} L ${right} ${bottom - r} Q ${right} ${bottom} ${right - r} ${bottom} L ${left + r} ${bottom} Q ${left} ${bottom} ${left} ${bottom - r} L ${left} ${top + r} Q ${left} ${top} ${left + r} ${top} Z`;
  }
  return d;
};

const generateRoundedPath = (points: { x: number; y: number }[], radius: number): string => {
  if (points.length < 2) return '';
  let d = `M ${points[0].x} ${points[0].y} `;

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const next = points[i + 1];

    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const len1 = Math.hypot(dx1, dy1);

    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len2 = Math.hypot(dx2, dy2);

    const r = Math.min(radius, len1 / 2, len2 / 2);

    const p1x = curr.x - (dx1 / len1) * r;
    const p1y = curr.y - (dy1 / len1) * r;

    const p2x = curr.x + (dx2 / len2) * r;
    const p2y = curr.y + (dy2 / len2) * r;

    d += `L ${p1x} ${p1y} Q ${curr.x} ${curr.y} ${p2x} ${p2y} `;
  }

  const last = points[points.length - 1];
  d += `L ${last.x} ${last.y}`;
  return d;
};

export const OnetBoard = ({boardRef,board,selected,activePaths,hintTiles,directionErrorTiles,matchingTiles,floatingTexts,onTileClick}:Props) => {
  const {activeTheme}=useTheme();
  const wrap=useRef<HTMLDivElement>(null),[width,setWidth]=useState<number>();
  const [boardSize, setBoardSize] = useState({ w: 0, h: 0 });

  useLayoutEffect(()=>{
    if(!wrap.current)return;
    const resize=new ResizeObserver(entries=>{const {width:w,height:h}=entries[0].contentRect;setWidth(Math.max(60,Math.min(w-42,(h-40)*COLS/ROWS-4)));});
    resize.observe(wrap.current);return()=>resize.disconnect();
  },[]);

  useLayoutEffect(()=>{
    if(!boardRef.current)return;
    setBoardSize({ w: boardRef.current.clientWidth, h: boardRef.current.clientHeight });
    const resize=new ResizeObserver(entries=>{
      for(const entry of entries){
        setBoardSize({ w: entry.contentRect.width, h: entry.contentRect.height });
      }
    });
    resize.observe(boardRef.current);
    return()=>resize.disconnect();
  },[boardRef]);

  const gap = 4;
  const tileSize = boardSize.w > 0 ? (boardSize.w - (COLS - 1) * gap) / COLS : 0;
  const lineWidth = Math.max(4, Math.min(7, tileSize * 0.10));
  const ringOffset = 2;
  const ringSize = tileSize + 2 * ringOffset;
  const cutDist = ringSize / 2;
  const ringRadius = Math.max(8, 3 + ringOffset);
  const offset = gap + lineWidth / 2 + 5;
  const cornerRadius = Math.max(10, lineWidth * 1.5);

  const getPoint = (r: number, c: number) => {
    let x = 0;
    let y = 0;
    if (c <= 0) x = -offset;
    else if (c > COLS) x = boardSize.w + offset;
    else x = (c - 1) * (tileSize + gap) + tileSize / 2;

    if (r <= 0) y = -offset;
    else if (r > ROWS) y = boardSize.h + offset;
    else y = (r - 1) * (tileSize + gap) + tileSize / 2;

    return { x, y };
  };

  const gridHeight = width ? Math.round(((width - (COLS - 1) * gap) / COLS) * ROWS + (ROWS - 1) * gap) : undefined;
  const at=(p:any,r:number,c:number)=>p?.r===r && p?.c===c;
  return <div ref={wrap} className="onet-board-wrap">
    <div
      ref={boardRef}
      className="onet-grid"
      data-testid="onet-tile-grid"
      style={{
        width,
        height: gridHeight,
        gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
        gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
      }}
    >
      {board.slice(1, ROWS + 1).flatMap((row, ri) => row.slice(1, COLS + 1).map((cell, ci) => {
        const r = ri + 1, c = ci + 1;
        if (!cell) {
          return (
            <div
              key={`empty-${r}-${c}`}
              data-testid={`onet-empty-${r}-${c}`}
              className="onet-cell empty"
              style={{
                gridRow: `${r} / span 1`,
                gridColumn: `${c} / span 1`,
              }}
            />
          );
        }
        // Slave cell: dikonsolidasikan langsung oleh master button yang membentang multi-cell
        if (cell.isSlave) return null;

        const tile = cell;
        const { rows, cols } = groupSize(tile);
        const joined = rows * cols > 1;
        const selectedHere = at(selected, r, c);
        const hint = at(hintTiles?.p1, r, c) || at(hintTiles?.p2, r, c);
        const matching = matchingTiles.some(p => at(p, r, c));
        const error = directionErrorTiles.some(p => at(p, r, c));

        return (
          <motion.button
            key={`tile-${r}-${c}-${tile.splitAnimKey || ''}`}
            data-testid={`onet-tile-${r}-${c}`}
            data-tile-id={tile.id}
            data-master={`${r}-${c}`}
            data-group={`${cols}x${rows}`}
            aria-label={`${tile.id}, baris ${r}, kolom ${c}${joined ? `, tile gabungan ${cols}x${rows}` : ''}`}
            aria-pressed={selectedHere}
            onClick={() => onTileClick(r, c)}
            className={`onet-cell ${joined ? 'joined-unified' : ''} ${selectedHere ? 'selected' : ''} ${hint ? 'hinted' : ''} ${error ? 'invalid' : ''}`}
            style={{
              gridRow: `${r} / span ${rows}`,
              gridColumn: `${c} / span ${cols}`,
            }}
            initial={tile.justSplit ? { scale: 0.8, opacity: 0.7 } : false}
            whileTap={{ scale: 0.95 }}
            animate={{
              scale: matching ? (joined ? [1, 1.08, 0.95, 1] : [1, 1.15, 0]) : 1,
              opacity: hint ? [1, 0.6, 1] : (matching && !joined) ? [1, 1, 0] : 1,
              rotate: matching ? (joined ? [0, -3, 3, -2, 2, 0] : [0, -5, 5, 0]) : 0,
              y: matching ? -4 : 0,
              x: error ? [0, -12, 12, -10, 10, -6, 6, 0] : 0,
            }}
            transition={
              matching ? { duration: 0.35, ease: "easeInOut" } :
              error ? { duration: 0.4, ease: "linear" } :
              hint ? { repeat: Infinity, duration: 1 } :
              { type: 'spring', stiffness: 400, damping: 25 }
            }
          >
            {/* Gambar utuh menyatu, proporsional, tanpa garis potongan */}
            <img
              draggable={false}
              alt=""
              src={activeTheme.assets.tiles[tile.id]}
              className={`w-full h-full object-contain pointer-events-none select-none ${
                rows === 2 && cols === 2
                  ? 'p-2.5 sm:p-3'
                  : joined
                  ? 'p-1.5 sm:p-2'
                  : 'p-1 sm:p-1.5'
              }`}
            />
            {joined && (
              <span className="group-tag" data-testid={`onet-group-${r}-${c}`}>
                {cols}×{rows}
              </span>
            )}
          </motion.button>
        );
      }))}

      {/* SVG Connect Animation Layer */}
      {activePaths && activePaths.length > 0 && boardSize.w > 0 && (
        <svg 
          className="onet-path-layer" 
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10, overflow: 'visible' }}
          aria-hidden="true"
        >
          {activePaths.map(pathObj => {
            const pts = pathObj.path.map((p: any) => getPoint(p.r, p.c));
            let drawLine = true;
            let lineD = '';
            let startSideA = 'top';
            let startSideB = 'top';

            if (pts.length >= 2) {
              const P0 = pts[0];
              const P1 = pts[1];
              const dxA = P1.x - P0.x;
              const dyA = P1.y - P0.y;
              startSideA = getStartSide(dxA, dyA);
              const ux = Math.sign(dxA);
              const uy = Math.sign(dyA);
              const P0_new = { x: P0.x + cutDist * ux, y: P0.y + cutDist * uy };

              const Pn = pts[pts.length - 1];
              const Pn_prev = pts[pts.length - 2];
              const dxB = Pn_prev.x - Pn.x;
              const dyB = Pn_prev.y - Pn.y;
              startSideB = getStartSide(dxB, dyB);
              const vx = Math.sign(dxB);
              const vy = Math.sign(dyB);
              const Pn_new = { x: Pn.x + cutDist * vx, y: Pn.y + cutDist * vy };

              if (pts.length === 2) {
                const dist = Math.hypot(P1.x - P0.x, P1.y - P0.y);
                if (dist <= 2 * cutDist + 1) {
                  drawLine = false;
                }
              }

              if (drawLine) {
                const linePts = [...pts];
                linePts[0] = P0_new;
                linePts[linePts.length - 1] = Pn_new;
                lineD = generateRoundedPath(linePts, cornerRadius);
              }
            }

            const ringA_D = generateRingPath(ringSize, ringRadius, startSideA);
            const ringB_D = generateRingPath(ringSize, ringRadius, startSideB);
            const P0 = pts[0];
            const Pn = pts[pts.length - 1];

            return (
              <g key={pathObj.id}>
                {/* Ring A */}
                <motion.g
                  style={{ x: P0.x, y: P0.y }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: [1, 1, 1.08], opacity: [1, 1, 0] }}
                  transition={{ 
                    scale: { times: [0, 0.655, 1], duration: 0.58, ease: "easeInOut" },
                    opacity: { times: [0, 0.655, 1], duration: 0.58, ease: "linear" }
                  }}
                >
                  <motion.path
                    d={ringA_D}
                    fill="none"
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={lineWidth + 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                  <motion.path
                    d={ringA_D}
                    fill="none"
                    stroke="#1E88E5"
                    strokeWidth={lineWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </motion.g>

                {/* Ring B */}
                <motion.g
                  style={{ x: Pn.x, y: Pn.y }}
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: [1, 1, 1.08], opacity: [1, 1, 0] }}
                  transition={{ 
                    scale: { times: [0, 0.655, 1], duration: 0.58, ease: "easeInOut" },
                    opacity: { times: [0, 0.655, 1], duration: 0.58, ease: "linear" }
                  }}
                >
                  <motion.path
                    d={ringB_D}
                    fill="none"
                    stroke="rgba(255,255,255,0.85)"
                    strokeWidth={lineWidth + 4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.28, duration: 0.1, ease: "linear" }}
                  />
                  <motion.path
                    d={ringB_D}
                    fill="none"
                    stroke="#1E88E5"
                    strokeWidth={lineWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.28, duration: 0.1, ease: "linear" }}
                  />
                </motion.g>

                {/* Main Connection Line */}
                {drawLine && (
                  <motion.g
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ delay: 0.38, duration: 0.2, ease: "linear" }}
                  >
                    <motion.path 
                      d={lineD}
                      fill="none"
                      stroke="rgba(255,255,255,0.85)"
                      strokeWidth={lineWidth + 4}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.1, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    />
                    <motion.path 
                      d={lineD}
                      fill="none"
                      stroke="#1E88E5"
                      strokeWidth={lineWidth}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ delay: 0.1, duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </motion.g>
                )}
              </g>
            );
          })}
        </svg>
      )}

      {floatingTexts.map(t=><motion.div key={t.id} data-testid={`onet-combo-${t.id}`} className="onet-combo" initial={{y:0,opacity:1}} animate={{y:-30,opacity:0}} style={{left:`${t.x}%`,top:`${t.y}%`}}>{t.text}</motion.div>)}
    </div>
  </div>;
};