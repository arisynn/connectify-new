import React,{useState} from 'react';
import {Lock,Star,Check} from 'lucide-react';
import {useProfile} from '../core/profile/ProfileContext';
import {useCDE} from '../core/cde';
import {useAudio} from '../core/audio/AudioEngine';
import {achievementsFor,getCurrentTier,getAchievementRewardSummary,isAchievementReady,HUB_GAME} from '../core/achievements';
import {artIcon} from '../core/artAssets';
import {HubGame,GAME_NAMES} from '../core/games';
const categories=[['all','Semua'],['progression','Progres'],['mastery','Keahlian'],['collection','Koleksi'],['secret','Rahasia']];
export const readyAchievementCount=(profile:any,game:HubGame)=>achievementsFor(game).filter(a=>isAchievementReady(profile,a)).length;

// Achievements of one game (or the hub's meta achievements when game === 'hub').
export const AchievementPanel=({game}:{game:HubGame})=>{
  const {profile}=useProfile(),cde=useCDE(),audio=useAudio(),all=achievementsFor(game);
  const [category,setCategory]=useState('all'),[message,setMessage]=useState(''),[busy,setBusy]=useState<string|null>(null);
  const claimed=all.reduce((n,a)=>n+getCurrentTier(profile,a.id),0),total=all.reduce((n,a)=>n+a.tiers.length,0);
  const ready=(a:any)=>isAchievementReady(profile,a);
  const visibleCategories=categories.filter(([id])=>id==='all'||all.some(a=>a.category===id));
  const list=all.filter(a=>category==='all'||a.category===category).sort((a,b)=>Number(ready(b))-Number(ready(a)));
  const claim=async(a:any)=>{if(busy)return;setBusy(a.id);try{await cde.queueMutation('CLAIM_ACHIEVEMENT_REWARD',{achievementId:a.id});audio.playSfx('uiReward');setMessage(`${a.title}: hadiah berhasil dicatat.`);}catch(e:any){setMessage(e.message==='DAILY_INCOME_LIMIT'?'Batas Permen harian tercapai. Hadiah tetap aman untuk nanti.':'Belum dapat diklaim. Tunggu sinkronisasi.');}finally{setBusy(null);}};
  return <div data-testid={`achievement-panel-${game}`}>
    <div className="club-page-banner"><div><span className="eyebrow" data-testid="achievement-summary-label">{game===HUB_GAME?'JEJAK KLUB':`JEJAK ${GAME_NAMES[game].toUpperCase()}`}</span><h2 data-testid="achievement-summary">{claimed} / {total} tier diraih</h2><p data-testid="achievement-claimable-badge">{all.filter(ready).length} pencapaian siap diklaim.</p></div><img src={artIcon('achievements')} alt=""/></div>
    {visibleCategories.length>2&&<div className="club-filter-tabs" aria-label="Kategori pencapaian">{visibleCategories.map(([id,label])=><button key={id} data-testid={`achievement-filter-${id}`} aria-pressed={category===id} onClick={()=>setCategory(id)}>{label}</button>)}</div>}
    {message&&<p data-testid="achievement-toast" role="status" className="shop-message">{message}</p>}
    <div className="achievement-grid">{list.map(a=>{const tierIndex=getCurrentTier(profile,a.id),maxed=tierIndex>=a.tiers.length,tier=a.tiers[Math.min(tierIndex,a.tiers.length-1)],progress=a.getProgress(profile)||0,secret=a.category==='secret'&&!tierIndex&&!progress;return <article key={a.id} className="achievement-card" data-testid={`achievement-card-${a.id}`}>
      <div className="achievement-card-heading">{secret?<Lock size={25}/>:<img src={artIcon(a.category==='collection'?'collection':'achievements')} alt=""/>}<div><h3 data-testid={`achievement-title-${a.id}`}>{secret?'Rahasia':a.title}</h3><p data-testid={`achievement-description-${a.id}`}>{secret?'Terus bermain untuk menemukannya.':a.desc(tier.target)}</p></div></div>
      <div className="achievement-stars" data-testid={`achievement-tier-${a.id}`}>{a.tiers.map((_:any,i:number)=><Star size={16} key={i} fill={i<tierIndex?'#e8b75b':'none'}/>)}<span>Tier {Math.min(tierIndex+1,a.tiers.length)} / {a.tiers.length}</span></div>
      {!secret&&<p className="achievement-reward" data-testid={`achievement-reward-${a.id}`}>{getAchievementRewardSummary(tier).map((r:any)=>r.type==='theme'?`Tema ${r.theme}`:`+${r.amount} ${({permen:'Permen',hints:'petunjuk',shuffles:'acak',hammers:'palu',bombs:'bom'} as any)[r.type]||r.type}`).join(' · ')}</p>}
      <progress data-testid={`achievement-progress-${a.id}`} aria-label={`Progres ${a.title}`} max={tier.target} value={maxed?tier.target:Math.min(progress,tier.target)}/><div className="achievement-card-foot"><span data-testid={`achievement-progress-label-${a.id}`}>{Math.min(progress,tier.target).toLocaleString('id-ID')} / {tier.target.toLocaleString('id-ID')}</span>{maxed?<span data-testid={`achievement-complete-${a.id}`}><Check size={15}/>Selesai</span>:<button data-testid={`achievement-claim-${a.id}`} className="pop-button mint" disabled={!ready(a)||!!busy} onClick={()=>claim(a)}>{busy===a.id?'Mencatat…':'Klaim'}</button>}</div>
    </article>;})}</div>
  </div>;
};
