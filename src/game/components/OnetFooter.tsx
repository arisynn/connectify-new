import React from 'react';
import { Shuffle, Lightbulb } from 'lucide-react';
export const OnetFooter=({shuffles,hints,onShuffle,onHint}:{shuffles:number,hints:number,onShuffle:()=>void,onHint:()=>void})=><footer className="mobile-game-footer" data-testid="onet-mobile-footer">
  <button data-testid="onet-shuffle-mobile" className="pop-button sky" onClick={onShuffle}><Shuffle size={20}/><span>Acak</span><b data-testid="onet-shuffle-count">{shuffles}</b></button>
  <button data-testid="onet-hint-mobile" className="pop-button butter" onClick={onHint}><Lightbulb size={20}/><span>Petunjuk</span><b data-testid="onet-hint-count">{hints}</b></button>
</footer>;