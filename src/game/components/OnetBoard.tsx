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
export const OnetBoard = ({boardRef,board,selected,activePaths,hintTiles,directionErrorTiles,matchingTiles,floatingTexts,onTileClick}:Props) => {
  const {activeTheme}=useTheme();
  const wrap=useRef<HTMLDivElement>(null),[width,setWidth]=useState<number>();
  useLayoutEffect(()=>{
    if(!wrap.current)return;
    const resize=new ResizeObserver(entries=>{const {width:w,height:h}=entries[0].contentRect;setWidth(Math.max(60,Math.min(w-42,(h-40)*COLS/ROWS-4)));});
    resize.observe(wrap.current);return()=>resize.disconnect();
  },[]);
  const at=(p:any,r:number,c:number)=>p?.r===r && p?.c===c;
  return <div ref={wrap} className="onet-board-wrap">
    <div ref={boardRef} className="onet-grid" data-testid="onet-tile-grid" style={{width,gridTemplateColumns:`repeat(${COLS},minmax(0,1fr))`}}>
      {board.slice(1,ROWS+1).flatMap((row,ri)=>row.slice(1,COLS+1).map((cell,ci)=>{
        const r=ri+1,c=ci+1;
        if(!cell) return <div key={`${r}-${c}`} data-testid={`onet-empty-${r}-${c}`} className="onet-cell empty"/>;
        const mr=cell.isSlave?cell.masterR:r,mc=cell.isSlave?cell.masterC:c,tile=board[mr][mc];
        const {rows,cols}=groupSize(tile), joined=rows*cols>1;
        const selectedHere=at(selected,mr,mc), hint=at(hintTiles?.p1,mr,mc)||at(hintTiles?.p2,mr,mc);
        const matching=matchingTiles.some(p=>at(p,mr,mc)), error=directionErrorTiles.some(p=>at(p,mr,mc));
        return <motion.button key={`${r}-${c}`} data-testid={`onet-tile-${r}-${c}`} data-tile-id={tile.id} data-master={`${mr}-${mc}`} data-group={`${rows}x${cols}`} aria-label={`${tile.id}, baris ${r}, kolom ${c}${joined?', kelompok gabungan':''}`} aria-pressed={selectedHere}
          onClick={()=>onTileClick(mr,mc)} className={`onet-cell ${joined?'joined':''} ${selectedHere?'selected':''} ${hint?'hinted':''} ${error?'invalid':''}`}
          animate={{opacity:matching?0:1,scale:matching?0.8:1}} transition={{duration:0.2,delay:matching?0.32:0}}>
          <img draggable={false} alt="" src={activeTheme.assets.tiles[tile.id]} style={{position:'absolute',maxWidth:'none',width:`calc(${cols*100}% + ${(cols-1)*4}px)`,height:`calc(${rows*100}% + ${(rows-1)*4}px)`,left:`calc(-${(c-mc)*100}% - ${(c-mc)*4}px)`,top:`calc(-${(r-mr)*100}% - ${(r-mr)*4}px)`,objectFit:'contain',padding:joined?'10px':'4px'}}/>
          {joined && r===mr && c===mc && <span className="group-tag" data-testid={`onet-group-${mr}-${mc}`}>{cols}×{rows}</span>}
        </motion.button>;
      }))}
      <svg className="onet-path-layer" viewBox={`0 0 ${COLS*100} ${ROWS*100}`} preserveAspectRatio="none" aria-hidden="true">
        {activePaths.map(p=><polyline key={p.id} points={p.path.map((q:any)=>`${(q.c-.5)*100},${(q.r-.5)*100}`).join(' ')} fill="none" stroke="#39c6c8" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>) }
      </svg>
      {floatingTexts.map(t=><motion.div key={t.id} data-testid={`onet-combo-${t.id}`} className="onet-combo" initial={{y:0,opacity:1}} animate={{y:-30,opacity:0}} style={{left:`${t.x}%`,top:`${t.y}%`}}>{t.text}</motion.div>)}
    </div>
  </div>;
};