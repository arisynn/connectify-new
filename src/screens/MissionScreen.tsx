import React, { useState, useEffect, useRef } from 'react';
import { Clock, Target, Gift, CalendarDays, Archive, Sparkles } from 'lucide-react';
import { useGame } from '../GameContext';
import { GameShell } from '../components/GameShell';
import { useProfile } from '../core/profile/ProfileContext';
import { useCDE } from '../core/cde';
import { useAudio } from '../core/audio/AudioEngine';
import { checkDailyMissions } from '../core/misiHarian';
import { missionXP } from '../core/progression';
import { EconomyMeter } from '../components/EconomyMeter';
import { MissionCard } from '../components/MissionCard';
import {ProgressNav} from '../components/ProgressNav';
import {artIcon} from '../core/artAssets';

const countdown=(weekly:boolean,now:number)=>{
  const local=new Date(now+7*3600000),day=local.getUTCDay()||7;
  const ms=86400000-((now+7*3600000)%86400000)+(weekly?(7-day)*86400000:0);
  const seconds=Math.floor(ms/1000),days=Math.floor(seconds/86400);
  return `${days?`${days} hari `:''}${String(Math.floor(seconds%86400/3600)).padStart(2,'0')}:${String(Math.floor(seconds%3600/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
};
export const MissionScreen=()=>{
  const {profile,updateProfile}=useProfile(),cde=useCDE(),audio=useAudio(),{navigate,setGameMode}=useGame();
  const [tab,setTab]=useState<'harian'|'mingguan'|'tersimpan'>('harian'),[now,setNow]=useState(Date.now());
  const [toast,setToast]=useState(''),[busy,setBusy]=useState<string|null>(null),timer=useRef<any>();
  useEffect(()=>{const interval=setInterval(()=>setNow(Date.now()),1000);return()=>{clearInterval(interval);clearTimeout(timer.current);};},[]);
  const p=checkDailyMissions(profile),saved=(p.pendingMissions||[]).filter((m:any)=>!m.claimed);
  const list=tab==='harian'?p.activeMissions:tab==='mingguan'?p.activeWeeklyMissions:saved;
  const ready=list.filter((m:any)=>!m.claimed&&m.progress>=m.target).length;
  const done=list.filter((m:any)=>m.progress>=m.target).length;
  const sorted=[...list].sort((a:any,b:any)=>(a.claimed?2:a.progress>=a.target?0:1)-(b.claimed?2:b.progress>=b.target?0:1));
  const play=(mission:any)=>{
    setGameMode('normal');
    if(mission.type==='blockLines')navigate('block-puzzle');
    else if(mission.type.startsWith('memory'))navigate('memory');
    else if(mission.type.startsWith('triple'))navigate('triple');
    else if(mission.type.startsWith('fruit'))navigate('fruit-merge');
    else if(mission.type==='infinityRound'){setGameMode('infinity');navigate('block-puzzle');}
    else if(mission.type==='minigame')navigate('levels');
    else if(mission.type==='openChest')navigate('peti');
    else if(mission.type==='complete_daily'||mission.type==='complete_daily_all')setTab('harian');
    else if(['match','split','flawless','survivor','fast_clear','useHint','useShuffle'].includes(mission.type)){updateProfile({currentLevel:profile.highestLevel||1});navigate('play');}
    else navigate('levels');
  };
  const claim=async(m:any)=>{
    if(busy)return;setBusy(m.id);
    try{await cde.queueMutation('CLAIM_MISSION_REWARD',{missionId:m.id});audio.playUiClick();setToast(`+${m.rewardAmount} Permen · +${missionXP(m)} XP. Kerja bagus!`);}
    catch(e:any){setToast(e.message==='DAILY_INCOME_LIMIT'?'Batas Permen hari ini tercapai. Hadiah tetap tersimpan.':'Hadiah belum bisa diklaim. Coba lagi setelah tersinkron.');}
    finally{setBusy(null);clearTimeout(timer.current);timer.current=setTimeout(()=>setToast(''),4000);}
  };
  return <GameShell title="Progres klub" eyebrow="LANGKAH KECIL, HADIAH NYATA" wide>
    <ProgressNav/>
    <div className="mission-hero" data-testid="mission-hero"><div><span className="eyebrow" data-testid="mission-caption">MAIN DENGAN TUJUAN</span><h2 data-testid="mission-headline">Satu misi.<br/>Satu alasan lagi.</h2><p data-testid="mission-reward-explainer">Dapatkan Permen dan XP dari permainan favoritmu.</p></div><img className="mission-hero-art" src={artIcon('missions')} alt=""/></div>
    <div className="filter-tabs mission-tabs" role="tablist" aria-label="Periode misi">{([{id:'harian',label:'Harian',icon:Target},{id:'mingguan',label:'Mingguan',icon:CalendarDays},{id:'tersimpan',label:'Tersimpan',icon:Archive}] as const).map(t=><button key={t.id} data-testid={`mission-tab-${t.id}`} role="tab" aria-selected={tab===t.id} className={tab===t.id?'active':''} onClick={()=>setTab(t.id)}><t.icon size={16}/>{t.label}</button>)}</div>
    <div className="mission-overview" data-testid="mission-summary"><span><b data-testid="mission-summary-count">{done}/{list.length}</b> misi tercapai</span>{tab!=='tersimpan'?<span data-testid="mission-reset-timer"><Clock size={13}/>{countdown(tab==='mingguan',now)}</span>:<span data-testid="mission-no-expiry">Hadiah tetap aman</span>}</div>
    <div className="mission-milestones" data-testid="mission-progress-track" aria-label={`${done} dari ${list.length} misi tercapai`}>{list.map((m:any,i:number)=><span data-testid={`mission-milestone-${i}`} key={m.id} className={m.progress>=m.target?'complete':''}/>)}</div>
    {ready>0&&<p className="mission-ready" data-testid="mission-ready-count"><Gift size={15}/>{ready} hadiah siap diklaim!</p>}
    <div className="mission-list" data-testid="mission-list">{sorted.map((m:any,i:number)=><MissionCard key={m.id} mission={m} index={i} busy={busy===m.id} onClaim={()=>claim(m)} onPlay={()=>play(m)}/>)}</div>
    {!list.length&&<div className="empty-state" data-testid="mission-empty"><Archive size={34}/><h2>Belum ada hadiah tersimpan</h2><p>Hadiah dari misi yang sudah selesai tidak hilang saat periode berganti.</p><button className="pop-button mint" data-testid="mission-empty-daily" onClick={()=>setTab('harian')}>Lihat misi hari ini</button></div>}
    <div className="mission-economy"><EconomyMeter compact id="mission-income"/></div>
    <p className="fine-print" data-testid="mission-save-info">Hasil ronde otomatis terhubung ke misi, pencapaian, dan statistik. Reset pukul 00.00 WIB; mingguan setiap Senin. Progres misi lama tetap aman sampai reset.</p>
    {toast&&<div className="club-toast" role="status" data-testid="mission-toast">{toast}</div>}
  </GameShell>;
};