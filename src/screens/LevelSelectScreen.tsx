import React from 'react';
import { Play, ArrowUpRight, Users, Sparkles } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { useGame } from '../GameContext';
import { useProfile } from '../core/profile/ProfileContext';

export const LevelSelectScreen=()=>{
  const {navigate,setGameMode}=useGame(),{profile,updateProfile}=useProfile();
  const play=(game:'play'|'block-puzzle')=>{setGameMode('normal');if(game==='play')updateProfile({currentLevel:profile.highestLevel||1});navigate(game);};
  return <GameShell title="Pilih keseruanmu" eyebrow="PERMAINAN UTAMA" wide>
    <p data-testid="games-intro" className="page-lede">Fokus sebentar. Lupakan sibuknya hari.</p>
    <div className="game-cards"><article className="game-card onet"><div className="game-card-art"><img src="/art/candy/0.webp" alt="Donat"/><img src="/art/candy/2.webp" alt="Cupcake"/><img src="/art/candy/0.webp" alt="Pasangan donat"/></div><span className="eyebrow">TEMUKAN PASANGANNYA</span><h2 data-testid="onet-card-title">Onet Classic</h2><p>Hubungkan gambar yang sama. Kenali tile gabungan dan bersihkan papan.</p><div className="game-card-meta" data-testid="onet-level">Level {profile.highestLevel||1}<span>Grid tetap · Combo</span></div><button data-testid="play-onet" className="pop-button pink" onClick={()=>play('play')}><Play size={18}/>Main Onet</button></article>
    <article className="game-card block"><div className="game-card-art block-art" aria-hidden="true">{[0,1,2].map(n=><div key={n} className={`block-art-piece piece-${n}`}>{[0,1,2,3].map(i=><i key={i}/>)}</div>)}</div><span className="eyebrow">SUSUN. BERSIHKAN. ULANGI.</span><h2 data-testid="block-card-title">Block Puzzle</h2><p>Temukan tempat terbaik untuk setiap balok. Bersihkan garis dan kejar tiga bintang.</p><div className="game-card-meta" data-testid="block-level">Level {profile.blockPuzzleLevel||1}<span>Strategi · Tanpa timer</span></div><button data-testid="play-block" className="pop-button mint" onClick={()=>play('block-puzzle')}><Play size={18}/>Main Block Puzzle</button></article></div>
    <button data-testid="open-challenges" className="hub-banner" onClick={()=>navigate('challenges')}><Sparkles size={30}/><span><b>Pusat Tantangan</b><small>Memory Flip, Triple Match, dan Onet Sprint.</small></span><span className="new-label">BARU</span><ArrowUpRight size={22}/></button>
    <button data-testid="open-multiplayer" className="hub-banner secondary" onClick={()=>navigate('multiplayer')}><Users size={25}/><span><b>Main bersama teman</b><small>Buat ruang atau bergabung dengan kode.</small></span><ArrowUpRight size={22}/></button>
  </GameShell>;
};