import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, RefreshCw, Star } from 'lucide-react';

interface OnetModalsProps {
  isPaused: boolean;
  gameState: 'playing' | 'won' | 'lost';
  toastMsg: string;
  score: number;
  winReward?: { chestPoints: number, permen?: number, dailyBonus?: number } | null;
  isDailyChallenge?: boolean;
  onResume: () => void;
  onHome: () => void;
  onRetry: () => void;
  onNextLevel: () => void;
}

export const OnetModals: React.FC<OnetModalsProps> = ({
  isPaused, gameState, toastMsg, score, winReward, isDailyChallenge = false, onResume, onHome, onRetry, onNextLevel
}) => {
  return (
    <>
      {/* PAUSE MODAL */}
      <AnimatePresence>
        {isPaused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px] z-[150] flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[26px] p-6 shadow-[6px_6px_0_var(--club-line)] text-[var(--club-ink)] max-w-xs w-full text-center"
            >
              <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block mb-1">PERMAINAN DIJEDA</span>
              <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight mb-6">Pause</h2>
              <div className="flex flex-col gap-3">
                <button 
                  onClick={onResume} 
                  className="pop-button mint w-full flex items-center justify-center gap-2 font-bold py-3"
                >
                   <Play size={18} className="fill-[var(--club-ink)]" /> Lanjutkan
                </button>
                <button 
                  onClick={onHome} 
                  className="pop-button w-full py-2.5 font-bold text-xs"
                >
                  Keluar ke Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* LOSE MODAL */}
      <AnimatePresence>
        {gameState === 'lost' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px] z-[150] flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[26px] p-6 pt-9 shadow-[6px_6px_0_var(--club-line)] text-[var(--club-ink)] max-w-xs w-full text-center relative"
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-[var(--club-pink)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] z-10 text-[var(--club-ink)]">
                 <RefreshCw size={26} strokeWidth={2.5} />
              </div>
              
              <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block mb-1">KESEMPATAN HABIS</span>
              <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight mb-1">Game Over!</h2>
              <p className="text-xs text-[var(--club-muted)] mb-5">Waktu habis atau gerakan buntu.</p>
              
              <div className="bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-2xl p-3.5 mb-6 shadow-[2px_2px_0_var(--club-line)]">
                 <span className="font-bold text-[10px] text-[var(--club-muted)] uppercase tracking-wider block mb-0.5">Skor Akhir</span>
                 <span className="font-['Fredoka'] font-semibold text-3xl text-[var(--club-ink)]">{score}</span>
              </div>
              
              <div className="flex gap-2.5">
                 <button onClick={onHome} className="pop-button flex-1 py-2.5 text-xs font-bold">
                   Keluar
                 </button>
                 <button onClick={onRetry} className="pop-button pink flex-1 py-2.5 text-xs font-bold">
                   Coba Lagi
                 </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIN MODAL */}
      <AnimatePresence>
        {gameState === 'won' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px] z-[150] flex items-center justify-center p-5"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[26px] p-6 pt-9 shadow-[6px_6px_0_var(--club-line)] text-[var(--club-ink)] max-w-sm w-full text-center relative"
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 w-14 h-14 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] z-10 text-[var(--club-ink)]">
                 <Star size={30} className="fill-[#eab308] text-[var(--club-line)]" />
              </div>
              
              <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block mb-1">LUAR BIASA!</span>
              <h2 className="font-['Fredoka'] font-semibold text-3xl text-[var(--club-ink)] leading-tight mb-5">
                {isDailyChallenge ? 'Tantangan Selesai!' : 'Level Selesai!'}
              </h2>
              
              <div data-testid="onet-win-summary" className="bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-2xl p-4 mb-6 shadow-[2px_2px_0_var(--club-line)] flex flex-col gap-2.5 text-left">
                 <div className="flex justify-between items-center pb-2 border-b border-[var(--club-line)]/10">
                    <span className="font-bold text-xs text-[var(--club-muted)] uppercase tracking-wider">Skor</span>
                    <span className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)]">{score}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-[var(--club-line)]/10">
                    <span className="font-bold text-xs text-[var(--club-muted)] uppercase tracking-wider">Progres Misi</span>
                    <span data-testid="onet-mission-updated" className="font-bold text-xs text-[#16a34a] flex items-center gap-1">
                       ✓ Tercatat
                    </span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="font-bold text-xs text-[var(--club-muted)] uppercase tracking-wider">Poin Peti</span>
                    <span className="font-bold text-sm text-[#0284c7]">+{winReward ? winReward.chestPoints : 0} PTS</span>
                 </div>
              </div>
              
              <button 
                onClick={onNextLevel} 
                className="pop-button mint w-full py-3 text-base font-bold"
              >
                {isDailyChallenge ? 'Kembali' : 'Lanjut Level Berikutnya'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOAST MODAL */}
      <AnimatePresence>
         {toastMsg && (
            <motion.div 
               initial={{ opacity: 0, y: 30, scale: 0.95 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="fixed bottom-24 left-0 right-0 flex justify-center z-[160] pointer-events-none px-4"
            >
              <div className="bg-[var(--club-card)] text-[var(--club-ink)] font-bold text-xs px-5 py-2.5 rounded-full shadow-[4px_4px_0_var(--club-line)] border-2 border-[var(--club-line)] text-center">
                {toastMsg}
              </div>
            </motion.div>
         )}
      </AnimatePresence>
    </>
  );
};
