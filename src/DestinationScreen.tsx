import React, { useEffect } from 'react';
import { useGame } from './GameContext';
import { ArrowLeft, Bell, Check, Gift, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KineticButton, NotificationCard } from './designs/KineticComponents';
import { useProfile } from './core/profile/ProfileContext';

import { ProfileScreen } from './screens/ProfileScreen';
import { ChestScreen } from './screens/ChestScreen';
import { ShopScreen } from './screens/ShopScreen';
import { MissionScreen } from './screens/MissionScreen';
import { ThemeScreen } from './screens/ThemeScreen';
import { AchievementScreen } from './screens/AchievementScreen';
import { StatistikScreen } from './screens/StatistikScreen';
import { MultiplayerScreen } from './screens/MultiplayerScreen';
import { LevelSelectScreen } from './screens/LevelSelectScreen';
import { GameplayScreen } from './game/GameplayScreen';
import { BlockPuzzleScreen } from './game/block-puzzle/BlockPuzzleScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { EditAvatarScreen } from './screens/EditAvatarScreen';
import { ChallengeScreen } from './screens/ChallengeScreen';
import { LedgerScreen } from './screens/LedgerScreen';
import { MemoryGame } from './game/minigames/MemoryGame';
import { TripleGame } from './game/minigames/TripleGame';

export const DestinationScreen = () => {
  const { screen, navigate } = useGame();
  const { profile, updateProfile } = useProfile();
  
  // Mark all as read when opening notification screen
  useEffect(() => {
    if (screen === 'pesan' && profile.notifications?.some((n:any)=>!n.read)) {
      updateProfile({notifications:profile.notifications.map((n:any)=>({...n,read:true}))});
    }
  }, [screen, profile.notifications, updateProfile]);

  if (screen === 'home') return null;
  if (screen === 'challenges') return <ChallengeScreen />;
  if (screen === 'ledger') return <LedgerScreen />;
  if (screen === 'memory') return <MemoryGame />;
  if (screen === 'triple') return <TripleGame />;
  
  if (screen === 'profile') return <ProfileScreen />;
  if (screen === 'peti') return <ChestScreen />;
  if (screen === 'toko') return <ShopScreen />;
  if (screen === 'misi') return <MissionScreen />;
  if (screen === 'koleksi') return <CollectionScreen />;
  if (screen === 'tema') return <ThemeScreen />;
  if (screen === 'prestasi') return <AchievementScreen />;
  if (screen === 'statistik') return <StatistikScreen />;
  if (screen === 'multiplayer') return <MultiplayerScreen />;
  if (screen === 'levels') return <LevelSelectScreen />;
  if (screen === 'play') return <GameplayScreen />;
  if (screen === 'block-puzzle') return <BlockPuzzleScreen />;
  if (screen === 'settings') return <SettingsScreen />;
  if (screen === 'edit-avatar') return <EditAvatarScreen />;

  if (screen === 'pesan') {
    return (
      <AnimatePresence>
        <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           exit={{ opacity: 0 }}
           className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-[3px] z-[120] flex flex-col justify-end sm:justify-center p-0 sm:p-5"
        >
          <div className="absolute inset-0" onClick={() => navigate('home')} />
          <motion.div 
            initial={{ y: '100%', scale: 0.95 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: '100%', scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className="relative w-full max-w-lg mx-auto bg-[var(--club-paper)] border-t-2 sm:border-2 border-[var(--club-line)] rounded-t-[26px] sm:rounded-[26px] shadow-[0_-4px_0_var(--club-line)] sm:shadow-[6px_6px_0_var(--club-line)] z-10 flex flex-col max-h-[85vh] p-6 text-[var(--club-ink)]"
          >
             <div className="w-12 h-1.5 bg-[var(--club-muted)]/30 rounded-full mx-auto mb-4 sm:hidden shrink-0" />
             
             <div className="flex items-center justify-between mb-5 shrink-0">
               <div>
                 <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">UPDATE & HADIAH</span>
                 <h2 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight">Notifikasi</h2>
               </div>
               <button 
                 onClick={() => navigate('home')} 
                 className="round-button"
                 aria-label="Tutup notifikasi"
               >
                 <span className="text-base font-bold">✕</span>
               </button>
             </div>
             
             <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 min-h-0">
                {(!profile.notifications || profile.notifications.length === 0) ? (
                   <div className="empty-state py-12">
                     <Bell size={42} className="opacity-40" />
                     <h2>Belum Ada Notifikasi</h2>
                     <p>Pemberitahuan reward dan event akan muncul di sini.</p>
                   </div>
                ) : (
                   profile.notifications.map((n: any) => {
                      const timeStr = Math.floor((Date.now() - n.timestamp) / 60000) + 'm';
                      let icon = Info;
                      let bgClass = "bg-[var(--club-sky)]";
                      
                      if (n.type === 'reward' || n.type === 'chest') {
                         icon = Gift;
                         bgClass = "bg-[var(--club-pink)]";
                      } else if (n.type === 'achievement' || n.type === 'mission') {
                         icon = Check;
                         bgClass = "bg-[var(--club-mint)]";
                      }
                      const IconComponent = icon;
                      
                      return (
                         <div 
                           key={n.id} data-testid={`notification-${n.id}`}
                           className="flex items-start gap-3.5 p-3.5 bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl shadow-[2px_2px_0_var(--club-line)] text-left"
                         >
                           <div className={`w-10 h-10 ${bgClass} border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0 text-[var(--club-ink)] shadow-[1px_1px_0_var(--club-line)]`}>
                             <IconComponent size={20} strokeWidth={2.5} />
                           </div>
                           <div className="flex-1 min-w-0">
                             <div className="flex items-center justify-between gap-2">
                               <b className="text-sm font-bold text-[var(--club-ink)] truncate">{n.title}</b>
                               <span className="text-[10px] text-[var(--club-muted)] font-medium shrink-0">{timeStr} lalu</span>
                             </div>
                             <p className="text-xs text-[var(--club-muted)] mt-0.5 leading-relaxed">{n.message}</p>
                             {['mission','achievement','chest'].includes(n.type)&&<button data-testid={`notification-open-${n.id}`} className="text-button mt-2" onClick={()=>navigate(n.type==='mission'?'misi':n.type==='achievement'?'prestasi':'peti')}>Lihat {n.type==='mission'?'misi':n.type==='achievement'?'pencapaian':'peti'} →</button>}
                           </div>
                         </div>
                      );
                   })
                )}
             </div>
             
             <div className="mt-5 shrink-0 pt-3 border-t border-[var(--club-line)]/15">
               <button 
                 onClick={() => navigate('home')}
                 className="pop-button pink"
               >
                 Tutup Panel
               </button>
             </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return null;
};
