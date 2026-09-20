import React, { RefObject, useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ROWS, COLS } from '../../core/config';
import { groupSize } from '../../core/board';
import { useTheme } from '../../core/theme/ThemeProvider';
import { TileBurst } from './TileBurst';
import { ArrowUp } from 'lucide-react';
import { useProfile } from '../../core/profile/ProfileContext';
import { equippedCosmetic } from '../../core/cosmetics';
import { cosmeticImage } from '../../core/artAssets';

interface Props {
  boardRef: RefObject<HTMLDivElement>; board: any[][]; selected: any; activePaths: any[];
  hintTiles: any; directionErrorTiles: any[]; matchingTiles: any[]; floatingTexts: any[];
  onTileClick: (r:number,c:number)=>void;
}
export const OnetBoard = ({boardRef,board,selected,activePaths,hintTiles,directionErrorTiles,matchingTiles,floatingTexts,onTileClick}:Props) => {
  const {activeTheme}=useTheme(),reduced=useReducedMotion();
  const {profile}=useProfile();
  const wrap=useRef<HTMLDivElement>(null),[width,setWidth]=useState(0);
  useLayoutEffect(()=>{
    if(!wrap.current)return;
    const observer=new ResizeObserver(([entry])=>{
      const {width:w,height:h}=entry.contentRect;
      setWidth(Math.max(0,Math.min(w,(h-(ROWS-1)*4)*COLS/ROWS+(COLS-1)*4)));
    });
    observer.observe(wrap.current);return()=>observer.disconnect();
  },[]);
  const size=(width-(COLS-1)*4)/COLS,step=size+4,height=size*ROWS+(ROWS-1)*4;
  const at=(p:any,r:number,c:number)=>p?.r===r&&p?.c===c;
  const point=({r,c}:any)=>({x:c===0?-12:c===COLS+1?width+12:(c-1)*step+size/2,y:r===0?-12:r===ROWS+1?height+12:(r-1)*step+size/2});
  const centers=matchingTiles.map(p=>{const tile=board[p.r]?.[p.c];const g=groupSize(tile);return {...p,tile,rows:g.rows,cols:g.cols,x:(p.c-1)*step+(g.cols*step-4)/2,y:(p.r-1)*step+(g.rows*step-4)/2};});
  return <div ref={wrap} className="onet-board-wrap" data-testid="onet-board-area">
    <div ref={boardRef} data-testid="onet-tile-grid" className="onet-grid" style={{width,height,gridTemplateColumns:`repeat(${COLS},minmax(0,1fr))`,gridTemplateRows:`repeat(${ROWS},minmax(0,1fr))`,visibility:width?'visible':'hidden'}}>
      {board.slice(1,ROWS+1).flatMap((row,ri)=>row.slice(1,COLS+1).map((tile,ci)=>{
        const r=ri+1,c=ci+1;
        if(!tile)return <div key={`empty-${r}-${c}`} data-testid={`onet-empty-${r}-${c}`} className="onet-cell empty" style={{gridRow:r,gridColumn:c}}/>;
        if(tile.isSlave)return null;
        const {rows,cols}=groupSize(tile),joined=rows*cols>1;
        const selectedHere=at(selected,r,c),hint=at(hintTiles?.p1,r,c)||at(hintTiles?.p2,r,c);
        const matching=matchingTiles.some(p=>at(p,r,c)),error=directionErrorTiles.some(p=>at(p,r,c));
        const cutVertical=rows*cols===4?tile.splitAxis==='vertical':cols>1;
        const skin=equippedCosmetic(profile,rows*cols===4?'tile4':joined?'tile2':'tile1');
        const arrowSkin=equippedCosmetic(profile,'arrow');
        return <motion.button key={`tile-${r}-${c}-${tile.splitAnimKey||tile.id}`}
          data-testid={`onet-tile-${r}-${c}`} data-tile-id={tile.id} data-master={`${r}-${c}`} data-group={`${cols}x${rows}`} data-split-depth={tile.splitDepth||0}
          aria-label={`${tile.id.replaceAll('_',' ')}, baris ${r}, kolom ${c}, ${cols} kali ${rows}`} aria-pressed={selectedHere}
          onClick={()=>onTileClick(r,c)} className={`onet-cell ${joined?'joined-unified':''} ${selectedHere?'selected':''} ${hint?'hinted':''} ${error?'invalid':''}`}
          data-open-side={tile.openSide||''} data-skin={skin?.id||'default'}
          style={{gridRow:`${r} / span ${rows}`,gridColumn:`${c} / span ${cols}`,backgroundImage:`url(${cosmeticImage(skin)})`,backgroundSize:'100% 100%'}}
          initial={tile.justSplit&&!reduced?{scale:.72,opacity:.3,x:(tile.splitFromX||0)*size*.3,y:(tile.splitFromY||0)*size*.3}:false}
          animate={{scale:matching?(joined?[1,1.06,.97]:[1,1.13,.2]):1,opacity:matching&&!joined?0:1,x:error&&!reduced?[0,-5,5,-3,0]:0,y:0}}
          transition={matching?{duration:reduced?.05:.42}:error?{duration:.3}:{type:'spring',stiffness:380,damping:20}}
          whileTap={{scale:.94}}>
          {matching&&joined&&!reduced ? [0,1].map(i=><motion.img key={i} src={activeTheme.assets.tiles[tile.id]} alt="" draggable={false} className="split-tile-half"
            style={{clipPath:cutVertical?(i?'inset(0 0 0 50%)':'inset(0 50% 0 0)'):(i?'inset(50% 0 0 0)':'inset(0 0 50% 0)')}}
            animate={{x:cutVertical?(i?9:-9):0,y:cutVertical?0:(i?9:-9),rotate:i?3:-3,opacity:[1,1,.1]}} transition={{duration:.46}}/>)
            : <img src={activeTheme.assets.tiles[tile.id]} alt="" draggable={false} className={`w-full h-full object-contain pointer-events-none ${joined?'p-2':'p-1'}`}/>}
          {tile.openSide&&<span data-testid={`onet-arrow-${r}-${c}`} data-skin={arrowSkin?.id} className="onet-arrow" style={{backgroundImage:`url(${cosmeticImage(arrowSkin)})`,backgroundSize:'100% 100%',transform:`rotate(${({up:0,right:90,down:180,left:270} as any)[tile.openSide]}deg)`}}><ArrowUp size={13}/></span>}
          {joined&&<span className="group-tag" data-testid={`onet-group-${r}-${c}`}>{cols}×{rows}</span>}
        </motion.button>;
      }))}
      {!!activePaths.length&&width>0&&<svg className="onet-path-layer" aria-hidden="true">
        {activePaths.map(item=>{const points=item.path.map(point),d=points.map((p:any,i:number)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');
          return <g key={item.id}><motion.path d={d} fill="none" stroke="white" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" initial={{pathLength:0}} animate={{pathLength:1,opacity:[1,1,0]}} transition={{duration:.47}}/>
            <motion.path d={d} fill="none" stroke={activeTheme.id==='candy'?'#e66e9a':'#35b8b0'} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" initial={{pathLength:0}} animate={{pathLength:1,opacity:[1,1,0]}} transition={{duration:.46}}/>
            {centers.map(p=><motion.rect key={`${p.r}-${p.c}`} x={(p.c-1)*step-2} y={(p.r-1)*step-2} width={p.cols*step} height={p.rows*step} rx={12} fill="none" stroke="#39b693" strokeWidth={3} initial={{opacity:1}} animate={{opacity:0}} transition={{duration:.46}}/>)}</g>;
        })}
      </svg>}
      {!reduced&&centers.map(p=><TileBurst key={`${p.r}-${p.c}-${activePaths[0]?.id}`} x={p.x} y={p.y} size={size} tileId={p.tile?.id||''} src={activeTheme.assets.tiles[p.tile?.id]} tier={p.rows*p.cols}/>)}
      {floatingTexts.map(t=><motion.div key={t.id} data-testid={`onet-combo-${t.id}`} className="onet-combo" initial={{y:8,opacity:0,scale:.8}} animate={{y:-22,opacity:[0,1,1,0],scale:1}} transition={{duration:.48}} style={{left:'50%',top:`${t.y}%`,translateX:'-50%'}}>{t.text}</motion.div>)}
    </div>
  </div>;
};