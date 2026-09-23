import React,{useState} from 'react';
import {Play,Target,Trophy,ShoppingBag,BarChart2,ArrowLeft,ArrowUpRight,Wrench,Palette} from 'lucide-react';
import {useGame} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useTheme} from '../core/theme/ThemeProvider';
import {MissionPanel,readyMissionCount} from '../components/MissionPanel';
import {AchievementPanel,readyAchievementCount} from '../components/AchievementPanel';
import {ShopPanel} from '../components/ShopPanel';
import {GAMES} from '../core/games';
import {artIcon} from '../core/artAssets';
import {KineticModal} from '../designs/KineticPopups';
import '../game-hub.css';
const tabs=[['main','Main',Play],['misi','Misi',Target],['prestasi','Pencapaian',Trophy],['toko','Toko',ShoppingBag],['statistik','Statistik',BarChart2]] as const;

// Opening a game feels like entering its own site: own palette, cover art, menu and shop. Only Permen is shared with the hub.
export const GameHubScreen=()=>{
  const {activeGame,navigate,setGameMode}=useGame(),{profile,updateProfile}=useProfile(),{activeTheme}=useTheme(),game=GAMES[activeGame];
  const [leaving,setLeaving]=useState(false);
  const [tab,setTab]=useState(()=>{const saved=sessionStorage.getItem('game-hub-tab');return tabs.some(t=>t[0]===saved)?saved!:'main';});
  const badges:Record<string,number>={misi:readyMissionCount(profile,game.id),prestasi:readyAchievementCount(profile,game.id)};
  const start=(mode:any)=>{setGameMode(mode.mode);if(game.id==='onet')updateProfile({currentLevel:profile.highestLevel||1});if(game.id==='block')updateProfile({blockPuzzleLevel:Math.max(profile.blockPuzzleLevel||1,profile.highestBlockPuzzleLevel||1)});navigate(mode.route);};
  const change=(id:string)=>{setTab(id);sessionStorage.setItem('game-hub-tab',id);};
  const modes=game.modes(profile),title=tab==='main'?null:tabs.find(t=>t[0]===tab)![1];
  return <main className={`game-page font-${game.font}`} style={game.palette as React.CSSProperties} data-testid={`game-hub-${game.id}`} data-game={game.id}>
    <header className="gp-bar"><button className="gp-exit-icon" data-testid="game-hub-back" aria-label="Kembali ke Hub" title="Kembali ke Hub" onClick={()=>setLeaving(true)}><ArrowLeft size={20}/></button><button className="gp-brand" data-testid="game-hub-brand" onClick={()=>change('main')}><img src={artIcon(game.art)} alt=""/><span><small>{game.eyebrow}</small><b data-testid="game-hub-title">{game.name}</b></span></button>
      <span className="gp-wallet" data-testid="shell-balance"><img src={artIcon('permen')} alt="Permen"/><b>{profile.coins}</b></span></header>
    <div className="gp-scroll">
      {tab==='main'?<>
        <section className="gp-hero" data-testid="game-hub-main"><div className="gp-hero-copy"><span className="gp-eyebrow" data-testid="game-hub-status">{game.status(profile)}</span><h1 data-testid="game-hub-tagline">{game.tagline}</h1><p data-testid="game-hub-copy">{game.copy}</p>
          <div className="gp-modes">{modes.map((mode,i)=><button key={mode.id} className={`gp-mode ${i===0?'primary':''}`} data-testid={`game-hub-mode-${mode.id}`} onClick={()=>start(mode)}>{mode.id==='hangar'?<Wrench size={20}/>:<Play size={20} fill="currentColor"/>}<span><b>{mode.label}</b><small>{mode.sub}</small></span><ArrowUpRight size={18}/></button>)}
            {game.id==='onet'&&<button className="gp-mode" data-testid="game-hub-theme" onClick={()=>navigate('tema')}><Palette size={20}/><span><b>Tema: {activeTheme.name}</b><small>Ganti gambar tile</small></span><ArrowUpRight size={18}/></button>}</div></div>
          <div className="gp-cover" aria-hidden="true">{game.cover.map((src,i)=><img key={src} src={src} alt="" style={{'--i':i} as React.CSSProperties}/>)}</div></section>
      </>:<section className="gp-panel"><h2 className="gp-panel-title" data-testid="game-hub-panel-title">{title} {game.name}</h2>
        {tab==='misi'&&<MissionPanel game={game.id}/>}
        {tab==='prestasi'&&<AchievementPanel game={game.id}/>}
        {tab==='toko'&&<ShopPanel game={game.id}/>}
        {tab==='statistik'&&<div className="gp-stats" data-testid="game-hub-stats">{game.stats(profile).map(([label,value])=><div key={label} data-testid={`game-stat-${label.toLowerCase().replace(/\s/g,'-')}`}><b>{value}</b><span>{label}</span></div>)}</div>}
      </section>}
      <footer className="gp-foot"><small data-testid="game-hub-foot-note">{game.name} · Connectify Play Club · Saldo Permen dibagikan dengan Hub</small></footer>
    </div>
    <KineticModal isOpen={leaving} onClose={()=>setLeaving(false)} title="Kembali ke Hub"><div className="gp-leave" data-testid="game-hub-leave-dialog"><img src={artIcon(game.art)} alt=""/><span className="gp-eyebrow" data-testid="game-hub-leave-caption">KELUAR DARI {game.name.toUpperCase()}</span><h2 data-testid="game-hub-leave-title">Kembali ke Hub sekarang?</h2><p data-testid="game-hub-leave-copy">Progres, misi, dan Permen kamu sudah tersimpan di akun. Kamu bisa kembali kapan saja.</p><div className="gp-leave-actions"><button className="pop-button mint" data-testid="game-hub-leave-confirm" onClick={()=>{setLeaving(false);navigate('home');}}><ArrowLeft size={17}/>Ya, ke Hub</button><button className="text-button" data-testid="game-hub-leave-cancel" onClick={()=>setLeaving(false)}>Tetap di {game.name}</button></div></div></KineticModal>
    <nav className="gp-tabbar" aria-label={`Menu bawah ${game.name}`} data-testid="game-hub-tabs">{tabs.map(([id,label,Icon])=><button key={id} aria-current={tab===id?'page':undefined} className={tab===id?'active':''} data-testid={`game-hub-tab-${id}`} onClick={()=>change(id)}><Icon size={19}/><span>{label}</span>{badges[id]>0&&<b data-testid={`game-hub-badge-${id}`}>{badges[id]}</b>}</button>)}</nav>
  </main>;
};
