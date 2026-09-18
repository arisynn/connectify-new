import React from 'react';
import { Pause, Play, RotateCcw, Trophy, Clock, Target, ArrowRight } from 'lucide-react';
import { GameShell } from '../../components/GameShell';
import { useGame } from '../../GameContext';

export const MiniGameFrame=({title,description,round,score,onRestart,children,extra}:any)=>{
  const {navigate}=useGame();
  return <GameShell title={title} eyebrow="TANTANGAN • MINI GAME" back="challenges">
    <p className="game-instructions" data-testid="minigame-instructions">{description}</p>
    <div className="mini-hud"><span data-testid="minigame-score"><Target size={17}/>{score}<small>skor</small></span><span data-testid="minigame-timer" className={round.time<=15?'danger':''}><Clock size={17}/>{round.time}s</span><button data-testid="minigame-pause" className="round-button" onClick={()=>round.setPaused(!round.paused)} disabled={round.phase!=='playing'} aria-label="Jeda permainan"><Pause size={18}/></button></div>
    <div className="minigame-area" data-testid="minigame-area">{children}
      {(round.phase==='ready'||round.paused&&round.phase==='playing')&&<div className="minigame-overlay" data-testid="minigame-start-overlay"><span className="eyebrow">SATU RONDE. BANYAK KESERUAN.</span><h2>{round.phase==='ready'?'Siap bermain?':'Istirahat sejenak'}</h2><button data-testid="minigame-start" className="pop-button pink" onClick={()=>{round.setPhase('playing');round.setPaused(false);}}><Play size={19}/>{round.phase==='ready'?'Mulai bermain':'Lanjutkan'}</button></div>}
    </div>
    {extra}
    <p className="fine-print" data-testid="minigame-reward-rule">Kemenangan mengisi peti dan progres misi. Klaim Permen di halaman hadiah.</p>
    {(round.phase==='won'||round.phase==='lost')&&<div className="dialog-backdrop" role="dialog" aria-modal="true" data-testid="minigame-result"><div className="result-card"><div className="result-icon"><Trophy size={40}/></div><span className="eyebrow">{round.phase==='won'?'KERJA BAGUS!':'SATU LANGKAH LEBIH JAGO'}</span><h2 data-testid="minigame-result-title">{round.phase==='won'?'Tantangan selesai!':'Coba sekali lagi?'}</h2><strong data-testid="minigame-final-score">{score}<small>skor akhir</small></strong><p data-testid="minigame-chest-points">{round.phase==='won'?`+${round.reward} progres peti · Misi diperbarui`:'Perhatikan pola dan rencanakan langkahmu.'}</p><button data-testid="minigame-retry" className="pop-button pink" onClick={onRestart}><RotateCcw size={17}/>Main lagi</button><button data-testid="minigame-view-missions" className="pop-button" onClick={()=>navigate(round.phase==='won'?'misi':'challenges')}>{round.phase==='won'?'Lihat misi':'Kembali ke tantangan'}<ArrowRight size={17}/></button></div></div>}
  </GameShell>;
};