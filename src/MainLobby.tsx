import React from 'react';
import { Settings, Bell, ArrowUpRight, Play, Trophy, Target, Package, ShoppingBag, ChevronRight, Sparkles, Gift } from 'lucide-react';
import { useGame } from './GameContext';
import { useProfile } from './core/profile/ProfileContext';
import { DynamicIcon } from './components/theme/DynamicIcon';
import { ModeToggle } from './components/GameShell';
import { EconomyMeter } from './components/EconomyMeter';
import { isChestReady, CHEST_POINTS_REQUIRED } from './core/chest';
import { getClaimableAchievements } from './core/achievements';
import { checkDailyMissions } from './core/misiHarian';

export const MainLobby=()=>{
  const {navigate,user}=useGame(),{profile}=useProfile();
  const missions=checkDailyMissions(profile).activeMissions;
  const missionCount=missions.filter((m:any)=>!m.claimed&&m.progress>=m.target).length;
  const achievementCount=getClaimableAchievements(profile).length;
  const slots=profile.chestSlots||[null,null,null];
  const links=[{id:'misi',name:'Misi',caption:'Sedikit demi sedikit',icon:Target,asset:'missions',color:'mint',badge:missionCount},{id:'prestasi',name:'Pencapaian',caption:'Rayakan progresmu',icon:Trophy,asset:'achievement',color:'butter',badge:achievementCount},{id:'koleksi',name:'Koleksi',caption:'Temukan favoritmu',icon:Package,asset:'collection',color:'sky',badge:0},{id:'toko',name:'Toko',caption:'Buat main makin seru',icon:ShoppingBag,asset:'shop',color:'pink',badge:0}];
  return <main className="club-lobby" data-testid="main-lobby">
    <header className="club-topbar"><div className="club-brand" data-testid="brand"><DynamicIcon name="connectify_logo" className="brand-mark"/><span>connectify<small>YOUR LITTLE PLAY CLUB</small></span></div><div className="topbar-actions"><ModeToggle id="lobby-mode"/><button data-testid="lobby-settings" className="round-button" aria-label="Pengaturan" onClick={()=>navigate('settings')}><Settings size={20}/></button><button data-testid="lobby-notifications" className="round-button" aria-label="Notifikasi" onClick={()=>navigate('pesan')}><Bell size={20}/>{profile.notifications?.some((n:any)=>!n.read)&&<i className="notification-dot"/>}</button></div></header>
    <div className="lobby-content">
      <div className="lobby-greeting"><div><p className="eyebrow" data-testid="lobby-welcome">TEMPAT KECIL UNTUK KESERUAN BESAR</p><h1 data-testid="lobby-player-name">Hai, {user.name||profile.playerName||'Pemain'}<span className="greeting-dot">.</span></h1><p data-testid="lobby-subtitle">Satu ronde lagi? Temukan momen serumu hari ini.</p></div><button data-testid="lobby-profile" className="lobby-avatar" aria-label="Profil dan avatar" onClick={()=>navigate('profile')}><DynamicIcon name={profile.activeAvatarId||'avatar_male'} className="w-full h-full"/><span><Sparkles size={14}/></span></button></div>
      <div className="lobby-layout"><div className="lobby-main">
        <button data-testid="lobby-play" className="play-hero" onClick={()=>navigate('levels')}><div className="hero-copy"><span className="hero-tag"><span/>WAKTUNYA MAIN</span><h2>Kecil tantangannya.<br/>Besar serunya.</h2><p>Onet, balok, dan kejutan berikutnya.</p><span className="hero-cta">Ayo main<ArrowUpRight size={22}/></span></div><div className="hero-art"><img src="/art/candy/0.webp" className="art-donut" alt="Donat warna-warni"/><img src="/art/space/0.webp" className="art-rocket" alt="Roket mainan"/><img src="/art/ocean/1.webp" className="art-octopus" alt="Gurita lucu"/><span className="art-spark"><Sparkles size={25}/></span></div></button>
        <div className="section-heading"><h2 data-testid="lobby-explore-heading">Bikin setiap ronde berarti</h2><span className="eyebrow">PLAY. COLLECT. REPEAT.</span></div>
        <div className="lobby-feature-grid">{links.map(l=><button key={l.id} data-testid={`lobby-${l.id}`} className={`feature-link ${l.color}`} onClick={()=>navigate(l.id as any)}><DynamicIcon name={l.asset} LucideFallback={l.icon} className="feature-image"/><b>{l.name}</b><small>{l.caption}</small>{l.badge>0&&<span className="count-badge">{l.badge}</span>}</button>)}</div>
      </div><aside className="lobby-side">
        <button data-testid="lobby-challenges" className="challenge-invite" onClick={()=>navigate('challenges')}><div><span className="new-label">2 MINI GAME BARU</span><h2>Coba hal baru.</h2><p>Latih ingatan. Temukan trio.<br/>Taklukkan tantangannya.</p><span className="text-button">Jelajahi tantangan<ArrowUpRight size={17}/></span></div><img src="/art/avatars/4.webp" alt="Bolt, teman tantangan"/></button>
        <div className="chest-panel"><div className="section-heading"><h2 data-testid="lobby-chest-heading">Peti kecil, kejutan besar</h2><Gift size={19}/></div><div className="lobby-chests">{slots.map((chest:any,i:number)=><button key={i} data-testid={`lobby-chest-slot-${i}`} onClick={()=>navigate('peti')} className={chest?'occupied':''}><DynamicIcon name={chest?`chest_${chest.type}`:'collection_chest'} className="w-12 h-12"/><span>{chest?(isChestReady(chest)?'Buka peti':'Membuka…'):'Slot kosong'}</span></button>)}</div><button data-testid="lobby-chest-progress" className="chest-progress-link" onClick={()=>navigate('peti')}><span><b>{Math.min(profile.chestProgress||0,CHEST_POINTS_REQUIRED)}/{CHEST_POINTS_REQUIRED}</b> progres peti berikutnya</span><ChevronRight size={17}/></button></div>
        <EconomyMeter compact id="lobby-income"/>
      </aside></div>
      <footer className="club-footer" data-testid="lobby-footer"><span>MAIN SANTAI, PROGRES NYATA.</span><span>Tanpa hadiah koin berlebihan. Cukup keseruan.</span></footer>
    </div>
  </main>;
};