import React from 'react';
import { Edit3, Trophy, BarChart2, ChevronRight, Palette, Settings, Receipt, Sparkles, LockKeyhole } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { AccountProgress } from '../components/AccountProgress';
import { useGame } from '../GameContext';
import { useProfile } from '../core/profile/ProfileContext';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { getAccountProgress, XP_RANKS } from '../core/progression';
import { PlayerPortrait } from '../components/PlayerPortrait';

export const ProfileScreen=()=>{
  const {navigate,user}=useGame(),{profile}=useProfile(),p=getAccountProgress(profile),s=profile.statistics||{};
  const links=[{id:'statistik',name:'Statistik permainan',sub:'Lihat perkembangan setiap game',icon:BarChart2},{id:'ledger',name:'Riwayat Permen',sub:'Semua hadiah dan belanja tercatat',icon:Receipt},{id:'settings',name:'Pengaturan',sub:'Musik, efek suara, dan tampilan',icon:Settings}];
  return <GameShell title="Profil pemain" eyebrow="KARTU ANGGOTA KLUB">
    <section className="profile-passport" data-testid="profile-passport"><span className="eyebrow" data-testid="profile-membership">CONNECTIFY PLAY CLUB</span><button className="passport-avatar" data-testid="profile-edit-avatar" aria-label="Pilih avatar pencapaian" onClick={()=>navigate('edit-avatar')}><PlayerPortrait id="profile-portrait"/><i><Edit3 size={15}/></i></button><h2 data-testid="profile-player-name">{profile.playerName||user.name}</h2><span className="profile-title" data-testid="profile-account-title"><Sparkles size={13}/>{p.title}</span><AccountProgress id="profile-xp"/></section>
    <div className="profile-stats">{[{label:'Ronde dimainkan',value:s.totalGames||0,id:'games'},{label:'Kemenangan',value:s.totalWins||0,id:'wins'},{label:'Kombo terbaik',value:`×${s.highestCombo||0}`,id:'combo'}].map(item=><div key={item.id} data-testid={`profile-stat-${item.id}`}><b>{item.value}</b><span>{item.label}</span></div>)}</div>
    <div className="section-heading"><h2 data-testid="profile-journey-title">Perjalanan anggota</h2><span className="eyebrow">TERUS BERTUMBUH</span></div>
    <div className="rank-journey" data-testid="account-rank-journey">{XP_RANKS.map(rank=><div key={rank.level} className={p.level>=rank.level?'unlocked':''} data-testid={`account-rank-${rank.level}`}><span>{p.level>=rank.level?<Trophy size={17}/>:<LockKeyhole size={16}/>}</span><div><b>{rank.title}</b><small>Level {rank.level}</small></div>{p.title===rank.title&&<i>Gelar saat ini</i>}</div>)}</div>
    <p className="fine-print" data-testid="account-xp-help">Menang: 100 XP + bonus presisi dan kombo. Ronde belum menang tetap memberi XP sesuai skor. Klaim misi untuk XP tambahan.</p>
    <div className="profile-menu" data-testid="profile-menu">{links.map(link=><button key={link.id} data-testid={`profile-${link.id}-link`} onClick={()=>navigate(link.id as any)}><link.icon size={21}/><span><b>{link.name}</b><small>{link.sub}</small></span><ChevronRight size={18}/></button>)}</div>
  </GameShell>;
};