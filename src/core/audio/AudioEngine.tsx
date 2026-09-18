import React,{createContext,useContext,useEffect,useMemo,useRef,useState} from 'react';
import {ClubSynth,AudioSettings} from './ClubSynth';
const defaults:AudioSettings={musicVol:45,sfxVol:65,muteMusic:false,muteSfx:false};
const readSettings=()=>{try{return {...defaults,...JSON.parse(localStorage.getItem('sweetConnectAudioSettings')||'{}')};}catch{return defaults;}};
const AudioContext=createContext<any>(null);
export const AudioProvider=({children}:{children:React.ReactNode})=>{
  const [settings,setSettings]=useState<AudioSettings>(readSettings);
  const synth=useRef<ClubSynth>();if(!synth.current)synth.current=new ClubSynth(settings);
  useEffect(()=>{
    const engine=synth.current!;
    const gesture=(e:Event)=>{engine.unlock();if((e.target as Element)?.closest?.('button,[role="button"]'))engine.sound('click');};
    document.addEventListener('pointerdown',gesture);document.addEventListener('keydown',gesture);document.addEventListener('visibilitychange',engine.visibility);
    return()=>{document.removeEventListener('pointerdown',gesture);document.removeEventListener('keydown',gesture);document.removeEventListener('visibilitychange',engine.visibility);engine.dispose();};
  },[]);
  const methods=useMemo(()=>({
    updateSettings:(patch:Partial<AudioSettings>)=>setSettings(old=>{const next={...old,...patch};next.musicVol=Math.min(100,Math.max(0,Number(next.musicVol)||0));next.sfxVol=Math.min(100,Math.max(0,Number(next.sfxVol)||0));synth.current!.apply(next);localStorage.setItem('sweetConnectAudioSettings',JSON.stringify(next));return next;}),
    playMenuBgm:()=>synth.current!.setScene('menu'),playGameBgm:()=>synth.current!.setScene('game'),stopBgm:()=>synth.current!.setScene('off'),
    playSfx:(key:string,_fallback?:()=>void)=>synth.current!.sound(key),playMatch:()=>synth.current!.sound('match'),playWrong:()=>synth.current!.sound('wrong'),playUiClick:()=>synth.current!.sound('click')
  }),[]);
  return <AudioContext.Provider value={{settings,...methods}}>{children}</AudioContext.Provider>;
};
export const useAudio=()=>{const context=useContext(AudioContext);if(!context)throw new Error('AudioProvider required');return context;};