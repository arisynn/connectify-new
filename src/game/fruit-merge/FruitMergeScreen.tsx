import React,{useEffect,useRef,useState} from 'react';
import {Pause,Play,RotateCcw,ArrowLeft} from 'lucide-react';
import {GameShell} from '../../components/GameShell';
import {KineticModal} from '../../designs/KineticPopups';
import {VictoryBurst} from '../../components/VictoryBurst';
import {useGame} from '../../GameContext';
import {useProfile} from '../../core/profile/ProfileContext';
import {useCDE} from '../../core/cde';
import {RewardEngine} from '../../core/reward';
import {equippedCosmetic} from '../../core/cosmetics';
import {ITEM_FIELD,DEFAULT_ITEM_COUNT} from '../../core/economy';
import {warmImages} from '../../lib/assetCache';
import {artIcon} from '../../core/artAssets';
import {useFruitMerge} from './useFruitMerge';
import {FRUITS} from './catalog';
import {FruitBoard} from './FruitBoard';
import './fruit-merge.css';
const Round=({onRestart}:{onRestart:()=>void})=>{
  const {state,phase,drop,swap,pop}=useFruitMerge(),{navigate}=useGame(),{profile}=useProfile(),cde=useCDE();
  const [aim,setAim]=useState(180),[reward,setReward]=useState<any>(null),[error,setError]=useState(''),[note,setNote]=useState('');
  const runId=useRef(crypto.randomUUID()),submitted=useRef(false),noteTimer=useRef<any>();
  const animation=equippedCosmetic(profile,'fruitAnimation')||{id:'fruit-spark',image:'/art/premium/fruit-merge/15.webp',motion:'pop'};
  const basket=equippedCosmetic(profile,"fruitBasket");
  const stock=(id:string)=>profile[ITEM_FIELD[id]]??DEFAULT_ITEM_COUNT;
  useEffect(()=>warmImages(FRUITS.map(f=>f.image)),[]);
  const say=(text:string)=>{setNote(text);clearTimeout(noteTimer.current);noteTimer.current=setTimeout(()=>setNote(''),2200);};
  const usePower=(id:string,run:()=>boolean|number)=>{
    if(state?.phase!=='playing')return;
    if(stock(id)<=0){say('Stok habis. Beli di Toko klub › Bantuan.');return;}
    const result=run();
    if(!result){say(id==='fruit_swap'?'Buah di tangan dan berikutnya sama.':'Keranjang masih kosong.');return;}
    cde.queueMutation('USE_ITEM',{itemId:id}).catch(()=>{});
    say(id==='fruit_swap'?'Buah ditukar.':`${result} buah kecil dipetik.`);
  };
  const record=async()=>{
    if(!state||!state.drops||submitted.current)return;submitted.current=true;
    const payload={game:'fruit',runId:runId.current,level:1,isWinner:state.largest===11,isFlawless:false,score:state.score,matches:state.merges,highestCombo:state.bestCombo,timeElapsed:Math.round(state.time),fruitStage:state.largest,watermelons:state.watermelons,isDailyChallenge:false};
    try{const result=RewardEngine.processWin(profile,payload);await cde.queueMutation('PROCESS_WIN',payload);setReward(result.rewardResult);}catch{setError('Hasil belum tercatat. Coba simpan ulang.');submitted.current=false;}
  };
  useEffect(()=>{if(state?.phase==='over'&&!submitted.current&&!error)void record();},[state?.phase]);
  const back=()=>{if(state?.phase==='playing')phase('paused');else if(state?.phase==='ready')navigate('levels');};
  if(!state)return <GameShell title="Fruit Merge" back="levels"><p data-testid="fruit-loading">Menyiapkan keranjang buah…</p></GameShell>;
  const won=state.largest===11;
  return <main className="play-screen fruit-game-screen" data-testid="fruit-game-screen" data-phase={state.phase} data-animation={animation.id}><div className="play-surface">
    <header className="play-topline"><button className="round-button" data-testid="shell-back" aria-label="Kembali" onClick={back}><ArrowLeft size={22}/></button><img className="play-game-icon" src={artIcon('fruit-merge')} alt=""/><div className="play-heading"><span className="eyebrow" data-testid="fruit-mode-name">BERTUMPUK. BERTEMU. JADI LEBIH BESAR.</span><h1 data-testid="fruit-title">Fruit Merge</h1></div><span className="hud-timer" data-testid="fruit-score"><b>{state.score.toLocaleString('id-ID')}</b><small>skor</small></span><button className="round-button" data-testid="fruit-pause" aria-label="Jeda Fruit Merge" disabled={state.phase!=='playing'} onClick={()=>phase('paused')}><Pause size={20}/></button></header>
    <div className="fruit-game-layout">
      <div className="fruit-play-area">
        <div className="fruit-next-row"><span data-testid="fruit-merge-count">{state.merges} gabungan · rekor <b data-testid="fruit-record">{Math.max(state.score,profile.statistics?.fruitHighScore||0).toLocaleString('id-ID')}</b></span><span data-testid="fruit-next-label">Di tangan<img data-testid="fruit-current-image" src={FRUITS[state.current].image} alt={FRUITS[state.current].name}/>· Berikutnya<img data-testid="fruit-next-image" src={FRUITS[state.next].image} alt={FRUITS[state.next].name}/></span></div>
        <FruitBoard state={state} aim={aim} setAim={setAim} onDrop={drop} onStart={()=>phase('playing')} animation={animation} basket={basket}/>
        <div className="fruit-powerups" data-testid="fruit-powerups">
          <button className="fruit-power" data-testid="fruit-power-swap" disabled={state.phase!=='playing'} onClick={()=>usePower('fruit_swap',swap)}><img src={artIcon('shuffle')} alt=""/><span><b>Tukar</b><small>Tukar buah berikutnya</small></span><i data-testid="fruit-power-swap-stock">{stock('fruit_swap')}</i></button>
          <button className="fruit-power" data-testid="fruit-power-pop" disabled={state.phase!=='playing'} onClick={()=>usePower('fruit_pop',pop)}><img src={artIcon('hammer')} alt=""/><span><b>Petik</b><small>Ambil semua buah terkecil</small></span><i data-testid="fruit-power-pop-stock">{stock('fruit_pop')}</i></button>
        </div>
        <p className="fruit-control-help" data-testid="fruit-control-help">{note||'Ketuk keranjang untuk menjatuhkan buah · Keyboard: ← → lalu spasi'}</p>
      </div>
      <aside className="fruit-game-intro"><img src="/art/premium/fruit-merge/14.webp" alt="Semangka kecil bermahkota"/><span className="eyebrow" data-testid="fruit-intro-caption">KECIL-KECIL JADI BESAR</span><h2 data-testid="fruit-intro-title">Ada ruang<br/>untuk tumbuh.</h2><p data-testid="fruit-rules">Gabungkan dua buah sejenis. Rencanakan tumpukanmu, jangan biarkan buah menetap di atas garis batas.</p><div className="fruit-evolution" data-testid="fruit-evolution">{FRUITS.map(f=><div key={f.level} data-testid={`fruit-stage-${f.level}`} className={f.level<=state.largest?'discovered':''} title={f.name}><img src={f.image} alt={f.name}/><small>{f.level+1}</small></div>)}</div><p className="fine-print" data-testid="fruit-max-rule">Dua semangka menyatu jadi bonus skor besar dan mengosongkan ruang. Rekor dan misi dicatat saat ronde selesai.</p></aside>
    </div></div>
    <KineticModal isOpen={state.phase==='paused'} title="Jeda Fruit Merge" className="text-center"><img className="result-art" src="/art/premium/fruit-merge/12.webp" alt=""/><h2 className="text-2xl mb-3" data-testid="fruit-pause-title">Buahnya ikut istirahat.</h2><p className="text-sm mb-5" data-testid="fruit-pause-copy">Fisika berhenti selama jeda. Akhiri ronde untuk mencatat skor dan progresmu.</p><button className="pop-button mint w-full" data-testid="fruit-resume" onClick={()=>phase('playing')}><Play size={17}/>Lanjutkan</button><button className="text-button mt-4 w-full" data-testid="fruit-end-round" onClick={()=>phase('over')}>Akhiri & catat ronde</button></KineticModal>
    <KineticModal isOpen={state.phase==='over'} title="Hasil Fruit Merge" className="text-center"><>{won&&<VictoryBurst/>}<img className="result-art" src={FRUITS[state.largest].image} alt=""/><span className="eyebrow" data-testid="fruit-result-caption">{won?'SEMANGKA TERCAPAI!':'SETIAP TUMPUKAN ADA CERITANYA'}</span><h2 className="text-2xl my-3" data-testid="fruit-result-title">{won?'Tumbuh jadi juara.':'Satu keranjang selesai.'}</h2><strong className="fruit-result-score" data-testid="fruit-final-score">{state.score.toLocaleString('id-ID')}</strong><p data-testid="fruit-result-detail">{state.merges} gabungan · Buah terbesar: {FRUITS[state.largest].name}</p><p className="text-sm my-4" data-testid="fruit-reward">{reward?`+${reward.xp} XP · +${reward.chestPoints} poin peti`:state.drops?'Mencatat progres…':'Belum ada buah dijatuhkan; ronde tidak dihitung.'}</p>{error&&<p role="alert" data-testid="fruit-save-error">{error}<button className="text-button" data-testid="fruit-save-retry" onClick={()=>{setError('');void record();}}>Simpan ulang</button></p>}<button className="pop-button mint w-full" data-testid="fruit-retry" disabled={!!error} onClick={onRestart}><RotateCcw size={16}/>Main lagi</button><button className="text-button w-full mt-3" data-testid="fruit-result-menu" disabled={!!error} onClick={()=>navigate('levels')}>Pilih permainan</button></></KineticModal>
  </main>;
};
export const FruitMergeScreen=()=>{const [key,setKey]=useState(0);return <Round key={key} onRestart={()=>setKey(n=>n+1)}/>;};
