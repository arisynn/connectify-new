import React,{useState} from 'react';
import {Edit3,BarChart2,ChevronRight,Settings,Receipt,Sparkles,Trophy} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {AccountProgress} from '../components/AccountProgress';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {getAccountProgress,XP_RANKS} from '../core/progression';
import {PlayerPortrait} from '../components/PlayerPortrait';
import '../simple-club.css';
export const ProfileScreen=()=>{
  const {navigate,user}=useGame(),{profile}=useProfile(),p=getAccountProgress(profile),s=profile.statistics||{},[ranks,setRanks]=useState(false);
  const links=[{id:'koleksi',name:'Koleksi',icon:Sparkles},{id:'statistik',name:'Statistik permainan',icon:BarChart2},{id:'ledger',name:'Riwayat permen',icon:Receipt},{id:'settings',name:'Pengaturan',icon:Settings}];
  return <GameShell title="Profil" eyebrow="CONNECTIFY CLUB"><div className="simple-profile">
    <section className="simple-profile-identity" data-testid="profile-passport"><button className="simple-profile-avatar" data-testid="profile-edit-avatar" aria-label="Ganti foto profil" onClick={()=>navigate('edit-avatar')}><PlayerPortrait id="profile-portrait"/><i><Edit3 size={15}/></i></button><div><h2 data-testid="profile-player-name">{profile.playerName||user.name}</h2><p data-testid="profile-account-title">{p.title} · Level {p.level}</p><button className="text-button" data-testid="profile-edit-button" onClick={()=>navigate('edit-avatar')}>Edit profil <Edit3 size={13}/></button></div></section>
    <AccountProgress id="profile-xp"/>
    <div className="simple-profile-stats">{[{label:'Ronde',value:s.totalGames||0,id:'games'},{label:'Menang',value:s.totalWins||0,id:'wins'},{label:'Skor total',value:(s.totalScore||0).toLocaleString('id-ID'),id:'score'}].map(item=><div key={item.id} data-testid={`profile-stat-${item.id}`}><b>{item.value}</b><span>{item.label}</span></div>)}</div>
    <nav className="simple-profile-menu" data-testid="profile-menu">{links.map(link=><button key={link.id} data-testid={`profile-${link.id}-link`} onClick={()=>navigate(link.id as any)}><link.icon size={20}/><span>{link.name}</span><ChevronRight size={18}/></button>)}<button data-testid="profile-ranks-toggle" aria-expanded={ranks} onClick={()=>setRanks(!ranks)}><Trophy size={20}/><span>Gelar anggota</span><ChevronRight size={18} style={{transform:ranks?'rotate(90deg)':''}}/></button></nav>
    {ranks&&<div className="rank-journey" data-testid="account-rank-journey">{XP_RANKS.map(rank=><div key={rank.level} className={p.level>=rank.level?'unlocked':''} data-testid={`account-rank-${rank.level}`}><Trophy size={16}/><div><b>{rank.title}</b><small>Level {rank.level}</small></div></div>)}</div>}
  </div></GameShell>;
};