import React,{useRef,useState,useEffect} from 'react';
import {ArrowLeft,Pause,Play,RotateCcw,Shield,Zap,Heart,Infinity as InfinityIcon,Crosshair} from 'lucide-react';
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
import {InfinityBriefing} from './InfinityBriefing';
import {INFINITY_ART,sectorFor} from './sectors';
import {KineticModal} from '../../designs/KineticPopups';
import './star-patrol.css';

const Round=({restart}:{restart:()=>void})=>{
  const {profile}=useProfile(),{navigate}=useGame(),cde=useCDE(),audio=useAudio();
  const [state,setState]=useState(initialStarState()),[reward,setReward]=useState<any>(null),[error,setError]=useState(''),[busy,setBusy]=useState(false),[note,setNote]=useState('');
  const scene=useRef<StarScene|null>(null),runId=useRef(crypto.randomUUID()),submitted=useRef(false),recording=useRef(false),bestAtStart=useRef(profile.statistics?.starHighScore||0);
  const config=useRef({level:1,hull:starUpgradeLevel(profile,'hull'),cannon:starUpgradeLevel(profile,'cannon'),recovery:starUpgradeLevel(profile,'recovery'),damage:starUpgradeLevel(profile,'damage'),wingman:starUpgradeLevel(profile,'wingman'),ship:equippedCosmetic(profile,'starShip')!.image,laser:equippedCosmetic(profile,'starLaser')!.image,onState:setState,onSound:(key:string)=>audio.playSfx(key as any)}).current;
  const record=async()=>{
    if(recording.current||submitted.current||state.time<5000)return;recording.current=true;setError('');
    const payload={game:'star',mode:'endless',runId:runId.current,level:state.stage,isWinner:false,isFlawless:false,score:state.score,kills:state.kills,waves:state.wave,bosses:state.bosses,timeElapsed:state.time,matches:0,highestCombo:0};
    try{const result=RewardEngine.processWin(profile,payload);await cde.commitMutation('PROCESS_WIN',payload);submitted.current=true;setReward(result.rewardResult);}catch{setError('Progres belum terkonfirmasi. Sambungkan akun lalu simpan ulang.');}finally{recording.current=false;}
  };
  useEffect(()=>{if(state.phase==='over')void record();},[state.phase]);
  const power=async(id:string)=>{
    if(busy||state.phase!=='playing')return;
    const field=id==='star_shield'?'starShields':'starBlasts';if((profile[field]??3)<=0){setNote('Stok habis. Item tersedia di Toko.');return;}
    setBusy(true);scene.current?.setPhase('paused');setNote('');
    try{await cde.commitMutation('USE_ITEM',{itemId:id});scene.current?.usePower(id);}catch{setNote('Item belum terkonfirmasi. Coba lagi setelah tersambung.');}finally{scene.current?.setPhase(document.hidden?'paused':'playing');setBusy(false);}
  };
  const canLeave=state.time<5000||!!reward,ready=state.phase==='ready',sector=sectorFor(state.stage),seconds=Math.floor(state.time/1000),clock=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  const progress=state.bossMax?75+(1-state.bossHp/state.bossMax)*25:((state.wave-1)%3+1)*25;
  return <main className="star-screen" style={{'--sector-color':sector.color,'--infinity-background':`url(${INFINITY_ART}/background-${sector.background}.webp)`} as React.CSSProperties} data-testid="star-game-screen" data-phase={state.phase} data-ship={config.ship}>
    <header className="star-topbar"><button className="infinity-icon-button" data-testid="star-back" aria-label="Kembali" onClick={()=>ready?navigate('game-hub'):scene.current?.setPhase('paused')} disabled={busy||state.phase==='over'}><ArrowLeft size={20}/></button><div className="infinity-brand"><InfinityIcon size={32}/><div><h1 data-testid="star-title">Infinity</h1><small data-testid="star-level">{ready?'ENDLESS SPACE SHOOTER':`ENDLESS / ANCAMAN ${state.stage}`}</small></div></div><span className="infinity-top-status" data-testid="infinity-top-status"><i/>{ready?'SIAP MELUNCUR':'TANPA BATAS'}</span><strong data-testid="star-score">{state.score.toLocaleString('id-ID')}<small>SKOR</small></strong>{!ready&&<button className="infinity-icon-button" data-testid="star-pause" aria-label="Jeda" disabled={state.phase!=='playing'||busy} onClick={()=>scene.current?.setPhase('paused')}><Pause size={19}/></button>}</header>
    <div className={`star-combat ${ready?'is-ready':''}`}>
      <aside className="infinity-combat-side" data-testid="infinity-mission-sidebar"><span className="infinity-eyebrow">TERUS BERTAHAN</span><h2>{sector.name}</h2><p>Boss kalah, pertempuran berlanjut. Tembus formasi dan raih rekor baru.</p><div className="infinity-side-progress"><span>BOSS DIKALAHKAN</span><strong data-testid="infinity-boss-count">{state.bosses}</strong><span data-testid="infinity-threat-level">ANCAMAN {state.stage} · {sector.difficulty}</span></div><div className="infinity-control-keys"><span>W</span><div><span>A</span><span>S</span><span>D</span></div></div><small>Geser atau gunakan tombol panah.<br/>Meriam menembak otomatis.</small></aside>
      <div className="star-flight"><StarArena config={config} sceneRef={scene}/>
        {!ready&&<><div className="star-flight-hud"><span data-testid="star-health"><Heart size={16}/>{state.hp}<small>/{state.maxHp}</small></span><span data-testid="star-wave">{state.bossHp>0?`BOSS ${state.bosses+1}`:`GELOMBANG ${String(state.wave).padStart(2,'0')}`}</span><span data-testid="star-time">{clock}</span></div><div className="infinity-flight-progress"><progress data-testid="infinity-mission-progress" aria-label="Progres menuju boss berikutnya" value={progress} max={100}/></div>
        {state.bossHp>0&&<div className="infinity-boss-hud"><span data-testid="star-boss-name">{sector.boss}<b data-testid="star-boss-phase">FASE {state.bossPhase} / 2</b></span><progress className="star-boss-bar" data-testid="star-boss-health" max={state.bossMax} value={state.bossHp} aria-label="HP boss"/></div>}
        {state.shield&&state.phase==='playing'&&<span className="star-shield-status" data-testid="star-shield-active"><Shield size={13}/>Perisai aktif</span>}
        {state.boost&&state.phase==='playing'&&<span className="star-boost-status" data-testid="star-triple-active"><Zap size={13}/>{state.weapon} · {state.weaponTime}s</span>}
        {state.notice&&state.phase==='playing'&&<div className="infinity-wave-notice" role="status" data-testid="infinity-wave-notice">{state.notice}</div>}</>}
      </div>
      <aside className="infinity-combat-side threat" data-testid="infinity-threat-sidebar"><span className="infinity-eyebrow"><Crosshair size={14}/> TARGET BERIKUTNYA</span><img src={`${INFINITY_ART}/${sector.bossArt}.png`} alt={sector.boss}/><h2>{sector.boss}</h2><p>{sector.pattern}<br/>2 fase serangan</p><span className="infinity-threat-note">Tidak ada garis finis.<br/>Hanya rekor yang harus dilampaui.</span></aside>
    </div>
    {ready&&<InfinityBriefing ship={config.ship} record={profile.statistics?.starHighScore||0} bestWave={profile.statistics?.starBestWave||0} ready={state.ready} error={state.error} onStart={()=>scene.current?.setPhase('playing')} onHangar={()=>navigate('star-hangar')}/>}
    {!ready&&<footer className="star-bottom"><div className="infinity-weapon-status"><span data-testid="infinity-current-weapon"><Zap size={12}/>{state.weapon}{state.weaponTime>0?` · ${state.weaponTime}s`:''}</span><span data-testid="infinity-drone-status">{state.droneTime>0?`2 drone · ${state.droneTime}s`:state.formation}</span></div><div className="star-power-row"><button data-testid="star-power-shield" disabled={state.phase!=='playing'||busy||(profile.starShields??3)<=0} onClick={()=>power('star_shield')}><img src={`${INFINITY_ART}/hull.png`} alt=""/><span>Perisai<small>Kebal 5 detik</small></span><b data-testid="star-shield-stock">{profile.starShields??3}</b></button><button data-testid="star-power-blast" disabled={state.phase!=='playing'||busy||(profile.starBlasts??3)<=0} onClick={()=>power('star_blast')}><img src={`${INFINITY_ART}/nova.png`} alt=""/><span>Nova<small>Sapu serangan</small></span><b data-testid="star-blast-stock">{profile.starBlasts??3}</b></button></div>{note&&<p role="status" data-testid="star-note">{note}</p>}<span className="star-kills" data-testid="star-kills">{state.kills} musuh · {state.bosses} boss · Terus main sampai kalah</span></footer>}
    <KineticModal isOpen={state.phase==='paused'&&!busy} title="Jeda Infinity" className="infinity-dialog"><span className="infinity-eyebrow" data-testid="star-pause-caption">PENERBANGAN DIJEDA</span><h2 data-testid="star-pause-title">Tarik napas, pilot.</h2><p data-testid="star-pause-description">Gelombang {state.wave} · Bertahan {clock}</p><button className="infinity-primary" data-testid="star-resume" onClick={()=>scene.current?.setPhase('playing')}><Play size={18}/>Lanjutkan</button><button className="infinity-text-button" data-testid="star-end-round" onClick={()=>scene.current?.end()}>Akhiri & simpan skor</button></KineticModal>
    <KineticModal isOpen={state.phase==='over'} title="Hasil Infinity" className="infinity-dialog"><div className="star-result"><img data-testid="star-result-ship" src={config.ship} alt="Pesawatmu"/><span className="infinity-eyebrow" data-testid="star-result-caption">GELOMBANG {state.wave} · {clock}</span><h2 data-testid="star-result-title">{state.score>bestAtStart.current?'Rekor baru, pilot!':'Langit menunggu lagi.'}</h2><strong data-testid="star-final-score">{state.score.toLocaleString('id-ID')}</strong><p data-testid="star-result-summary">{state.kills} musuh · {state.bosses} boss · Bertahan {clock}</p><p data-testid="star-reward">{reward?`+${reward.xp} XP · Misi & pencapaian Infinity diperbarui`:state.time<5000?'Ronde di bawah 5 detik tidak dicatat.':error?'Menunggu penyimpanan':'Menyimpan progres…'}</p>{error&&<div role="alert" data-testid="star-save-error">{error}<button className="infinity-text-button" data-testid="star-save-retry" onClick={record}>Simpan ulang</button></div>}<button className="infinity-primary" data-testid="star-retry" disabled={!canLeave} onClick={restart}><RotateCcw size={17}/>Terbang lagi</button><button className="infinity-text-button" data-testid="star-result-menu" disabled={!canLeave} onClick={()=>navigate('game-hub')}>Menu Infinity</button></div></KineticModal>
  </main>;
};
export const StarPatrolScreen=()=>{const [key,setKey]=useState(0);return <Round key={key} restart={()=>setKey(k=>k+1)}/>;};