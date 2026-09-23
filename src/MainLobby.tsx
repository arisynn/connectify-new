import React from 'react';
import { ChevronRight, Users, Bell } from 'lucide-react';
import { useGame } from './GameContext';
import { useProfile } from './core/profile/ProfileContext';
import { AccountProgress } from './components/AccountProgress';
import { PlayerPortrait } from './components/PlayerPortrait';
import { LoginRewardCard } from './components/LoginRewardCard';
import { BRAND_MARK, artIcon } from './core/artAssets';
import { readyMissionCount } from './components/MissionPanel';
import { readyAchievementCount } from './components/AchievementPanel';
import { GAMES, GAME_ORDER } from './core/games';
import './game-hub.css';

// Poki-style portal: a wall of game covers. Tapping one opens that game's own site; only the Permen wallet is shared.
export const MainLobby=()=>{
  const {navigate,openGame}=useGame(),{profile}=useProfile();
  const hubReady=readyAchievementCount(profile,'hub');
  return <main className="poki" data-testid="main-lobby">
    <header className="poki-bar"><span className="poki-brand"><img data-testid="home-brand-mark" className="club-mark" src={BRAND_MARK} alt="Connectify Club"/><span data-testid="home-wordmark">the play club<span>CONNECTIFY</span></span></span>
      <span className="poki-wallet" data-testid="home-balance"><img src={artIcon('permen')} alt="Permen"/>{profile.coins||0}</span>
      <button className="round-button" data-testid="lobby-notifications" aria-label="Notifikasi" onClick={()=>navigate('pesan')}><Bell size={19}/></button>
      <button className="poki-portrait" data-testid="home-profile" aria-label="Profil" onClick={()=>navigate('profile')}><PlayerPortrait id="home-portrait"/></button></header>
    <div className="poki-scroll">
      <section className="poki-welcome"><div><span className="eyebrow" data-testid="home-greeting-label">GAME HUB</span><h1 data-testid="lobby-player-name" title={profile.playerName}>Hai, {profile.playerName||'Pemain'}. Mau main apa?</h1><p data-testid="home-welcome-copy">Setiap game punya dunia, misi, pencapaian, dan tokonya sendiri.</p></div><AccountProgress id="home-xp"/></section>
      <section className="poki-strip"><LoginRewardCard/><button className="poki-club-card" data-testid="home-achievements" onClick={()=>navigate('prestasi')}><img src={artIcon('achievements')} alt=""/><span><b>Pencapaian klub</b><small data-testid="home-achievement-status">{hubReady?`${hubReady} hadiah siap diklaim`:'Jejak lintas game & hadiah login'}</small></span><ChevronRight size={18}/></button></section>
      <h2 className="poki-heading" data-testid="hub-games-heading">Semua game</h2>
      <section className="poki-grid" data-testid="hub-games" aria-label="Pilih game">{GAME_ORDER.map(id=>{const game=GAMES[id],ready=readyMissionCount(profile,id)+readyAchievementCount(profile,id);return <button key={id} className={`poki-tile font-${game.font}`} style={game.palette as React.CSSProperties} data-testid={`hub-game-${id}`} onClick={()=>openGame(id)}>
        <span className="poki-cover" aria-hidden="true">{game.cover.slice(0,4).map((src,i)=><img key={src} src={src} alt="" style={{'--i':i} as React.CSSProperties}/>)}</span>
        {ready>0&&<i className="poki-badge" data-testid={`hub-game-badge-${id}`} aria-label={`${ready} hadiah siap`}>{ready}</i>}
        <span className="poki-label"><img src={artIcon(game.art)} alt=""/><span><b data-testid={`hub-game-name-${id}`}>{game.name}</b><small data-testid={`hub-game-status-${id}`}>{game.status(profile)}</small></span></span></button>;})}
        <button className="poki-tile friends" data-testid="hub-game-multiplayer" onClick={()=>navigate('multiplayer')}><span className="poki-cover friends" aria-hidden="true"><Users size={54} strokeWidth={1.4}/></span><span className="poki-label"><span><b>Main bareng</b><small>DUEL TEMAN · KODE RUANG</small></span></span></button>
      </section>
      <footer className="poki-foot" data-testid="home-footer">Satu saldo Permen. Banyak game. Semua tersimpan di akunmu.</footer>
    </div>
  </main>;
};
