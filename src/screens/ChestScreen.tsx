import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { useAudio } from '../core/audio/AudioEngine';
import { Box, Gift, Unlock, X, Zap, Candy, Search, RefreshCw, Hammer, Bomb } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KineticButton, ProgressBar } from '../designs/KineticComponents';
import { useProfile } from '../core/profile/ProfileContext';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { CHEST_TYPES, openChestAction, calculateDynamicSpeedUpCost, CHEST_POINTS_REQUIRED } from '../core/chest';
import { EconomyMeter } from '../components/EconomyMeter';

const ChestItem = ({ 
  state, 
  title, 
  timeLabel,
  iconName,
  progressPct,
  onOpen,
  speedUpCost,
  canAfford,
  onSpeedUp,
  slotIndex
}: { 
  state: 'ready' | 'opening' | 'empty', 
  title: string, 
  timeLabel: string,
  iconName?: string,
  progressPct?: number,
  onOpen?: () => void,
  speedUpCost?: number,
  canAfford?: boolean,
  onSpeedUp?: () => void,
  slotIndex?: number
}) => {
  if (state === 'empty') {
    return (
      <div className="flex-1 bg-[var(--club-card)]/60 border-2 border-dashed border-[var(--club-line)]/30 rounded-2xl p-3 flex flex-col items-center justify-center min-h-[140px]">
        <Box size={24} className="text-[var(--club-muted)]/50 mb-2" />
        <span className="font-bold text-[10px] uppercase text-[var(--club-muted)] tracking-wider text-center">Slot Kosong</span>
      </div>
    );
  }
  
  if (state === 'opening') {
    return (
      <div className="flex-1 bg-[var(--club-sky)] border-2 border-[var(--club-line)] rounded-2xl p-3 shadow-[3px_3px_0_var(--club-line)] relative flex flex-col items-center justify-between min-h-[140px] text-center text-[var(--club-ink)]">
         <div className="w-11 h-11 bg-white border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0 shadow-[1px_1px_0_var(--club-line)] mb-2 mt-0.5">
            <DynamicIcon name={iconName || "collection_chest"} type="logo" LucideFallback={Unlock} className="w-[80%] h-[80%] object-contain" />
         </div>
         <div className="flex-1 flex flex-col w-full items-center justify-end">
            <h3 className="font-bold text-[var(--club-ink)] text-xs tracking-tight leading-tight">{title}</h3>
            <span className="font-bold text-[9px] text-[#0284c7] uppercase tracking-wider mt-0.5 mb-1.5">{timeLabel}</span>
            <div className="w-full mt-auto">
               <div className="w-full h-2 bg-white/80 border-1.5 border-[var(--club-line)] rounded-full overflow-hidden p-0.5">
                 <div className="h-full bg-[#46b995] rounded-full transition-all duration-300" style={{ width: `${progressPct || 0}%` }} />
               </div>
            </div>
            {onSpeedUp && (
              <button 
                onClick={onSpeedUp} 
                disabled={!canAfford} 
                className="pop-button mt-2 py-1 px-1.5 w-full text-[10px] !shadow-[1px_1px_0_var(--club-line)]"
              >
                 <span data-testid={`chest-speedup-${slotIndex}`} className="flex items-center justify-center gap-1 font-bold">
                   <Zap size={11} strokeWidth={2.5} /> {speedUpCost} <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-3 h-3 object-contain" />
                 </span>
              </button>
            )}
         </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl p-3 shadow-[3px_3px_0_var(--club-line)] flex flex-col items-center justify-between min-h-[140px] relative text-center text-[var(--club-ink)]">
       <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ef4444] text-white border-1.5 border-[var(--club-line)] rounded-full flex items-center justify-center font-bold text-[10px] shadow-sm z-10 animate-bounce">!</div>
       <div className="w-11 h-11 bg-white border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0 shadow-[1px_1px_0_var(--club-line)] mb-2 mt-0.5">
          <DynamicIcon name={iconName || "collection_chest"} type="logo" LucideFallback={Box} className="w-[80%] h-[80%] object-contain" />
       </div>
       <div className="flex-1 flex flex-col w-full items-center justify-end">
          <h3 className="font-bold text-[var(--club-ink)] text-xs tracking-tight leading-tight">{title}</h3>
          <span className="font-bold text-[9px] text-[#16a34a] uppercase tracking-wider mt-0.5 mb-2">{timeLabel}</span>
          <button 
            onClick={onOpen} 
            className="pop-button pink py-1 px-1.5 w-full text-[10px] mt-auto !shadow-[1px_1px_0_var(--club-line)] font-bold"
          >
            <span data-testid={`chest-open-${slotIndex}`}>Buka</span>
          </button>
       </div>
    </div>
  );
};

