import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowUpRight, Candy, Layers, Grid3X3, Gamepad2, Zap, Gift } from 'lucide-react';
import { missionXP } from '../core/progression';
const category=(type:string)=>type==='blockLines'?{name:'BLOCK PUZZLE',icon:Grid3X3,color:'sky'}:['match','split','survivor','fast_clear'].includes(type)?{name:'ONET',icon:Layers,color:'pink'}:type==='minigame'?{name:'MINI GAME',icon:Gamepad2,color:'butter'}:{name:'KLUB',icon:Zap,color:'mint'};
export const MissionCard=({mission:m,index,busy,onClaim,onPlay}:{mission:any,index:number,busy:boolean,onClaim:()=>void,onPlay:()=>void})=>{
  const progress=Math.min(m.progress||0,m.target),done=progress>=m.target,meta=category(m.type);
  return <motion.article data-testid={`mission-card-${m.id}`} className={`quest-card ${m.claimed?'claimed':''} ${done&&!m.claimed?'ready':''}`} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:Math.min(index*.035,.2)}}>
    <div className={`quest-icon ${meta.color}`} aria-hidden="true"><meta.icon size={22}/></div><div className="quest-copy"><span className="quest-category" data-testid={`mission-category-${m.id}`}>{meta.name} <i/> {m.difficulty}</span><h3 data-testid={`mission-title-${m.id}`}>{m.title}</h3><p data-testid={`mission-description-${m.id}`}>{m.desc}</p></div>
    <div className="quest-rewards" data-testid={`mission-rewards-${m.id}`}><span><Candy size={14}/>+{m.rewardAmount}</span><span>+{missionXP(m)} XP</span></div>
    <div className="quest-bottom"><div className="quest-progress"><span data-testid={`mission-progress-${m.id}`}>{progress.toLocaleString('id-ID')} / {m.target.toLocaleString('id-ID')}</span><div role="progressbar" aria-label={m.title} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={m.target} data-testid={`mission-bar-${m.id}`}><i style={{width:`${progress/m.target*100}%`}}/></div></div>
      {m.claimed?<span className="quest-claimed" data-testid={`mission-claimed-${m.id}`}><Check size={16}/>Diklaim</span>:done?<button className="quest-action mint" data-testid={`mission-claim-${m.id}`} disabled={busy} onClick={onClaim}><Gift size={15}/>{busy?'Sebentar…':'Klaim'}</button>:<span className="quest-claimed" data-testid={`mission-in-progress-${m.id}`}>Berjalan</span>}
    </div>
  </motion.article>;
};