import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RefreshCw, Star, Sparkles, Pause } from 'lucide-react';
import { VictoryBurst } from '../../components/VictoryBurst';
interface Props {isPaused:boolean;gameState:'playing'|'won'|'lost';toastMsg:string;score:number;winReward?:any;isDailyChallenge?:boolean;onResume:()=>void;onHome:()=>void;onRetry:()=>void;onNextLevel:()=>void;}
export const OnetModals=({isPaused,gameState,toastMsg,score,winReward,isDailyChallenge,onResume,onHome,onRetry,onNextLevel}:Props)=>{
  const won=gameState==='won',lost=gameState==='lost',open=isPaused||won||lost;
  return <><AnimatePresence>{open&&<motion.div className="dialog-backdrop" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    <motion.section role="dialog" aria-modal="true" aria-labelledby="onet-dialog-title" data-testid="onet-result-dialog" className="result-card" initial={{scale:.92,y:15}} animate={{scale:1,y:0}} transition={{type:'spring',damping:23,stiffness:320}}>
      {won&&<VictoryBurst/>}<div className="result-icon" aria-hidden="true">{won?<Star size={36}/>:lost?<RefreshCw size={36}/>:<Pause size={36}/>}</div>
      <span className="eyebrow" data-testid="onet-dialog-caption">{won?'KERJA BAGUS!':lost?'SETIAP RONDE BIKIN MAKIN JAGO':'TARIK NAPAS SEBENTAR'}</span>
      <h2 id="onet-dialog-title" data-testid="onet-dialog-title">{won?(isDailyChallenge?'Tantangan selesai!':'Papan bersih!'):lost?'Coba sekali lagi?':'Lagi istirahat.'}</h2>
      {isPaused&&!won&&!lost?<><p data-testid="onet-pause-help">Gambar dan ukuran sama, maksimal 2 belokan. Tile besar pecah menjadi pasangan gambar baru.</p><button data-testid="onet-resume" autoFocus className="pop-button mint" onClick={onResume}><Play size={18}/>Lanjutkan</button><button data-testid="onet-pause-exit" className="pop-button" onClick={onHome}>Keluar ke menu</button></>:<>
        <strong data-testid="onet-final-score">{score.toLocaleString('id-ID')}<small>SKOR RONDE INI</small></strong>
        <div className="result-rewards" data-testid="onet-win-summary"><span data-testid="onet-earned-xp"><Sparkles size={16}/>+{winReward?.xp||0} XP</span>{won&&<span data-testid="onet-earned-chest">+{winReward?.chestPoints||0} poin peti</span>}</div>
        {winReward?.leveledUp&&<p className="level-up-notice" data-testid="onet-level-up">Naik level! Sekarang akunmu Level {winReward.accountLevel}.</p>}
        <p data-testid="onet-mission-updated">{won?'Progres misi tercatat. Hadiah menunggu di papan misi.':'Waktunya habis, tapi progres dan XP ronde ini tetap dicatat.'}</p>
        {won?<button data-testid="onet-next-level" autoFocus className="pop-button mint" onClick={onNextLevel}>{isDailyChallenge?'Kembali ke menu':'Lanjut petualangan'}</button>:<button data-testid="onet-retry" autoFocus className="pop-button pink" onClick={onRetry}><RefreshCw size={17}/>Coba lagi</button>}
        <button data-testid="onet-result-home" className="text-button" onClick={onHome}>Kembali ke menu</button>
      </>}
    </motion.section>
  </motion.div>}</AnimatePresence>{toastMsg&&<div className="club-toast" data-testid="onet-toast" role="status">{toastMsg}</div>}</>;
};