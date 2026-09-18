import { useState, useEffect, useRef } from 'react';
import { useGame } from '../../GameContext';
import { useTheme } from '../../core/theme/ThemeProvider';
import { useProfile } from '../../core/profile/ProfileContext';
import { useCDE, CDE } from '../../core/cde';
import { generateBoard, getPath, findHint, countRemaining, guaranteedShuffle, clearMatchedGroups, canMatch, getMatchAction } from '../../core/board';
import { RewardEngine } from '../../core/reward';
import { DAILY_CHALLENGE_TIME, getTodayKey } from '../../core/economy';
import { useAudio } from '../../core/audio/AudioEngine';
import { getOnetDifficulty } from '../../core/difficulty';
import { seededRandom } from '../../core/random';

export const getDailyChallengeLevel = () => 6 + (Math.floor(Date.parse(getTodayKey())/86400000)%10);
export const useOnetGame = (initialBoard?:any[][], isMultiplayer?:boolean, onComplete?:()=>void, onProgress?:(n:number)=>void) => {
  const {navigate,gameMode}=useGame(); const {activeTheme}=useTheme();
  const {profile,updateProfile}=useProfile(); const cde=useCDE(); const audio=useAudio();
  const isDailyChallenge=gameMode==='daily' && !isMultiplayer, levelTime=isDailyChallenge?DAILY_CHALLENGE_TIME:getOnetDifficulty(profile.currentLevel||1).time;
  const [board,setBoard]=useState<any[][]>([]),[selected,setSelected]=useState<any>(null);
  const [activePaths,setActivePaths]=useState<any[]>([]),[hintTiles,setHintTiles]=useState<any>(null);
  const [directionErrorTiles,setErrors]=useState<any[]>([]),[matchingTiles,setMatching]=useState<any[]>([]);
  const [score,setScore]=useState(0),[combo,setCombo]=useState(0),[time,setTime]=useState(levelTime);
  const [isPaused,setIsPaused]=useState(false),[gameState,setGameState]=useState<'playing'|'won'|'lost'>('playing');
  const [toastMsg,setToast]=useState(''),[winReward,setWinReward]=useState<any>(null),[floatingTexts,setFloating]=useState<any[]>([]);
  const boardRef=useRef<HTMLDivElement>(null),lock=useRef(false),processed=useRef(false),epoch=useRef(0);
  const run=useRef(crypto.randomUUID()),lastMatch=useRef(0),bestCombo=useRef(0),matches=useRef(0),mistakes=useRef(0);
  const splits=useRef(0);
  const level=useRef(isDailyChallenge?getDailyChallengeLevel():(profile.currentLevel||1));
  const timers=useRef<any[]>([]);
  const later=(fn:()=>void,delay:number)=>{const version=epoch.current;timers.current.push(setTimeout(()=>{if(version===epoch.current)fn();},delay));};
  const showToast=(msg:string)=>{setToast(msg);later(()=>setToast(''),2600);};
  const initGame=()=>{
    epoch.current++;timers.current.forEach(clearTimeout);timers.current=[];
    lock.current=false;processed.current=false;run.current=crypto.randomUUID();matches.current=0;mistakes.current=0;bestCombo.current=0;lastMatch.current=0;
    level.current=isDailyChallenge?getDailyChallengeLevel():(profile.currentLevel||1);
    splits.current=0;
    setBoard(initialBoard?structuredClone(initialBoard):generateBoard(activeTheme.id,level.current,isDailyChallenge?seededRandom(`daily-${getTodayKey()}-${activeTheme.id}`):Math.random));
    setScore(0);setCombo(0);setTime(levelTime);setSelected(null);setHintTiles(null);setMatching([]);setActivePaths([]);setErrors([]);setFloating([]);setGameState('playing');setIsPaused(false);setWinReward(null);
  };
  useEffect(()=>{initGame();return()=>{epoch.current++;timers.current.forEach(clearTimeout);};},[]);
  useEffect(()=>{const hide=()=>{if(document.hidden&&!isMultiplayer)setIsPaused(true);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[isMultiplayer]);
  useEffect(()=>{if(gameState!=='playing'||isPaused)return;const t=setInterval(()=>setTime(v=>Math.max(0,v-1)),1000);return()=>clearInterval(t);},[gameState,isPaused]);
  useEffect(()=>{
    if(!board.length||processed.current||gameState!=='playing'||lock.current)return;
    const remaining=countRemaining(board);onProgress?.(remaining);
    if(remaining===0 || time===0){
      processed.current=true;const won=remaining===0;setGameState(won?'won':'lost');audio.playSfx(won?'win':'lose');
      if(isMultiplayer){if(won)onComplete?.();return;}
      const payload={game:'onet',runId:run.current,level:level.current,isWinner:won,isFlawless:won&&mistakes.current===0,timeElapsed:(levelTime-time)*1000,remainingTime:time,progress:time/levelTime*100,highestCombo:bestCombo.current,score,matches:matches.current,splits:splits.current,isDailyChallenge};
      setWinReward(RewardEngine.processWin(profile,payload).rewardResult);
      cde.queueMutation('PROCESS_WIN',payload).catch(()=>showToast('Hasil belum tersimpan. Periksa koneksi.'));
    } else if(!findHint(board)){
      lock.current=true;showToast('Jalur habis. Papan diacak gratis!');
      later(()=>{lock.current=false;setSelected(null);setBoard(b=>guaranteedShuffle(b,Math.random,level.current));},700);
    }
  },[board,time,gameState]);
  const handleTileClick=(r:number,c:number)=>{
    if(gameState!=='playing'||isPaused||lock.current||!board[r]?.[c])return;
    const t=board[r][c];if(t.isSlave){r=t.masterR;c=t.masterC;}
    if(!selected){setSelected({r,c});return;}
    if(selected.r===r&&selected.c===c){setSelected(null);return;}
    if(!canMatch(board[selected.r][selected.c],board[r][c])){setSelected({r,c});return;}
    const a=selected,b={r,c},result=getPath(board,a.r,a.c,r,c);
    setSelected(null);
    if(!result?.path){mistakes.current++;setErrors([a,b]);later(()=>setErrors([]),400);return;}
    lock.current=true;const chain=Date.now()-lastMatch.current<4000?combo+1:1;
    lastMatch.current=Date.now();bestCombo.current=Math.max(bestCombo.current,chain);matches.current++;setCombo(chain);
    audio.playMatch();if(profile.settings?.haptics!==false)navigator.vibrate?.(12);
    setMatching([a,b]);setActivePaths([{id:Date.now(),path:result.path}]);setHintTiles(null);

    const action = getMatchAction(board, a, b);
    if(action!=='clear')audio.playSfx('split');
    if(action!=='clear')splits.current++;
    let baseScore = 100;
    if (action === 'split_to_1x2') {
      baseScore = 200;
      setFloating([{ id: Date.now(), text: 'Pecah! Dua gambar baru', x: 50, y: 40 }]);
    } else if (action === 'split_to_1x1') {
      baseScore = 150;
      setFloating([{ id: Date.now(), text: 'Pop! Cari pasangan barunya', x: 50, y: 40 }]);
    } else if(chain>1) {
      setFloating([{id:Date.now(),text:`Combo ×${chain}`,x:40,y:40}]);
    }

    later(()=>{
      lock.current=false;
      setBoard(prev=>clearMatchedGroups(prev,a,b,activeTheme.id));
      setScore(s=>s+baseScore+(chain-1)*10);
      setMatching([]);
      setActivePaths([]);
      setFloating([]);
    },480);
  };
  const useHint=()=>{
    if(lock.current||isPaused||gameState!=='playing')return;
    if((CDE.getState().profile?.profile_data?.profile?.hints??3)<=0){showToast('Hint habis. Dapatkan dari peti atau toko.');return;}
    const hint=findHint(board);if(hint){cde.queueMutation('USE_ITEM',{itemId:'hint'});setHintTiles(hint);}
  };
  const useShuffle=()=>{
    if(lock.current||isPaused||gameState!=='playing')return;
    if((CDE.getState().profile?.profile_data?.profile?.shuffles??3)<=0){showToast('Shuffle habis. Dapatkan dari peti atau toko.');return;}
    cde.queueMutation('USE_ITEM',{itemId:'shuffle'});audio.playSfx('shuffle');setBoard(b=>guaranteedShuffle(b,Math.random,level.current));setSelected(null);setHintTiles(null);showToast('Papan diacak, tantangan tetap sesuai level!');
  };
  return {board,selected,activePaths,hintTiles,directionErrorTiles,matchingTiles,score,combo,floatingTexts,time,isPaused,setIsPaused,gameState,toastMsg,winReward,isDailyChallenge,dailyChallengeDone:profile.dailyChallengeDate===getTodayKey(),levelTime,currentLevel:level.current,boardRef,handleTileClick,useHint,useShuffle,initGame,profile,updateProfile,navigate};
};