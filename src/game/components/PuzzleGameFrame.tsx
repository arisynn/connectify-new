import React from 'react';
import {Pause,Play,RotateCcw,Clock,Target,ArrowLeft} from 'lucide-react';
import {GameShell} from '../../components/GameShell';
import {useGame} from '../../GameContext';
import {useTheme} from '../../core/theme/ThemeProvider';
import {artIcon} from '../../core/artAssets';
import {VictoryBurst} from '../../components/VictoryBurst';
import {useDialogFocus} from '../../components/useDialogFocus';
export const PuzzleGameFrame=({title,description,round,score,onRestart,children,extra,options,onStart}:any)=>{
  const {navigate}=useGame(),{activeTheme}=useTheme(),game=title==='Memory Flip'?'memory':'triple';
  const finished=round.phase==='won'||round.phase==='lost',dialogRef=useDialogFocus(finished);
  return <GameShell title={title} eyebrow="CONNECTIFY PLAY CLUB" back="levels" wide>
    <div className={`puzzle-game-layout ${game} round-${round.phase}`} data-testid={`${game}-game-screen`}>
      <aside className="puzzle-game-intro"><img data-testid={`${game}-game-art`} src={game==='memory'?'/art/premium/cards/deck.webp':artIcon(game)} alt={title}/><span className="eyebrow" data-testid={`${game}-mode-label`}>{game==='memory'?'INGAT. BALIK. TEMUKAN.':'PILIH. SUSUN. SATUKAN.'}</span><h2 data-testid={`${game}-game-title`}>{game==='memory'?'Pasangan yang pas.':'Tiga jadi seru.'}</h2><p data-testid="game-instructions">{description}</p><span className="game-theme-chip" data-testid={`${game}-theme`}>{activeTheme.name}</span><p className="fine-print" data-testid="game-reward-rule">Setiap ronde memberi progres akun. Kemenangan juga mengisi misi dan peti.</p></aside>
      <div className="puzzle-game-board"><div className="mini-hud"><span data-testid="game-score"><Target size={17}/>{score}<small>skor</small></span><span data-testid="game-timer" className={round.time<=15?'danger':''}><Clock size={17}/>{round.time}s</span><button data-testid="game-pause" className="round-button" onClick={()=>round.setPaused(true)} disabled={round.phase!=='playing'} aria-label={`Jeda ${title}`}><Pause size={18}/></button></div>
        <div className="minigame-area" data-testid="game-board-area">{children}
          {(round.phase==='ready'||round.paused&&round.phase==='playing')&&<div className="minigame-overlay" data-testid="game-start-overlay"><img className="round-intro-art" src={game==='memory'?'/art/premium/cards/deck.webp':artIcon(game)} alt=""/><span className="eyebrow" data-testid="game-start-caption">{title}</span><h2 data-testid="game-start-title">{round.phase==='ready'?'Siap bermain?':'Istirahat sejenak'}</h2>{round.phase==='ready'&&options}<button data-testid="game-start" className="pop-button pink" onClick={()=>{if(round.phase==='ready'&&onStart)onStart();else{round.setPhase('playing');round.setPaused(false);}}}><Play size={19}/>{round.phase==='ready'?'Mulai bermain':'Lanjutkan'}</button></div>}
        </div>{extra}
      </div>
    </div>
    {finished&&<div className="dialog-backdrop"><div ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Hasil ${title}`} data-testid="game-result" className="result-card">{round.phase==='won'&&<VictoryBurst/>}<img className="result-art" src={artIcon(round.phase==='won'?'achievements':game)} alt=""/><span className="eyebrow" data-testid="game-result-caption">{round.phase==='won'?'KERJA BAGUS!':'SETIAP RONDE BIKIN MAKIN JAGO'}</span><h2 data-testid="game-result-title">{round.phase==='won'?'Papan selesai!':'Coba sekali lagi?'}</h2><strong data-testid="game-final-score">{score}<small>skor akhir</small></strong><p data-testid="game-chest-points">{round.phase==='won'?`+${round.reward} progres peti · Misi diperbarui`:'Perhatikan pola dan rencanakan langkahmu.'}</p><button data-testid="game-retry" className="pop-button pink" onClick={onRestart}><RotateCcw size={17}/>Main lagi</button><button data-testid="game-result-menu" className="text-button" onClick={()=>navigate('levels')}><ArrowLeft size={16}/>Pilih permainan</button></div></div>}
  </GameShell>;
};