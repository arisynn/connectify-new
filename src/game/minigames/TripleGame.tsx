import React,{useEffect,useState} from 'react';
import { Undo2 } from 'lucide-react';
import { useTheme } from '../../core/theme/ThemeProvider';
import { tileIdsFor } from '../../core/tileCatalog';
import { DynamicIcon } from '../../components/theme/DynamicIcon';
import { randomize,useMiniRound } from './useMiniRound';
import { PuzzleGameFrame } from '../components/PuzzleGameFrame';

const Round=({onRestart}:{onRestart:()=>void})=>{
  const {activeTheme}=useTheme(),round=useMiniRound('triple',120);
  const [stacks,setStacks]=useState<string[][]>(()=>{
    const ids=randomize<string>(tileIdsFor(activeTheme.id)).slice(0,6);
    const layers=[0,1,2].map(n=>randomize(Array.from({length:4},(_,i)=>ids[(i+n)%6]).flatMap(id=>[id,id,id])));
    return Array.from({length:12},(_,i)=>layers.map(layer=>layer[i]));
  });
  const [tray,setTray]=useState<string[]>([]),[cleared,setCleared]=useState(0),[undo,setUndo]=useState<any>(null),[undoUsed,setUndoUsed]=useState(false);
  const remaining=stacks.reduce((n,s)=>n+s.length,0),score=cleared*150;
  useEffect(()=>{if(round.phase==='playing'&&(remaining===0||tray.length>=7||round.time===0))round.finish(remaining===0&&tray.length===0,score,cleared,!undoUsed?0:1);},[remaining,tray,round.time]);
  const pick=(i:number)=>{
    if(round.phase!=='playing'||round.paused||!stacks[i].length||tray.length>=7)return;
    setUndo({stacks:stacks.map(s=>[...s]),tray:[...tray],cleared});
    const next=stacks.map(s=>[...s]),id=next[i].pop()!,items=[...tray,id];
    if(items.filter(t=>t===id).length===3){setTray(items.filter(t=>t!==id));setCleared(n=>n+1);}else setTray(items);
    setStacks(next);
  };
  return <PuzzleGameFrame title="Triple Match" description="Ambil tile teratas. Kumpulkan 3 gambar sama, jangan sampai 7 slot penuh." round={round} score={score} onRestart={onRestart} extra={<div className="triple-status"><span data-testid="triple-progress">{remaining} tile tersisa · {cleared}/12 trio</span><button data-testid="triple-undo" className="text-button" disabled={!undo||undoUsed||round.phase!=='playing'||round.paused} onClick={()=>{setStacks(undo.stacks);setTray(undo.tray);setCleared(undo.cleared);setUndoUsed(true);}}><Undo2 size={16}/>Undo {undoUsed?'0':'1'}</button></div>}>
    <div className="triple-grid">{stacks.map((stack,i)=><button key={i} data-testid={`triple-stack-${i}`} data-depth={stack.length} aria-label={stack.length?`Ambil ${stack[stack.length-1]}`:'Tumpukan kosong'} disabled={!stack.length} className={`triple-stack depth-${stack.length}`} onClick={()=>pick(i)}>{!!stack.length&&<><DynamicIcon name={stack[stack.length-1]} type="tiles" className="w-full h-full"/><span className="stack-count">{stack.length}</span></>}</button>)}</div>
    <div className={`triple-tray ${tray.length>=5?'warning':''}`} data-testid="triple-tray">{Array.from({length:7},(_,i)=><div key={i} data-testid={`triple-tray-slot-${i}`}>{tray[i]?<DynamicIcon name={tray[i]} type="tiles" className="w-full h-full"/>:<span/>}</div>)}</div>
  </PuzzleGameFrame>;
};
export const TripleGame=()=>{const [key,setKey]=useState(0);return <Round key={key} onRestart={()=>setKey(n=>n+1)}/>;};