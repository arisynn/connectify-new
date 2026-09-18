import React from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, BarChart2, Star, Target, Zap, Clock } from 'lucide-react';
import { motion } from 'motion/react';
import { useProfile } from '../core/profile/ProfileContext';
import { DynamicIcon } from '../components/theme/DynamicIcon';

const StatCard = ({ title, value, icon: Icon, colorClass = "bg-[var(--club-card)]" }: { title: string, value: string, icon: any, colorClass?: string }) => (
  <div className={`border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex flex-col items-center justify-center text-center ${colorClass} text-[var(--club-ink)]`}>
     <div className="w-10 h-10 bg-white/80 border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center mb-2 shadow-xs">
        <Icon size={20} className="text-[var(--club-ink)]" />
     </div>
     <span className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-none mb-1">{value}</span>
     <span className="font-bold text-[10px] text-[var(--club-muted)] uppercase tracking-wider">{title}</span>
  </div>
);

export const StatistikScreen = () => {
  const { navigate } = useGame();
  const { profile } = useProfile();
  
  const stats = profile?.statistics || {};
  const totalPlay = (stats.totalGames || 0).toLocaleString('id-ID');
  
  const formatNumber = (num: number) => {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };
  
  const highScore = formatNumber(stats.highestScore || 0);
  const highestLevel = (profile?.highestLevel || 1).toString();
  const maxCombo = 'x' + (stats.highestCombo || 0);
  
  const totalPlaySeconds = Math.floor((stats.totalPlayTimeMs || 0) / 1000);
  const hours = Math.floor(totalPlaySeconds / 3600);
  const minutes = Math.floor((totalPlaySeconds % 3600) / 60);
  const playTimeStr = hours > 0 ? `${hours}j ${minutes}m` : `${minutes}m`;

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
            onClick={() => navigate('profile')}
            className="round-button"
            aria-label="Kembali ke profil"
        >
          <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain text-[var(--club-ink)]" />
        </button>
        <div>
          <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">CATATAN PERMAINAN</span>
          <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Statistik</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 grid grid-cols-2 gap-3.5 content-start max-w-lg mx-auto w-full">
         <div className="col-span-2 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-2xl p-5 shadow-[3px_3px_0_var(--club-line)] flex items-center justify-between text-[var(--club-ink)]">
            <div>
               <span className="font-bold text-[10px] uppercase tracking-wider text-[var(--club-muted)] block mb-0.5">Total Permainan</span>
               <span className="font-['Fredoka'] font-semibold text-4xl text-[var(--club-ink)]">{totalPlay}</span>
            </div>
            <div className="w-14 h-14 bg-white/80 border-2 border-[var(--club-line)] rounded-2xl flex items-center justify-center shadow-xs">
              <BarChart2 size={32} className="text-[var(--club-ink)]" />
            </div>
         </div>
         <StatCard title="Skor Tertinggi" value={highScore} icon={Star} colorClass="bg-[var(--club-card)]" />
         <StatCard title="Level Tertinggi" value={highestLevel} icon={Target} colorClass="bg-[var(--club-sky)]" />
         <StatCard title="Max Combo" value={maxCombo} icon={Zap} colorClass="bg-[var(--club-pink)]" />
         <StatCard title="Waktu Main" value={playTimeStr} icon={Clock} colorClass="bg-[var(--club-card)]" />
      </div>
    </motion.div>
  );
};
