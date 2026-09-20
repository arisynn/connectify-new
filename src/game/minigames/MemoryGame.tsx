import React,{useEffect,useRef,useState} from 'react';
import {Check,Flame} from 'lucide-react';
import {useTheme} from '../../core/theme/ThemeProvider';
import {useAudio} from '../../core/audio/AudioEngine';
import {useProfile} from '../../core/profile/ProfileContext';
import {equippedCosmetic} from '../../core/cosmetics';
import {cosmeticImage} from '../../core/artAssets';
import {DynamicIcon} from '../../components/theme/DynamicIcon';
import {GameParticles} from '../../components/GameParticles';
import {PuzzleGameFrame} from '../components/PuzzleGameFrame';
import {randomize,useMiniRound} from './useMiniRound';
const DIFFICULTIES=[{id:'relaxed',name:'Santai',pairs:6,time:75},{id:'classic',name:'Klasik',pairs:8,time:90},{id:'focus',name:'Fokus',pairs:12,time:120}];
const Round=({difficulty,onDifficulty,onRestart}:any)=>{
  const {activeTheme}=useTheme(),audio=useAudio(),{profile}=useProfile();
  const keys=Object.keys(activeTheme.assets.tiles),config=DIFFICULTIES.find(d=>d.id===difficulty)!,pairs=Math.min(config.pairs,keys.length);
  const [peeking,setPeeking]=useState(false),round=useMiniRound('memory',config.time,peeking);
  const [cards]=useState(()=>{const types=randomize(keys).slice(0,pairs);return randomize([...types,...types]);});
  const [open,setOpen]=useState<number[]>([]),[matched,setMatched]=useState<number[]>([]),[moves,setMoves]=useState(0),[streak,setStreak]=useState(0),[bestStreak,setBestStreak]=useState(0),[points,setPoints]=useState(0),[justMatched,setJustMatched]=useState<number[]>([]);
  const busy=useRef(false),timeout=useRef<ReturnType<typeof setTimeout>>(),back=equippedCosmetic(profile,'memoryCard'),animation=equippedCosmetic(profile,'memoryAnimation');
  useEffect(()=>()=>clearTimeout(timeout.current),[]);
  useEffect(()=>{if(!peeking)return;const t=setTimeout(()=>setPeeking(false),2300);return()=>clearTimeout(t);},[peeking]);
  useEffect(()=>{if(!justMatched.length)return;const t=setTimeout(()=>setJustMatched([]),600);return()=>clearTimeout(t);},[justMatched]);
  const score=points+(matched.length===pairs*2?round.time*5:0);
  useEffect(()=>{if(matched.length===pairs*2)round.finish(true,score,pairs,moves-pairs,bestStreak);else if(round.time===0)round.finish(false,score,matched.length/2,moves-matched.length/2,bestStreak);},[matched.length,round.time]);
  const flip=(i:number)=>{
    if(round.phase!=='playing'||round.paused||peeking||busy.current||matched.includes(i)||open.includes(i))return;
    audio.playUiClick();const next=[...open,i];setOpen(next);
    if(next.length===2){setMoves(n=>n+1);busy.current=true;
      if(cards[next[0]]===cards[next[1]]){const combo=streak+1;setStreak(combo);setBestStreak(n=>Math.max(n,combo));setPoints(n=>n+120+Math.min(combo-1,5)*30);audio.playSfx('uiMatch');timeout.current=setTimeout(()=>{setMatched(m=>[...m,...next]);setJustMatched(next);setOpen([]);busy.current=false;},350);}
      else{setStreak(0);timeout.current=setTimeout(()=>{setOpen([]);busy.current=false;},1100);}
    }
  };
  const start=()=>{setPeeking(true);round.setPhase('playing');round.setPaused(false);};
  return <PuzzleGameFrame title="Memory Flip" description={`${pairs} pasangan · ${config.time} detik. Ingat cuplikan awal, lalu cari pasangan beruntun untuk bonus combo.`} round={round} score={score} onRestart={onRestart} onStart={start}
    options={<div className="memory-difficulties" aria-label="Kesulitan Memory">{DIFFICULTIES.map(d=><button data-testid={`memory-difficulty-${d.id}`} aria-pressed={difficulty===d.id} key={d.id} onClick={()=>onDifficulty(d.id)}><b>{d.name}</b><small>{Math.min(d.pairs,keys.length)} pasangan</small></button>)}</div>}
    extra={<div className="memory-round-details"><p className="mini-progress" data-testid="memory-progress">{matched.length/2}/{pairs} pasangan · {moves} percobaan</p>{peeking?<span className="memory-status" data-testid="memory-initial-peek">Ingat posisinya… Timer belum berjalan.</span>:<span className="memory-status" data-testid="memory-combo"><Flame size={14}/>{streak>1?`${streak} pasangan beruntun · bonus +${Math.min(streak-1,5)*30}`:'Cari pasangan beruntun untuk bonus'}</span>}</div>}>
    <div className={`memory-grid illustrated-cards ${pairs>8?'memory-large':''}`} data-testid="memory-grid" data-card-back={back?.id} data-animation={animation?.id||'classic'}>
      {cards.map((id,i)=>{const done=matched.includes(i),shown=peeking||open.includes(i)||done;return <button data-testid={`memory-card-${i}`} key={i} className={`memory-card ${shown?'flipped':''} ${done?'matched':''}`} onClick={()=>flip(i)} disabled={done||peeking||round.phase!=='playing'||round.paused} aria-label={shown?`Kartu ${id}`:`Buka kartu ${i+1}`} data-matched={done} data-open={shown}>
        <span className="memory-card-inner"><span className="memory-card-back"><img src={cosmeticImage(back)} alt=""/></span><span className="memory-card-front"><img className="memory-front-art" src="/art/premium/cards/front.webp" alt=""/>{shown&&<span className="memory-card-symbol"><DynamicIcon name={id} type="tiles" className="w-full h-full"/></span>}{done&&<span className="memory-pair-check"><Check size={11}/></span>}</span></span>
        {justMatched.includes(i)&&animation&&<GameParticles item={animation} id={`memory-pair-animation-${i}`}/>}
      </button>;})}
    </div>
  </PuzzleGameFrame>;
};
export const MemoryGame=()=>{const [roundKey,setRoundKey]=useState(0),[difficulty,setDifficulty]=useState('classic');return <Round key={`${roundKey}-${difficulty}`} difficulty={difficulty} onDifficulty={setDifficulty} onRestart={()=>setRoundKey(n=>n+1)}/>;};