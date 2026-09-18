import React from 'react';
import { Bell, Gift, ChevronRight, Sparkles, Candy } from 'lucide-react';
import { useGame } from './GameContext';
import { useProfile } from './core/profile/ProfileContext';
import { AccountProgress } from './components/AccountProgress';
import { isChestReady } from './core/chest';
import { PlayerPortrait } from './components/PlayerPortrait';
import { checkDailyMissions } from './core/misiHarian';
export const MainLobby=()=>{
  const {navigate}=useGame(),{profile}=useProfile(),s=profile.statistics||{};
  const ready=(profile.chestSlots||[]).filter((c:any)=>c&&isChestReady(c)).length;
  const missions=checkDailyMissions(profile).activeMissions.filter((m:any)=>m.progress>=m.target&&!m.claimed).length;
  return <main className="home-v3" data-testid="main-lobby"><div className="home-v3-inner">
    <header className="home-v3-header"><span data-testid="home-wordmark">the play club<span>CONNECTIFY</span></span><span className="home-wallet" data-testid="home-balance"><Candy size={17}/>{profile.coins||0}</span><button className="round-button" data-testid="lobby-notifications" aria-label="Notifikasi" onClick={()=>navigate('pesan')}><Bell size={20}/></button></header>
    <section className="home-welcome"><div><span className="eyebrow" data-testid="home-greeting-label">SENANG KAMU KEMBALI</span><h1 data-testid="lobby-player-name" title={profile.playerName}>Hai, {profile.playerName||'Pemain'}.</h1><p data-testid="home-welcome-copy">Nggak harus buru-buru. Nikmati jedanya.</p></div><PlayerPortrait id="home-portrait"/></section>
    <div className="home-editorial-grid"><section className="home-feature" data-testid="home-feature"><span className="home-sticker" data-testid="home-sticker"><Sparkles size={13}/>A LITTLE BREAK, A LOT OF JOY</span><div className="home-feature-copy"><h2 data-testid="home-headline">Pikiran rehat.<br/><em>Serunya jalan.</em></h2><p data-testid="home-feature-copy">Pasangan yang ketemu.<br/>Garis yang bersih.<br/>Hal kecil yang bikin senang.</p></div><div className="home-art" aria-hidden="true"><span className="art-orbit"/><img src="/art/atelier/mochi.svg" className="home-mochi" alt=""/><img src="/art/candy/0.webp" className="home-donut" alt=""/><img src="/art/space/0.webp" className="home-rocket" alt=""/><span className="home-art-star"><Sparkles size={23}/></span></div><div className="home-feature-foot" data-testid="home-feature-foot"><span>BUAT WAKTU UNTUK DIRIMU</span><span>01 / PLAY CLUB</span></div></section>
    <aside className="home-digest"><AccountProgress id="home-xp"/><div className="home-stats">{[{id:'rounds',n:s.totalGames||0,label:'Ronde dimainkan'},{id:'record',n:s.infinityHighScore||0,label:'Rekor Infinity'},{id:'missions',n:missions,label:'Misi siap diklaim'}].map(item=><div key={item.id} data-testid={`home-stat-${item.id}`}><b>{item.n.toLocaleString('id-ID')}</b><span>{item.label}</span></div>)}</div><button data-testid="home-chests" className="home-chest-link" onClick={()=>navigate('peti')}><span className="chest-icon"><Gift size={25}/></span><span><b>Pojok hadiah</b><small>{ready?`${ready} peti siap dibuka`:'Peti kecil untuk progres besarmu'}</small></span><ChevronRight size={18}/></button><div className="home-note" data-testid="home-note"><span>CATATAN KLUB</span><p>Main untuk bersenang-senang.<br/>Bukan untuk buru-buru menang.</p><i>take your time.</i></div></aside></div>
    <footer className="home-v3-footer" data-testid="home-footer">Satu klub. Banyak cara menikmati jeda.</footer>
  </div></main>;
};