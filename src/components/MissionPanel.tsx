import React,{useState,useEffect,useRef} from 'react';
import {Clock,Target,Gift,CalendarDays,Archive} from 'lucide-react';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useAudio} from '../core/audio/AudioEngine';
import {checkDailyMissions} from '../core/misiHarian';
import {missionXP} from '../core/progression';
import {MissionCard} from './MissionCard';
import {GAMES,GameId} from '../core/games';

const countdown=(weekly:boolean,now:number)=>{
  const day=new Date(now+7*3600000).getUTCDay()||7;
  const ms=86400000-((now+7*3600000)%86400000)+(weekly?(7-day)*86400000:0);
  const seconds=Math.floor(ms/1000),days=Math.floor(seconds/86400);
  return `${days?`${days} hari `:''}${String(Math.floor(seconds%86400/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
};
export const gameMissions=(profile:any,game:GameId)=>{const p=checkDailyMissions(profile);const own=(m:any)=>m.game===game;return {daily:p.activeMissions.filter(own),weekly:p.activeWeeklyMissions.filter(own),saved:(p.pendingMissions||[]).filter((m:any)=>own(m)&&!m.claimed)};};
export const readyMissionCount=(profile:any,game:GameId)=>{const m=gameMissions(profile,game);return [...m.daily,...m.weekly,...m.saved].filter((x:any)=>!x.claimed&&x.progress>=x.target).length;};

// Missions of one game: daily / weekly / saved. Rendered inside that game's menu.
export const MissionPanel=({game}:{game:GameId})=>{
  const {profile,updateProfile}=useProfile(),cde=useCDE(),audio=useAudio(),{navigate,setGameMode}=useGame(),meta=GAMES[game];
  const [tab,setTab]=useState<'harian'|'mingguan'|'tersimpan'>('harian'),[now,setNow]=useState(Date.now());
  const [toast,setToast]=useState(''),[busy,setBusy]=useState<string|null>(null),timer=useRef<any>();
  useEffect(()=>{const interval=setInterval(()=>setNow(Date.now()),1000);return()=>{clearInterval(interval);clearTimeout(timer.current);};},[]);
  const sets=gameMissions(profile,game),list=tab==='harian'?sets.daily:tab==='mingguan'?sets.weekly:sets.saved;
  const ready=list.filter((m:any)=>!m.claimed&&m.progress>=m.target).length,done=list.filter((m:any)=>m.progress>=m.target).length;
  const sorted=[...list].sort((a:any,b:any)=>(a.claimed?2:a.progress>=a.target?0:1)-(b.claimed?2:b.progress>=b.target?0:1));
  const play=(mission:any)=>{
    const mode=mission.type==='infinityRound'?meta.modes(profile)[1]:meta.modes(profile)[0];
    setGameMode(mode.mode);
    if(game==='onet')updateProfile({currentLevel:profile.highestLevel||1});
    if(game==='block')updateProfile({blockPuzzleLevel:Math.max(profile.blockPuzzleLevel||1,profile.highestBlockPuzzleLevel||1)});
    navigate(mode.route as any);
  };
  const claim=async(m:any)=>{
    if(busy)return;setBusy(m.id);
    try{await cde.queueMutation('CLAIM_MISSION_REWARD',{missionId:m.id});audio.playUiClick();setToast(`+${m.rewardAmount} Permen · +${missionXP(m)} XP. Kerja bagus!`);}
    catch(e:any){setToast(e.message==='DAILY_INCOME_LIMIT'?'Batas Permen hari ini tercapai. Hadiah tetap tersimpan.':'Hadiah belum bisa diklaim. Coba lagi setelah tersinkron.');}
    finally{setBusy(null);clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),4000);}
  };
  return <div className="mission-panel" data-testid={`mission-panel-${game}`}>
    <div className="filter-tabs mission-tabs" role="tablist" aria-label="Periode misi">{([{id:'harian',label:'Harian',icon:Target},{id:'mingguan',label:'Mingguan',icon:CalendarDays},{id:'tersimpan',label:'Tersimpan',icon:Archive}] as const).map(t=><button key={t.id} data-testid={`mission-tab-${t.id}`} role="tab" aria-selected={tab===t.id} className={tab===t.id?'active':''} onClick={()=>setTab(t.id)}><t.icon size={16}/>{t.label}</button>)}</div>
    <div className="mission-overview" data-testid="mission-summary"><span><b data-testid="mission-summary-count">{done}/{list.length}</b> misi {meta.name} tercapai</span>{tab!=='tersimpan'?<span data-testid="mission-reset-timer"><Clock size={13}/>{countdown(tab==='mingguan',now)}</span>:<span data-testid="mission-no-expiry">Hadiah tetap aman</span>}</div>
    {ready>0&&<p className="mission-ready" data-testid="mission-ready-count"><Gift size={15}/>{ready} hadiah siap diklaim!</p>}
    <div className="mission-list" data-testid="mission-list">{sorted.map((m:any,i:number)=><MissionCard key={m.id} mission={m} index={i} busy={busy===m.id} onClaim={()=>claim(m)} onPlay={()=>play(m)}/>)}</div>
    {!list.length&&<div className="empty-state" data-testid="mission-empty"><Archive size={34}/><h2>{tab==='tersimpan'?'Belum ada hadiah tersimpan':'Belum ada misi'}</h2><p>Misi yang selesai tidak hilang saat periode berganti. Reset harian pukul 00.00 WIB, mingguan setiap Senin.</p></div>}
    <p className="fine-print" data-testid="mission-save-info">Hanya ronde {meta.name} yang mengisi misi ini. Hadiah Permen masuk ke saldo klub yang sama untuk semua game.</p>
    {toast&&<div className="club-toast" role="status" data-testid="mission-toast">{toast}</div>}
  </div>;
};
