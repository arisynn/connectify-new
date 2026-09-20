import React from 'react';
import { cosmeticImage } from '../core/artAssets';

// The same lightweight sprite animation powers the store preview and gameplay.
export const GameParticles=({item,id,loop=false,count=8}:{item:any;id:string;loop?:boolean;count?:number})=>{
  if(!item)return null;
  return <span className={`game-particles motion-${item.motion||'drift'} ${loop?'loop':''}`} data-testid={id} data-animation={item.id} aria-hidden="true">
    {Array.from({length:count},(_,i)=>{const angle=i/count*Math.PI*2;return <img key={i} src={cosmeticImage(item)} alt="" style={{'--dx':`${Math.cos(angle)*42}px`,'--dy':`${Math.sin(angle)*38}px`,'--spin':`${i%2?130:-130}deg`,animationDelay:`${i*.012}s`} as React.CSSProperties}/>;})}
  </span>;
};