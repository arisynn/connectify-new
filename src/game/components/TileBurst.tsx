import React from 'react';
import { motion } from 'motion/react';
import { useProfile } from '../../core/profile/ProfileContext';
import { equippedCosmetic } from '../../core/cosmetics';
import { GameParticles } from '../../components/GameParticles';

// A small deterministic effect budget: 8 themed particles and 4 image shards, not a canvas loop.
export const TileBurst=({x,y,size,tileId,src,tier}:{x:number,y:number,size:number,tileId:string,src:string,tier:number})=>{
  const {profile}=useProfile(),animation=equippedCosmetic(profile,'onetAnimation');
  const seed=[...tileId].reduce((n,c)=>n+c.charCodeAt(0),0);
  const colors=tileId.startsWith('ocean')?['#5acde6','#9be7ff','#74a7ed']:tileId.startsWith('forest')?['#74c995','#ffd783','#bfdc84']:tileId.startsWith('space')?['#8fbaff','#ffd783','#e5acde']:['#f59bb5','#ffd783','#71d1b2'];
  return <div className="tile-burst" style={{left:x,top:y}} aria-hidden="true">
    <motion.i className="burst-ring" style={{borderColor:colors[seed%3]}} initial={{scale:.2,opacity:.8}} animate={{scale:tier>1?2:1.4,opacity:0}} transition={{duration:.45}}/>
    {animation?<GameParticles item={animation} id={`onet-match-animation-${Math.round(x)}-${Math.round(y)}`}/>:Array.from({length:8},(_,i)=>{
      const angle=(i/8)*Math.PI*2+(seed%5)*.2,distance=size*(.38+(i%3)*.12);
      return <motion.i key={i} className={`burst-particle burst-shape-${(seed+i)%4}`} style={{background:colors[i%3]}}
        initial={{x:0,y:0,scale:0,opacity:1}} animate={{x:Math.cos(angle)*distance,y:Math.sin(angle)*distance+9,scale:[0,1,0],rotate:(i%2?1:-1)*120,opacity:[1,1,0]}} transition={{duration:.47,delay:(i%2)*.02}}/>;
    })}
    {tier===1&&Array.from({length:4},(_,i)=><motion.div key={`shard-${i}`} className="image-shard" style={{width:size,height:size,marginLeft:-size/2,marginTop:-size/2,clipPath:['polygon(0 0,50% 0,65% 45%,0 60%)','polygon(50% 0,100% 0,100% 55%,65% 45%)','polygon(0 60%,65% 45%,45% 100%,0 100%)','polygon(65% 45%,100% 55%,100% 100%,45% 100%)'][i]}}
      initial={{opacity:.9,scale:.9}} animate={{x:(i%2?1:-1)*size*.3,y:(i<2?-1:1)*size*.3,opacity:0,rotate:(i%2?1:-1)*22,scale:.4}} transition={{duration:.44}}><img src={src} alt=""/></motion.div>)}
  </div>;
};