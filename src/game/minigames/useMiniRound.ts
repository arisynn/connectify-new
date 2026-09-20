import {useEffect,useRef,useState} from 'react';
import { useCDE } from '../../core/cde';
import { useProfile } from '../../core/profile/ProfileContext';
import { RewardEngine } from '../../core/reward';

export const randomize=<T,>(items:T[])=>{
  const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;
};
export const useMiniRound=(game:'memory'|'triple',seconds:number,frozen=false)=>{
  const [phase,setPhase]=useState<'ready'|'playing'|'won'|'lost'>('ready'),[paused,setPaused]=useState(false),[time,setTime]=useState(seconds),[reward,setReward]=useState(0);
  const {profile}=useProfile(),cde=useCDE(),run=useRef(crypto.randomUUID()),sent=useRef(false);
  useEffect(()=>{if(phase!=='playing'||paused||frozen)return;const timer=setInterval(()=>setTime(t=>Math.max(0,t-1)),1000);return()=>clearInterval(timer);},[phase,paused,frozen]);
  useEffect(()=>{const hide=()=>{if(document.hidden)setPaused(true);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
  const finish=(won:boolean,score:number,matches:number,mistakes=0,highestCombo=0)=>{
    if(sent.current)return;sent.current=true;setPhase(won?'won':'lost');
    const payload={game,runId:run.current,level:1,isWinner:won,isFlawless:won&&mistakes===0,score,matches,timeElapsed:(seconds-time)*1000,highestCombo,isDailyChallenge:false};
    setReward(RewardEngine.processWin(profile,payload).rewardResult.chestPoints);
    cde.queueMutation('PROCESS_WIN',payload);
  };
  return {phase,setPhase,paused,setPaused,time,finish,reward};
};