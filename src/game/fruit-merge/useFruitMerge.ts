import {useEffect,useRef,useState} from 'react';
import {FruitWorld} from './FruitWorld';
import {useAudio} from '../../core/audio/AudioEngine';
export const useFruitMerge=()=>{
  const world=useRef<FruitWorld>(),audio=useAudio(),sound=useRef(audio);sound.current=audio;
  const [state,setState]=useState<ReturnType<FruitWorld['snapshot']>|null>(null);
  useEffect(()=>{
    const game=new FruitWorld();world.current=game;setState(game.snapshot());let frame=0,last=performance.now(),lastRender=0,lastMerges=0;
    const tick=(now:number)=>{const delta=Math.min(now-last,40);last=now;game.update(delta);if(game.merges>lastMerges){sound.current.playSfx(game.combo>1?'combo':'uiMatch');lastMerges=game.merges;}if(now-lastRender>30||game.phase==='over'){setState(game.snapshot());lastRender=now;}frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);
    const hidden=()=>{if(document.hidden&&game.phase==='playing'){game.phase='paused';setState(game.snapshot());}};document.addEventListener('visibilitychange',hidden);
    return()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',hidden);game.destroy();world.current=undefined;};
  },[]);
  const phase=(next:FruitWorld['phase'])=>{if(world.current){world.current.phase=next;setState(world.current.snapshot());}};
  const drop=(x:number)=>{if(world.current?.drop(x)){sound.current.playUiClick();setState(world.current.snapshot());}};
  return {state,phase,drop};
};