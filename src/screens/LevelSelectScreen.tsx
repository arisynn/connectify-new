import React from 'react';
import {ArrowUpRight,Palette} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useGame,GameMode,Screen} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {useTheme} from '../core/theme/ThemeProvider';
import {getOnetDifficulty} from '../core/difficulty';
import {artIcon} from '../core/artAssets';
export const LevelSelectScreen=()=>{
  const {navigate,setGameMode}=useGame(),{profile,updateProfile}=useProfile(),{activeTheme}=useTheme();
  const games=[
    {id:'onet',route:'play',mode:'normal',name:'Onet',tag:`LEVEL ${profile.highestLevel||1} · ${getOnetDifficulty(profile.highestLevel).label}`,copy:'Pasangkan gambar. Pecahkan lapisan. Bersihkan papan.',art:'onet',color:'rose'},
    {id:'block',route:'block-puzzle',mode:'normal',name:'Block Puzzle',tag:`LEVEL ${profile.blockPuzzleLevel||1}`,copy:'Susun balok dan tuntaskan target setiap papan.',art:'block',color:'mint'},
    {id:'memory',route:'memory',mode:'normal',name:'Memory Flip',tag:'3 KESULITAN · KARTU BERGAMBAR',copy:'Ingat cuplikan awal. Balik kartu. Rangkai combo pasangan.',art:'memory',color:'butter'},
    {id:'triple',route:'triple',mode:'normal',name:'Triple Match',tag:'12 TRIO · 7 SLOT',copy:'Pilih tile teratas. Satukan tiga gambar tanpa memenuhi slot.',art:'triple',color:'rose'},
    {id:'fruit',route:'fruit-merge',mode:'normal',name:'Fruit Merge',tag:'BARU · 12 TINGKAT BUAH',copy:'Jatuhkan, tumpuk, dan gabungkan. Dari ceri jadi semangka.',art:'fruit-merge',color:'butter'},
    {id:'infinity',route:'block-puzzle',mode:'infinity',name:'Block Infinity',tag:`REKOR ${(profile.statistics?.infinityHighScore||0).toLocaleString('id-ID')}`,copy:'Tanpa timer. Bertahan selama masih ada ruang.',art:'block',color:'sky'},
    {id:'sprint',route:'play',mode:'daily',name:'Onet Sprint',tag:'PAPAN HARIAN · 90 DETIK',copy:'Papan baru setiap hari untuk mengasah kecepatanmu.',art:'onet',color:'butter'},
    {id:'friends',route:'multiplayer',mode:'normal',name:'Main bareng',tag:'DUEL TEMAN',copy:'Buat ruang atau bergabung menggunakan kode teman.',art:'multiplayer',color:'mint'}
  ];
  const start=(game:any)=>{setGameMode(game.mode as GameMode);if(game.id==='onet')updateProfile({currentLevel:profile.highestLevel||1});navigate(game.route as Screen);};
  return <GameShell title="Pilih permainan" eyebrow="SATU KLUB. SEMUA GAME FAVORITMU." wide>
    <div className="play-library-heading"><p className="page-lede" data-testid="games-intro">Pilih keseruanmu hari ini. Setiap game mengisi progres yang sama.</p><button className="active-theme-link" data-testid="games-theme-select" onClick={()=>navigate('tema')}><img src={Object.values(activeTheme.assets.tiles)[0]} alt=""/><span><small>TEMA AKTIF</small><b data-testid="games-active-theme">{activeTheme.name}</b></span><Palette size={18}/></button></div>
    <div className="play-library">{games.map((game,i)=><button data-testid={`play-${game.id}`} key={game.id} className={`play-library-card ${game.color}`} onClick={()=>start(game)}><span className="play-library-art"><img data-testid={`play-art-${game.id}`} src={artIcon(game.art)} alt={game.name}/></span><span className="play-library-copy"><small data-testid={`play-tag-${game.id}`}>{game.tag}</small><b data-testid={`play-name-${game.id}`}>{game.name}</b><span data-testid={`play-description-${game.id}`}>{game.copy}</span></span><ArrowUpRight size={21}/></button>)}</div>
  </GameShell>;
};