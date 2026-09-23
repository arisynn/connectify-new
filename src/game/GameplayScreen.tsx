import React,{useState} from 'react';
import {Pause,Timer} from 'lucide-react';
import {useOnetGame} from './hooks/useOnetGame';
import {OnetBoard} from './components/OnetBoard';
import {OnetModals} from './components/OnetModals';
import {GameLoader} from '../components/GameLoader';
import {countRemaining} from '../core/board';
import {getOnetDifficulty} from '../core/difficulty';
import {artIcon} from '../core/artAssets';
import {useTheme} from '../core/theme/ThemeProvider';
export const GameplayScreen=()=>{
  const [loaded,setLoaded]=useState(false);
  return loaded?<GameplayContent/>:<GameLoader onComplete={()=>setLoaded(true)}/>;
};
const GameplayContent=()=>{
  const game=useOnetGame(),{activeTheme}=useTheme();
  const {board,selected,activePaths,hintTiles,directionErrorTiles,matchingTiles,floatingTexts,boardRef,handleTileClick,currentLevel,isDailyChallenge,score,time,profile,isPaused,setIsPaused,gameState,toastMsg,winReward,navigate,initGame,useHint,useShuffle}=game;
  return <main className="play-screen onet-game-screen" data-testid="onet-game-screen"><div className="play-surface">
    <header className="play-topline"><img className="play-game-icon" src={artIcon('onet')} alt=""/><div className="play-heading"><span className="eyebrow" data-testid="onet-mode-name">{isDailyChallenge?'PAPAN HARIAN':'CONNECTIFY CLUB'}</span><h1 data-testid="onet-title">{isDailyChallenge?'Onet Sprint':'Onet'}</h1></div><span className={`hud-timer ${time<=15?'urgent':''}`} data-testid="onet-timer"><Timer size={17}/>{time}<small>dtk</small></span><button className="round-button" data-testid="onet-pause" aria-label="Jeda Onet" onClick={()=>setIsPaused(true)}><Pause size={20}/></button></header>
    <div className="onet-play-layout"><div className="onet-play-board"><div className="onet-round-status"><span data-testid="onet-level">{isDailyChallenge?'Sprint harian':`Level ${currentLevel}`} · {getOnetDifficulty(currentLevel).label}</span><b data-testid="onet-remaining">{countRemaining(board)} sel tersisa</b><span data-testid="onet-score">{score.toLocaleString('id-ID')} skor</span></div>
      <OnetBoard boardRef={boardRef} board={board} selected={selected} activePaths={activePaths} hintTiles={hintTiles} directionErrorTiles={directionErrorTiles} matchingTiles={matchingTiles} floatingTexts={floatingTexts} onTileClick={handleTileClick}/>
    </div><aside className="onet-play-tools"><div className="onet-theme-note"><span className="eyebrow" data-testid="onet-theme-label">TEMA PILIHANMU</span><div>{Object.values(activeTheme.assets.tiles).slice(0,3).map((src,i)=><img key={src} data-testid={`onet-theme-sample-${i}`} src={src} alt=""/>)}</div><h2 data-testid="onet-theme-name">{activeTheme.name}</h2><p data-testid="onet-rules">Gambar dan ukuran sama, maksimal 2 belokan. Tile besar pecah jadi pasangan baru.</p></div><div className="onet-boosters">
      <button data-testid="onet-shuffle" className="pop-button sky" onClick={useShuffle}><img src={artIcon('shuffle')} alt=""/><span>Acak</span><b data-testid="onet-shuffle-count">{profile.shuffles}</b></button><button data-testid="onet-hint" className="pop-button butter" onClick={useHint}><img src={artIcon('hint')} alt=""/><span>Petunjuk</span><b data-testid="onet-hint-count">{profile.hints}</b></button>
    </div></aside></div>
    <OnetModals isPaused={isPaused} gameState={gameState} toastMsg={toastMsg} score={score} winReward={winReward} isDailyChallenge={isDailyChallenge} onResume={()=>setIsPaused(false)} onHome={()=>navigate('game-hub')} onRetry={initGame} onNextLevel={()=>navigate('game-hub')}/>
  </div></main>;
};