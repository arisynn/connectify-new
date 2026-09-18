import React from 'react';
import { ArrowRight, Timer, Layers, Brain, Zap } from 'lucide-react';
import { GameShell } from '../components/GameShell';
import { useGame } from '../GameContext';
import { useProfile } from '../core/profile/ProfileContext';

export const ChallengeScreen=()=>{
  const {navigate,setGameMode}=useGame(),{profile}=useProfile();
  const games=[{id:'memory',title:'Memory Flip',subtitle:'Seberapa tajam ingatanmu?',desc:'Balik kartu, ingat posisinya, temukan 8 pasangan.',img:'/art/avatars/7.webp',tag:'90 DETIK',icon:Brain,color:'sky',wins:profile.statistics?.memoryWins||0}, {id:'triple',title:'Triple Match',subtitle:'Tiga adalah angka ajaib.',desc:'Ambil tile dari tumpukan. Cocokkan trio sebelum slot penuh.',img:'/art/avatars/5.webp',tag:'7 SLOT · 12 TRIO',icon:Layers,color:'pink',wins:profile.statistics?.tripleWins||0}, {id:'play',title:'Onet Sprint',subtitle:'Pasangan cepat, pikiran sigap.',desc:'Papan menantang dengan kelompok tile gabungan.',img:'/art/avatars/3.webp',tag:'90 DETIK',icon:Zap,color:'butter',wins:profile.statistics?.dailyChallengesWon||0}];
  return <GameShell title="Pusat Tantangan" eyebrow="HAL BARU. KESERUAN BARU." back="levels" wide>
    <div className="challenge-intro" data-testid="challenge-intro"><span className="new-label">COBA SESUATU YANG BERBEDA</span><h2>Tantangan kecil.<br/>Rasa puas yang besar.</h2><p>Semua permainan terhubung ke misi, pencapaian, dan progres peti yang sama.</p></div>
    <div className="challenge-grid">{games.map(g=><article className={`challenge-card ${g.color}`} key={g.id} data-testid={`challenge-card-${g.id}`}><div className="challenge-card-top"><g.icon size={22}/><span className="eyebrow">{g.tag}</span></div><img className="challenge-avatar" src={g.img} alt={`Teman ${g.title}`}/><h2>{g.title}</h2><b>{g.subtitle}</b><p>{g.desc}</p><span className="challenge-wins" data-testid={`challenge-wins-${g.id}`}>{g.wins} kemenangan tercatat</span><button data-testid={`challenge-play-${g.id}`} className="pop-button" onClick={()=>{setGameMode('daily');navigate(g.id as any);}}>Mulai tantangan<ArrowRight size={17}/></button></article>)}</div>
    <div className="notice-card" data-testid="challenge-reward-note"><Timer size={21}/><p>Main berulang untuk meningkatkan kemampuan. Permen hanya diklaim dari peti, misi, atau pencapaian; maksimal 100 per hari.</p></div>
  </GameShell>;
};