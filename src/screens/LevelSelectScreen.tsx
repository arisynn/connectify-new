import React from 'react';
import {ArrowUpRight,Infinity as InfinityIcon,Layers,Brain,Timer,Users,Grid3X3} from 'lucide-react';
import {GameShell} from '../components/GameShell';
import {useGame,GameMode,Screen} from '../GameContext';
import {useProfile} from '../core/profile/ProfileContext';
import {getOnetDifficulty} from '../core/difficulty';
import {artIcon} from '../core/artAssets';
export const LevelSelectScreen=()=>{
  const {navigate,setGameMode}=useGame(),{profile,updateProfile}=useProfile();
  const games=[
    {id:'onet',route:'play',mode:'normal',name:'Onet',tag:`LEVEL ${profile.highestLevel||1} · ${getOnetDifficulty(profile.highestLevel).label}`,copy:'Temukan pasangan. Ikuti arah. Pecahkan lapisannya.',asset:'/art/candy/0.webp',icon:Layers,color:'rose'},
    {id:'block',route:'block-puzzle',mode:'normal',name:'Block Puzzle',tag:`LEVEL ${profile.blockPuzzleLevel||1}`,copy:'Susun balok klasik dan tuntaskan target papan.',asset:'/art/atelier/ceramic.svg',icon:Grid3X3,color:'mint'},
    {id:'infinity',route:'block-puzzle',mode:'infinity',name:'Block Infinity',tag:`REKOR ${(profile.statistics?.infinityHighScore||0).toLocaleString('id-ID')}`,copy:'Tanpa timer, tanpa batas level. Bertahan selama masih ada tempat.',asset:'/art/atelier/jelly.svg',icon:InfinityIcon,color:'sky'},
    {id:'memory',route:'memory',mode:'normal',name:'Memory Flip',tag:'8 PASANGAN',copy:'Balik kartu dan latih ingatanmu.',asset:'/art/avatars/7.webp',icon:Brain,color:'butter'},
    {id:'triple',route:'triple',mode:'normal',name:'Triple Match',tag:'7 SLOT',copy:'Kumpulkan tiga gambar sama sebelum slot penuh.',asset:'/art/avatars/5.webp',icon:Layers,color:'rose'},
    {id:'sprint',route:'play',mode:'daily',name:'Onet Sprint',tag:'PAPAN HARIAN · 90 DETIK',copy:'Satu tantangan harian, seberapa cepat kamu?',asset:'/art/space/0.webp',icon:Timer,color:'sky'},
    {id:'friends',route:'multiplayer',mode:'normal',name:'Main bareng',tag:'DUEL TEMAN',copy:'Buat ruang atau masuk dengan kode teman.',asset:'/art/atelier/orbit.svg',icon:Users,color:'mint'}
  ];
  const start=(game:any)=>{setGameMode(game.mode as GameMode);if(game.id==='onet')updateProfile({currentLevel:profile.highestLevel||1});navigate(game.route as Screen);};
  return <GameShell title="Mau main apa?" eyebrow="PILIH SESUAI SUASANA HATI" wide><p className="page-lede" data-testid="games-intro">Satu tempat untuk semua permainanmu.</p><div className="play-library">{games.map(game=><button data-testid={`play-${game.id}`} key={game.id} className={`play-library-card ${game.color}`} onClick={()=>start(game)}><span className="play-library-art"><img data-testid={`play-art-${game.id}`} src={artIcon(({infinity:'block',sprint:'onet',friends:'multiplayer'} as any)[game.id]||game.id)} alt={game.name}/>{['infinity','sprint'].includes(game.id)&&<game.icon size={18}/>}</span><span className="play-library-copy"><small data-testid={`play-tag-${game.id}`}>{game.tag}</small><b data-testid={`play-name-${game.id}`}>{game.name}</b><span>{game.copy}</span></span><ArrowUpRight size={21}/></button>)}</div></GameShell>;
};