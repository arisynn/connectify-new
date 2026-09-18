import React,{useEffect,useRef,useState} from 'react';
import { Sparkles } from 'lucide-react';
import { useTheme } from '../../core/theme/ThemeProvider';
import { tileIdsFor } from '../../core/tileCatalog';
import { DynamicIcon } from '../../components/theme/DynamicIcon';
import { randomize,useMiniRound } from './useMiniRound';
import { MiniGameFrame } from './MiniGameFrame';

const Round=({onRestart}:{onRestart:()=>void})=>{
  const {activeTheme}=useTheme(),round=useMiniRound('memory',90);
  const [cards]=useState(()=>{const ids=randomize<string>(tileIdsFor(activeTheme.id)).slice(0,8);return randomize([...ids,...ids]);});
  const [open,setOpen]=useState<number[]>([]),[matched,setMatched]=useState<number[]>([]),[moves,setMoves]=useState(0),[mistakes,setMistakes]=useState(0);
  const timer=useRef<any>(),lock=useRef(false);const score=matched.length/2*120;
  useEffect(()=>()=>clearTimeout(timer.current),[]);
  useEffect(()=>{if(round.phase==='playing'&&(round.time===0||matched.length===16))round.finish(matched.length===16,score,matched.length/2,mistakes);},[round.time,matched]);
  const flip=(index:number)=>{
    if(round.phase!=='playing'||round.paused||lock.current||matched.includes(index)||open.includes(index))return;
    const next=[...open,index];setOpen(next);
    if(next.length===2){
      lock.current=true;setMoves(n=>n+1);
      if(cards[next[0]]===cards[next[1]]){setMatched(v=>[...v,...next]);setOpen([]);lock.current=false;}
      else {setMistakes(n=>n+1);timer.current=setTimeout(()=>{setOpen([]);lock.current=false;},800);}
    }
  };
  return <MiniGameFrame title="Memory Flip" description="Ingat gambarnya. Temukan 8 pasangan sebelum 90 detik habis." round={round} score={score} onRestart={onRestart} extra={<p className="mini-progress" data-testid="memory-progress">{matched.length/2}/8 pasangan · {moves} percobaan</p>}>
    <div className="memory-grid">{cards.map((id,i)=>{
      const shown=open.includes(i)||matched.includes(i),done=matched.includes(i);
      return <button data-testid={`memory-card-${i}`} key={i} className={`memory-card ${shown?'flipped':''} ${done?'matched':''}`} onClick={()=>flip(i)} disabled={done} aria-label={shown?id:`Buka kartu ${i+1}`} data-matched={done}><span className="memory-back"><Sparkles size={26}/></span><span className="memory-front">{shown&&<DynamicIcon name={id} type="tiles" className="w-full h-full"/>}</span></button>;
    })}</div>
  </MiniGameFrame>;
};
export const MemoryGame=()=>{const [key,setKey]=useState(0);return <Round key={key} onRestart={()=>setKey(n=>n+1)}/>;};