import React from 'react';
import { Pause, Timer, Sparkles } from 'lucide-react';
export const OnetHeader=({level,score,time,onPause}:{level:number,score:number,time:number,onPause:()=>void})=><div className="mobile-game-header" data-testid="onet-mobile-header">
  <header><button data-testid="onet-pause-mobile" className="round-button" aria-label="Jeda Onet" onClick={onPause}><Pause size={21}/></button><div data-testid="onet-level-mobile"><small>ONET CLUB</small><b>Level {level}</b></div><span data-testid="onet-score-mobile" className="hud-score"><Sparkles size={15}/>{score.toLocaleString('id-ID')}</span><span data-testid="onet-timer-mobile" className={`hud-timer ${time<=15?'urgent':''}`}><Timer size={17}/>{time}<small>d</small></span></header>
</div>;