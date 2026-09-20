import React,{useRef,useState,useEffect} from 'react';
import {ArrowLeft,Pause,Play,RotateCcw,Wrench,Shield,Zap,Heart} from 'lucide-react';
import {useGame} from '../../GameContext';
import {useProfile} from '../../core/profile/ProfileContext';
import {useCDE} from '../../core/cde';
import {useAudio} from '../../core/audio/AudioEngine';
import {equippedCosmetic} from '../../core/cosmetics';
import {starUpgradeLevel} from '../../core/starPatrol';
import {RewardEngine} from '../../core/reward';
import {StarArena} from './StarArena';
import {StarScene} from './StarScene';
import {initialStarState} from './types';
import {KineticModal} from '../../designs/KineticPopups';
import './star-patrol.css';

const Round=({restart}:{restart:()=>void})=>{
  const {profile}=useProfile(),{navigate}=useGame(),cde=useCDE(),audio=useAudio();
  const [state,setState]=useState(initialStarState()),[reward,setReward]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[note,setNote]=useState('');
  const scene=useRef<StarScene|null>(null),runId=useRef(crypto.randomUUID()),submitted=useRef(false),recording=useRef(false);
  const config=useRef({level:profile.starLevel||1,hull:starUpgradeLevel(profile,'hull'),cannon:starUpgradeLevel(profile,'cannon'),recovery:starUpgradeLevel(profile,'recovery'),ship:equippedCosmetic(profile,'starShip')!.image,laser:equippedCosmetic(profile,'starLaser')!.image,onState:setState,onSound:(key:string)=>audio.playSfx(key as any)}).current;
  const record=async()=>{
    if(recording.current||submitted.current||state.time<5000)return;recording.current=true;setError('');
    const payload={game:'star',runId:runId.current,level:config.level,isWinner:state.won,isFlawless:state.won&&state.hp===state.maxHp,score:state.score,kills:state.kills,waves:state.wave,bosses:state.bosses,timeElapsed:state.time,matches:0,highestCombo:0};
    try{const result=RewardEngine.processWin(profile,payload);await cde.commitMutation('PROCESS_WIN',payload);submitted.current=true;setReward(result.rewardResult);}catch{setError('Progres belum terkonfirmasi. Sambungkan akun lalu simpan ulang.');}finally{recording.current=false;}
  };
  useEffect(()=>{if(state.phase==='over')void record();},[state.phase]);
  const power=async(id:string)=>{
    if(busy||state.phase!=='playing')return;
    const field=id==='star_shield'?'starShields':'starBlasts';if((profile[field]??3)<=0){setNote('Stok habis. Item tersedia di Toko.');return;}
    setBusy(true);scene.current?.setPhase('paused');setNote('');
    try{await cde.commitMutation('USE_ITEM',{itemId:id});scene.current?.usePower(id);}catch{setNote('Item belum terkonfirmasi. Coba lagi setelah tersambung.');}finally{scene.current?.setPhase('playing');setBusy(false);}
  };
  const canLeave=state.time<5000||!!reward;
  return <main className="star-screen" data-testid="star-game-screen" data-phase={state.phase} data-ship={config.ship}>
    <header className="star-topbar"><button className="round-button" data-testid="star-back" aria-label="Kembali" onClick={()=>state.phase==='ready'?navigate('levels'):scene.current?.setPhase('paused')} disabled={busy||state.phase==='over'}><ArrowLeft size={20}/></button><div><h1 data-testid="star-title">Star Patrol</h1><small data-testid="star-level">SEKTOR {config.level}</small></div><strong data-testid="star-score">{state.score.toLocaleString('id-ID')}<small>SKOR</small></strong><button className="round-button" data-testid="star-pause" aria-label="Jeda" disabled={state.phase!=='playing'||busy} onClick={()=>scene.current?.setPhase('paused')}><Pause size={19}/></button></header>
    <div className="star-flight">
      <StarArena config={config} sceneRef={scene}/>
      <div className="star-flight-hud"><span data-testid="star-health"><Heart size={16}/>{state.hp}/{state.maxHp}</span><span data-testid="star-wave">{state.bossHp>0?'BOSS':`GELOMBANG ${state.wave}/3`}</span><span data-testid="star-time">{Math.floor(state.time/1000)}s</span></div>
      {state.bossHp>0&&<progress className="star-boss-bar" data-testid="star-boss-health" max={state.bossMax} value={state.bossHp} aria-label="HP boss"/>}
      {state.shield&&state.phase==='playing'&&<span className="star-shield-status" data-testid="star-shield-active"><Shield size={14}/>Perisai aktif</span>}
      {state.phase==='ready'&&<section className="star-launch" data-testid="star-launch"><span className="eyebrow">CONNECTIFY ARCADE</span><h2 data-testid="star-launch-title">Siap, pilot?</h2><div className="star-launch-summary" data-testid="star-record">Rekor {(profile.statistics?.starHighScore||0).toLocaleString('id-ID')}<br/>3 gelombang · 1 boss</div><button className="pop-button mint" data-testid="star-start" disabled={!state.ready} onClick={()=>scene.current?.setPhase('playing')}><Play size={18}/>{state.ready?'Mulai terbang':'Memuat aset…'}</button><button className="star-link" data-testid="star-open-hangar" onClick={()=>navigate('star-hangar')}><Wrench size={16}/>Hanggar & upgrade</button>{state.error&&<p role="alert" data-testid="star-load-error">{state.error}</p>}</section>}
    </div>
    <footer className="star-bottom"><div className="star-power-row"><button data-testid="star-power-shield" disabled={state.phase!=='playing'||busy||(profile.starShields??3)<=0} onClick={()=>power('star_shield')}><Shield size={20}/><span>Perisai</span><b data-testid="star-shield-stock">{profile.starShields??3}</b></button><button data-testid="star-power-blast" disabled={state.phase!=='playing'||busy||(profile.starBlasts??3)<=0} onClick={()=>power('star_blast')}><Zap size={20}/><span>Nova</span><b data-testid="star-blast-stock">{profile.starBlasts??3}</b></button></div>{note&&<p role="status" data-testid="star-note">{note}</p>}<span className="star-kills" data-testid="star-kills">{state.kills} musuh dikalahkan</span></footer>
    <KineticModal isOpen={state.phase==='paused'&&!busy} title="Jeda Star Patrol"><h2 data-testid="star-pause-title">Istirahat sebentar.</h2><button className="pop-button mint w-full mt-5" data-testid="star-resume" onClick={()=>scene.current?.setPhase('playing')}><Play size={18}/>Lanjutkan</button><button className="text-button w-full mt-4" data-testid="star-end-round" onClick={()=>scene.current?.end()}>Akhiri ronde</button></KineticModal>
    <KineticModal isOpen={state.phase==='over'} title="Hasil Star Patrol"><div className="star-result"><img src={config.ship} alt="Pesawatmu"/><span className="eyebrow" data-testid="star-result-caption">SEKTOR {config.level}</span><h2 data-testid="star-result-title">{state.won?'Sektor aman!':'Terbang lagi, pilot.'}</h2><strong data-testid="star-final-score">{state.score.toLocaleString('id-ID')}</strong><p data-testid="star-result-summary">{state.kills} musuh · {state.bosses} boss · {Math.floor(state.time/1000)} detik</p><p data-testid="star-reward">{reward?`+${reward.xp} XP · +${reward.chestPoints} poin peti`:state.time<5000?'Ronde di bawah 5 detik tidak dicatat.':error?'Menunggu penyimpanan':'Menyimpan progres…'}</p>{state.won&&reward&&<p data-testid="star-next-level">Sektor {config.level+1} terbuka</p>}{error&&<div role="alert" data-testid="star-save-error">{error}<button className="text-button" data-testid="star-save-retry" onClick={record}>Simpan ulang</button></div>}<button className="pop-button mint w-full" data-testid="star-retry" disabled={!canLeave} onClick={restart}><RotateCcw size={17}/>{state.won?'Sektor berikutnya':'Main lagi'}</button><button className="text-button w-full mt-3" data-testid="star-result-menu" disabled={!canLeave} onClick={()=>navigate('levels')}>Pilih permainan</button></div></KineticModal>
  </main>;
};
export const StarPatrolScreen=()=>{const [key,setKey]=useState(0);return <Round key={key} restart={()=>setKey(k=>k+1)}/>;};