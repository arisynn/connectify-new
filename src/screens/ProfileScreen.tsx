import React, { useState, useEffect } from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, User, Trophy, BarChart2, Edit3, UserRound, Candy, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { KineticButton, ProfileComponent, ProgressBar } from '../designs/KineticComponents';
import { useProfile } from '../core/profile/ProfileContext';
import { ACHIEVEMENTS_DATA, getCurrentTier } from '../core/achievements';
import { KineticBottomSheet, KineticModal } from '../designs/KineticPopups';


import { useCDE } from '../core/cde';
import { DynamicIcon } from '../components/theme/DynamicIcon';


export const ProfileScreen = () => {
  const { navigate, user } = useGame();
  const { profile, updateProfile } = useProfile();
  const cde = useCDE();
  
  let completedAchievements = 0;
  ACHIEVEMENTS_DATA.forEach(a => {
      const tierIdx = getCurrentTier(profile, a.id);
      completedAchievements += tierIdx;
  });
  const [showAvatarEdit, setShowAvatarEdit] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);

  const handleEditAvatarClick = () => {
     navigate('edit-avatar');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-[var(--club-paper)] z-[100] flex flex-col font-sans text-[var(--club-ink)]"
    >
      <div className="flex items-center gap-3 px-5 py-3.5 z-10 shrink-0 bg-[var(--club-paper)] border-b-2 border-[var(--club-line)]">
        <button 
           onClick={() => navigate('home')} 
           className="round-button"
           aria-label="Kembali ke lobby"
        >
          <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain" />
        </button>
        <div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">AKUN</span>
          <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Profil Pemain</h2>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col p-5 overflow-y-auto max-w-xl mx-auto w-full">
         <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-[26px] p-6 shadow-[4px_4px_0_var(--club-line)] mb-5 flex flex-col items-center">
            
            <div className="relative mb-3">
               <ProfileComponent avatarStr={profile?.activeAvatarId || profile?.avatar} avatarBg={profile?.activeAvatarBackground} seed={cde.account?.username || user.name} className="!w-24 !h-24 border-2 border-[var(--club-line)] rounded-full shadow-[2px_2px_0_var(--club-line)]" />
               <button 
                 onClick={handleEditAvatarClick}
                 className="absolute bottom-0 -right-1 bg-[var(--club-butter)] w-9 h-9 rounded-full border-2 border-[var(--club-line)] flex items-center justify-center shadow-[1px_1px_0_var(--club-line)] active:scale-95 transition-transform"
                 aria-label="Edit avatar"
               >
                 <Edit3 size={16} className="text-[var(--club-ink)]" strokeWidth={2.5} />
               </button>
            </div>
            
            <h3 className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-tight mb-1">{cde.account?.username || user.name}</h3>
            <span className="inline-flex items-center px-3 py-0.5 rounded-full border border-[var(--club-line)] bg-[var(--club-paper)] text-[10px] font-bold uppercase tracking-wider text-[var(--club-muted)] mb-5">Pemain Reguler</span>
            
            <div className="w-full">
               <div className="flex justify-between items-center mb-1.5 text-xs font-bold">
                  <span className="text-[var(--club-ink)]">Level {Math.floor((profile.highestLevel || 1) / 5) + 1}</span>
                  <span className="text-[#e11d48]">{((profile.highestLevel || 1) % 5) * 200} / 1000 EXP</span>
               </div>
               <div className="w-full h-3 bg-white border-1.5 border-[var(--club-line)] rounded-full overflow-hidden p-0.5">
                 <div className="h-full bg-[#46b995] rounded-full transition-all duration-300" style={{ width: `${((profile.highestLevel || 1) % 5) * 20}%` }} />
               </div>
            </div>
         </div>
         
         <div className="grid grid-cols-2 gap-3.5 mb-5">
            <motion.button 
              whileTap={{ scale: 0.96 }} 
              data-testid="profile-achievements-button" 
              onClick={() => navigate('prestasi')} 
              className="bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl p-4 flex flex-col items-center shadow-[3px_3px_0_var(--club-line)] active:shadow-[1px_1px_0_var(--club-line)] active:translate-y-0.5 transition-all text-[var(--club-ink)] cursor-pointer"
            >
               <Trophy size={28} className="text-[#d97706] mb-1.5" />
               <span className="font-['Fredoka'] font-semibold text-2xl leading-none">{completedAchievements}</span>
               <span className="font-bold text-[10px] uppercase text-[var(--club-muted)] tracking-wider mt-1">Pencapaian</span>
            </motion.button>
            <motion.button 
              whileTap={{ scale: 0.96 }} 
              data-testid="profile-statistics-button" 
              onClick={() => navigate('statistik')} 
              className="bg-[var(--club-sky)] border-2 border-[var(--club-line)] rounded-2xl p-4 flex flex-col items-center shadow-[3px_3px_0_var(--club-line)] active:shadow-[1px_1px_0_var(--club-line)] active:translate-y-0.5 transition-all text-[var(--club-ink)] cursor-pointer"
            >
               <BarChart2 size={28} className="text-[#0284c7] mb-1.5" />
               <span className="font-['Fredoka'] font-semibold text-2xl leading-none">{profile.winStreak || 0}</span>
               <span className="font-bold text-[10px] uppercase text-[var(--club-muted)] tracking-wider mt-1">Win Streak</span>
            </motion.button>
         </div>

         <div className="grid grid-cols-3 gap-2.5">
            {[
              { label: 'Total Main', value: profile?.statistics?.totalGames || 0 },
              { label: 'Skor Terbaik', value: profile?.statistics?.highestScore || 0 },
              { label: 'Peti Dibuka', value: profile?.statistics?.totalChestsOpened || 0 },
            ].map(s => (
              <div key={s.label} className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-3 flex flex-col items-center shadow-[2px_2px_0_var(--club-line)] text-[var(--club-ink)]">
                 <span className="font-['Fredoka'] font-semibold text-xl leading-none">{Number(s.value).toLocaleString('id-ID')}</span>
                 <span className="font-bold text-[9px] uppercase text-[var(--club-muted)] tracking-wider mt-1.5 text-center">{s.label}</span>
              </div>
            ))}
         </div>
      </div>

      
      


    </motion.div>
  );
};
