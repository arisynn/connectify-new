import React,{useEffect,useRef} from 'react';
import Phaser from 'phaser';
import {StarScene} from './StarScene';
import {StarConfig,STAR_WIDTH,STAR_HEIGHT} from './types';
export const StarArena=({config,sceneRef}:{config:StarConfig;sceneRef:React.MutableRefObject<StarScene|null>})=>{
  const host=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const scene=new StarScene(config);sceneRef.current=scene;
    const game=new Phaser.Game({type:Phaser.CANVAS,parent:host.current!,width:STAR_WIDTH,height:STAR_HEIGHT,backgroundColor:'#13191d',scene:[scene],audio:{noAudio:true},physics:{default:'arcade',arcade:{gravity:{x:0,y:0},debug:false}},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true},input:{activePointers:2}});
    const observer=new ResizeObserver(()=>game.scale.refresh());if(host.current)observer.observe(host.current);
    const blur=()=>{if(scene.state.phase==='playing')scene.setPhase('paused');};window.addEventListener('blur',blur);const hidden=()=>{if(document.hidden)blur();};document.addEventListener('visibilitychange',hidden);
    return()=>{observer.disconnect();window.removeEventListener('blur',blur);document.removeEventListener('visibilitychange',hidden);sceneRef.current=null;game.destroy(true);};
  },[]);
  return <div ref={host} className="star-arena" data-testid="star-arena"/>;
};