import { useCDE } from '../core/cde';

export const ChestScreen = () => {
  const { navigate, screen } = useGame();
  const audio = useAudio();
  const { profile, updateProfile } = useProfile();
  const cde = useCDE();
  const [rewardModal, setRewardModal] = useState<any>(null);
  const [message,setMessage]=useState('');

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Track if this component is mounted to handle the close animation
  const [isVisible, setIsVisible] = useState(true);

  // When 'screen' changes away from 'peti', trigger exit animation
  useEffect(() => {
    if (screen !== 'peti') {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [screen]);

  const handleClose = () => {
    audio.playUiClick();
    setIsVisible(false);
    setTimeout(() => {
      navigate('home');
    }, 300); // Wait for animation to finish
  };

  const handleOpenChest = (slotIndex: number) => {
    const result = openChestAction(profile, slotIndex);
    if(result.rewards?.error) {setMessage('Batas income hari ini tidak cukup. Peti tetap aman; buka lagi setelah reset 00.00 WIB.');return;}
    if (result.rewards && result.rewards.chestType) {
       audio.playSfx('uiReward', () => audio.playMatch());
       // The authoritative roll happens on the server; the preview shows the local roll.
       cde.queueMutation('OPEN_CHEST', { slotId: slotIndex });
       setRewardModal(result.rewards);
    }
  };

  const handleSpeedUp = (slotIndex: number) => {
    const chest = (profile?.chestSlots || [])[slotIndex];
    if (!chest) return;
    const cost = calculateDynamicSpeedUpCost(chest.type, chest.startTime);
    if (cost > 0 && cde.permen >= cost) {
      audio.playUiClick();
      cde.queueMutation('SPEED_UP_CHEST', { slotId: slotIndex });
    }
  };

  const chestProgress = Math.min(profile?.chestProgress || 0, CHEST_POINTS_REQUIRED);

  const handleClaim = () => {
    audio.playUiClick();
    setRewardModal(null);
  };

  const chestSlots = profile?.chestSlots || [null, null, null];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          key="chest-sheet-backdrop"
          className="absolute inset-0 z-[100] flex flex-col justify-end pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/60 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* Bottom Sheet */}
          <motion.div 
            className="w-full max-w-xl mx-auto bg-[var(--club-paper)] border-t-2 sm:border-2 border-[var(--club-line)] rounded-t-[26px] sm:rounded-[26px] shadow-[0_-4px_0_var(--club-line)] sm:shadow-[6px_6px_0_var(--club-line)] flex flex-col font-sans relative pointer-events-auto max-h-[85vh] text-[var(--club-ink)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--club-line)]/15">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shadow-[1px_1px_0_var(--club-line)]">
                   <DynamicIcon name="collection_chest" type="logo" LucideFallback={Box} className="w-[75%] h-[75%] object-contain" />
                 </div>
                 <div>
                   <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">KEJUTAN HARIAN</span>
                   <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Peti Harta Karun</h2>
                 </div>
              </div>
              <button
                  data-testid="chest-close-button"
                  onClick={handleClose}
                  className="round-button"
                  aria-label="Tutup peti"
              >
                <span className="text-base font-bold">✕</span>
              </button>
            </div>
            
            {/* Next chest progress */}
            <div className="px-6 pt-4"><EconomyMeter compact id="chest-income"/>{message&&<p role="status" data-testid="chest-limit-message" className="text-xs text-[#ef4444] font-medium mt-2">{message}</p>}</div>
            <div className="px-6 pt-3 flex items-center gap-3">
               <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)] shrink-0">Peti Berikutnya</span>
               <div className="flex-1">
                 <div className="w-full h-3 bg-white border-1.5 border-[var(--club-line)] rounded-full overflow-hidden p-0.5">
                   <div className="h-full bg-[#46b995] rounded-full transition-all duration-300" style={{ width: `${(chestProgress / CHEST_POINTS_REQUIRED) * 100}%` }} />
                 </div>
               </div>
               <span className="text-[11px] font-bold text-[var(--club-ink)] shrink-0">{chestProgress}/{CHEST_POINTS_REQUIRED} PTS</span>
            </div>
            <div className="px-6 pt-2 flex items-center justify-between">
               <span data-testid="chest-reward-policy" className="text-[10px] text-[var(--club-muted)]">Biasa 5 · Langka 8 · Epik 10 Permen + booster. Setiap peti ke-7 dijamin Epik.</span>
               <div className="flex items-center gap-1 font-bold text-xs text-[var(--club-ink)]"><DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-4 h-4 object-contain" /> {cde.permen}</div>
            </div>

            {/* Content List */}
            <div className="p-6 flex flex-row gap-3 pb-8 overflow-x-auto min-h-[160px]">
               {chestSlots.map((chest: any, idx: number) => {
                  if (!chest) {
                     return <ChestItem key={idx} state="empty" title="" timeLabel="" />;
                  }
                  
                  const typeConfig = CHEST_TYPES[chest.type as keyof typeof CHEST_TYPES];
                  const elapsed = now - chest.startTime;
                  const remainingMs = typeConfig.durationMs - elapsed;
                  const isReady = remainingMs <= 0;
                  
                  if (isReady) {
                     return <ChestItem key={idx} slotIndex={idx} state="ready" title={typeConfig.name} timeLabel="Siap!" iconName={`chest_${chest.type}`} onOpen={() => handleOpenChest(idx)} />;
                  } else {
                     const h = Math.floor(remainingMs / 3600000);
                     const m = Math.floor((remainingMs % 3600000) / 60000);
                    const seconds = Math.floor((remainingMs % 60000)/1000);
                    const timeLabel = h > 0 ? `${h}j ${m}m` : `${m}m ${seconds}d`;
                     const progressPct = Math.min(100, (elapsed / typeConfig.durationMs) * 100);
                     
                     const cost = calculateDynamicSpeedUpCost(chest.type, chest.startTime, now);
                     return <ChestItem key={idx} slotIndex={idx} state="opening" title={typeConfig.name} timeLabel={timeLabel} iconName={`chest_${chest.type}`} progressPct={progressPct} speedUpCost={cost} canAfford={cde.permen >= cost} onSpeedUp={() => handleSpeedUp(idx)} />;
                  }
               })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Reward Modal - Rendered on top of the sheet */}
      {rewardModal && (
        <motion.div
           key="reward-modal"
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 bg-[#0f172a]/70 backdrop-blur-[4px] z-[130] flex items-center justify-center p-6 pointer-events-auto"
        >
           <motion.div
             initial={{ scale: 0.85, y: 20 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.85, opacity: 0 }}
             transition={{ type: 'spring', damping: 20, stiffness: 320 }}
             className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[24px] p-6 flex flex-col items-center w-full max-w-[340px] shadow-[6px_6px_0_var(--club-line)] text-center relative overflow-hidden text-[var(--club-ink)]"
           >
              <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase mb-1">SELAMAT!</span>
              <h3 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight mb-5">Peti Terbuka!</h3>
              
              <div className="w-20 h-20 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-[3px_3px_0_var(--club-line)] mb-5 text-[var(--club-ink)]">
                 <Gift size={40} className="text-[#e11d48]" />
              </div>
              
              <div data-testid="chest-reward-list" className="grid grid-cols-2 gap-2.5 w-full mb-6">
                 {[
                   { key: 'permen', label: 'Permen', color: 'text-[var(--club-ink)]', icon: Candy, iconName: 'permen' },
                   { key: 'hints', label: 'Hint', color: 'text-blue-600', icon: Search, iconName: 'hint' },
                   { key: 'shuffles', label: 'Shuffle', color: 'text-orange-600', icon: RefreshCw, iconName: 'shuffle' },
                   { key: 'hammers', label: 'Hammer', color: 'text-amber-600', icon: Hammer },
                   { key: 'bombs', label: 'Bomb', color: 'text-red-600', icon: Bomb },
                 ].filter(r => rewardModal?.[r.key]).map(r => (
                   <div key={r.key} className="bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl py-2 px-2.5 flex items-center justify-center gap-2 shadow-[2px_2px_0_var(--club-line)]">
                      {r.iconName ? <DynamicIcon name={r.iconName} type="logo" LucideFallback={r.icon} className="w-6 h-6 object-contain" /> : <r.icon size={18} className={r.color} />}
                      <div className="flex flex-col items-start leading-none">
                        <span className="font-bold text-base text-[var(--club-ink)]">+{rewardModal[r.key]}</span>
                        <span className="font-medium text-[9px] text-[var(--club-muted)] uppercase tracking-wider">{r.label}</span>
                      </div>
                   </div>
                 ))}
              </div>
              <button
                onClick={handleClaim}
                className="pop-button pink w-full"
              >
                <span data-testid="chest-reward-claim">Klaim Hadiah</span>
              </button>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
