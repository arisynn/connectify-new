import React from 'react';
import { Bell, Gift, ChevronRight, Sparkles, Candy } from 'lucide-react';
import { useGame } from './GameContext';
import { useProfile } from './core/profile/ProfileContext';
import { AccountProgress } from './components/AccountProgress';
import { isChestReady } from './core/chest';
import { PlayerPortrait } from './components/PlayerPortrait';
import { checkDailyMissions } from './core/misiHarian';
import { BRAND_MARK, artIcon } from './core/artAssets';
import {getClaimableAchievements} from './core/achievements';
export const MainLobby=()=>{
  const {navigate}=useGame(),{profile}=useProfile(),s=profile.statistics||{};
  const ready=(profile.chestSlots||[]).filter((c:any)=>c&&isChestReady(c)).length;
  const missions=checkDailyMissions(profile).activeMissions.filter((m:any)=>m.progress>=m.target&&!m.claimed).length;
  const achievements=getClaimableAchievements(profile).length;
  return <main className="home-v3" data-testid="main-lobby"><div className="home-v3-inner">
    <header className="home-v3-header"><img data-testid="home-brand-mark" className="club-mark" src={BRAND_MARK} alt="Connectify Club"/><span data-testid="home-wordmark">the play club<span>CONNECTIFY</span></span><span className="home-wallet" data-testid="home-balance"><img src={artIcon('permen')} className="w-6 h-6 object-contain" alt="Permen"/>{profile.coins||0}</span><button className="round-button" data-testid="lobby-notifications" aria-label="Notifikasi" onClick={()=>navigate('pesan')}><img src={artIcon('notifications')} className="w-6 h-6 object-contain" alt=""/></button></header>
    <section className="home-welcome"><div><span className="eyebrow" data-testid="home-greeting-label">SENANG KAMU KEMBALI</span><h1 data-testid="lobby-player-name" title={profile.playerName}>Hai, {profile.playerName||'Pemain'}.</h1><p data-testid="home-welcome-copy">Nggak harus buru-buru. Nikmati jedanya.</p></div><PlayerPortrait id="home-portrait"/></section>
    <div className="home-editorial-grid"><section className="home-feature" data-testid="home-feature"><span className="home-sticker" data-testid="home-sticker"><Sparkles size={13}/>A LITTLE BREAK, A LOT OF JOY</span><div className="home-feature-copy"><h2 data-testid="home-headline">Pikiran rehat.<br/><em>Serunya jalan.</em></h2><p data-testid="home-feature-copy">Pasangan yang ketemu.<br/>Garis yang bersih.<br/>Hal kecil yang bikin senang.</p></div><div className="home-art" aria-hidden="true"><img src="/art/premium/avatars/mochi.webp" className="home-mochi" alt=""/><img src="/art/premium/bakery/10.webp" className="home-donut" alt=""/><img src="/art/premium/galaxy/5.webp" className="home-rocket" alt=""/></div><div className="home-feature-foot" data-testid="home-feature-foot"><span>BUAT WAKTU UNTUK DIRIMU</span><span>01 / PLAY CLUB</span></div></section>
    <aside className="home-digest"><AccountProgress id="home-xp"/><div className="home-stats">{[{id:'rounds',n:s.totalGames||0,label:'Ronde dimainkan'},{id:'record',n:s.infinityHighScore||0,label:'Rekor Infinity'},{id:'missions',n:missions,label:'Misi siap diklaim'}].map(item=><div key={item.id} data-testid={`home-stat-${item.id}`}><b>{item.n.toLocaleString('id-ID')}</b><span>{item.label}</span></div>)}</div><button data-testid="home-chests" className="home-chest-link" onClick={()=>navigate('peti')}><span className="chest-icon"><img src="/art/premium/chests/common.webp" alt="" className="w-10 h-10 object-contain"/></span><span><b>Pojok hadiah</b><small>{ready?`${ready} peti siap dibuka`:'Peti kecil untuk progres besarmu'}</small></span><ChevronRight size={18}/></button><button className="home-achievement-link" data-testid="home-achievements" onClick={()=>navigate('prestasi')}><img src={artIcon('achievements')} alt=""/><span><b>Pencapaian</b><small data-testid="home-achievement-status">{achievements?`${achievements} hadiah siap diklaim`:'Lihat pencapaianmu'}</small></span><ChevronRight size={18}/></button></aside></div>
    <footer className="home-v3-footer" data-testid="home-footer">Satu klub. Banyak cara menikmati jeda.</footer>
  </div></main>;
};