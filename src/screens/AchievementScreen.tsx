import React, { useMemo, useState } from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, Trophy, Candy, Check, Lock, Star, Sparkles, Palette, Hammer, Bomb, Search, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { useProfile } from '../core/profile/ProfileContext';
import { useCDE } from '../core/cde';
import { useAudio } from '../core/audio/AudioEngine';
import { KineticButton, ProgressBar, CurrencyPill } from '../designs/KineticComponents';
import { KineticBadge } from '../designs/KineticPopups';
import { ACHIEVEMENTS_DATA, getCurrentTier, getAchievementRewardSummary } from '../core/achievements';
import { EconomyMeter } from '../components/EconomyMeter';

const CATEGORIES = [
  { id: 'all', label: 'Semua' },
  { id: 'progression', label: 'Progres' },
  { id: 'mastery', label: 'Keahlian' },
  { id: 'collection', label: 'Koleksi' },
  { id: 'secret', label: 'Rahasia' },
];

const CATEGORY_COLOR: Record<string, string> = {
  progression: 'bg-[var(--club-sky)]',
  mastery: 'bg-[var(--club-pink)]',
  collection: 'bg-[var(--club-butter)]',
  secret: 'bg-[#e9d5ff]',
};

const REWARD_ICON: Record<string, any> = { hints: Search, shuffles: RefreshCw, hammers: Hammer, bombs: Bomb, theme: Palette };

const RewardChips = ({ tier }: { tier: any }) => (
  <div className="flex flex-wrap gap-1.5 justify-end">
    {getAchievementRewardSummary(tier).map((r: any, i: number) => {
      const Icon = REWARD_ICON[r.type];
      return (
        <div key={i} className="bg-[var(--club-paper)] border border-[var(--club-line)] rounded-xl px-2 py-1 flex items-center gap-1 shadow-xs">
          <span className="font-['Fredoka'] font-semibold text-xs text-[var(--club-ink)]">+{r.type === 'theme' ? r.theme : r.amount}</span>
          {r.type === 'permen'
            ? <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-3.5 h-3.5 object-contain" />
            : Icon ? <Icon size={12} className="text-[var(--club-ink)]" strokeWidth={2.5} /> : null}
        </div>
      );
    })}
  </div>
);

const AchievementCard = ({ ach, profile, onClaim, index }: { ach: any, profile: any, onClaim: () => void, index: number }) => {
  const tierIdx = getCurrentTier(profile, ach.id);
  const maxed = tierIdx >= ach.tiers.length;
  const tier = maxed ? ach.tiers[ach.tiers.length - 1] : ach.tiers[tierIdx];
  const progress = ach.getProgress(profile) || 0;
  const pct = maxed ? 100 : Math.min(100, Math.round((progress / tier.target) * 100));
  const claimable = !maxed && progress >= tier.target;
  const isSecret = ach.category === 'secret' && tierIdx === 0 && progress === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', damping: 20 }}
      data-testid={`achievement-card-${ach.id}`}
      className={`bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex flex-col gap-3 relative overflow-hidden shrink-0 ${maxed ? 'opacity-80' : ''} ${claimable ? 'ring-2 ring-[var(--club-mint)]' : ''}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 ${CATEGORY_COLOR[ach.category] || 'bg-[var(--club-sky)]'} border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center shrink-0 shadow-[2px_2px_0_var(--club-line)] relative`}>
          {isSecret ? <Lock size={20} className="text-[var(--club-ink)]" /> : <Trophy size={22} className="text-[var(--club-ink)]" />}
          {maxed && (
            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[var(--club-butter)] rounded-full border border-[var(--club-line)] flex items-center justify-center shadow-xs">
              <Sparkles size={10} className="text-[var(--club-ink)]" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-['Fredoka'] font-semibold text-[var(--club-ink)] text-base leading-tight">{isSecret ? '???' : ach.title}</h3>
          <p className="font-medium text-xs text-[var(--club-muted)] leading-tight mt-0.5">
            {isSecret ? 'Pencapaian rahasia. Terus bermain untuk membukanya!' : ach.desc(tier.target)}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            {ach.tiers.map((_: any, i: number) => (
              <Star key={i} size={13} className={i < tierIdx ? 'fill-amber-400 text-amber-500' : 'fill-gray-200 text-gray-300'} />
            ))}
            <span className="font-bold text-[10px] text-[var(--club-muted)] uppercase ml-1">Tier {Math.min(tierIdx + 1, ach.tiers.length)}/{ach.tiers.length}</span>
          </div>
        </div>
        {!isSecret && <RewardChips tier={tier} />}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar progress={pct} label={maxed ? 'SELESAI' : `${Math.min(progress, tier.target).toLocaleString('id-ID')} / ${tier.target.toLocaleString('id-ID')}`} />
        </div>
        {maxed ? (
          <div className="w-20 py-1.5 rounded-xl bg-[var(--club-paper)] border border-[var(--club-line)] flex items-center justify-center gap-1 font-bold text-xs text-[var(--club-muted)]">
            <Check size={14} strokeWidth={2.5} /> Selesai
          </div>
        ) : (
          <button 
            onClick={onClaim} 
            disabled={!claimable} 
            className={`pop-button py-1.5 px-3 text-xs font-bold ${claimable ? 'mint' : 'opacity-50 cursor-not-allowed'}`}
          >
            <span data-testid={`achievement-claim-${ach.id}`}>Klaim</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const AchievementScreen = () => {
  const { navigate } = useGame();
  const { profile } = useProfile();
  const cde = useCDE();
  const audio = useAudio();
  const [category, setCategory] = useState('all');
  const [toast, setToast] = useState<string | null>(null);

  const stats = useMemo(() => {
    let claimed = 0, total = 0, claimable = 0;
    ACHIEVEMENTS_DATA.forEach(a => {
      const t = getCurrentTier(profile, a.id);
      claimed += t; total += a.tiers.length;
      if (t < a.tiers.length && a.getProgress(profile) >= a.tiers[t].target) claimable++;
    });
    return { claimed, total, claimable };
  }, [profile]);

  const list = useMemo(() => {
    const filtered = category === 'all' ? ACHIEVEMENTS_DATA : ACHIEVEMENTS_DATA.filter(a => a.category === category);
    return [...filtered].sort((a, b) => {
      const rank = (x: any) => {
        const t = getCurrentTier(profile, x.id);
        if (t >= x.tiers.length) return 2;
        return x.getProgress(profile) >= x.tiers[t].target ? 0 : 1;
      };
      return rank(a) - rank(b);
    });
  }, [category, profile]);

  const handleClaim = async (ach: any) => {
    const tierIdx = getCurrentTier(profile, ach.id);
    const tier = ach.tiers[tierIdx];
    audio.playSfx('uiReward', () => audio.playUiClick());
    try {
      await cde.queueMutation('CLAIM_ACHIEVEMENT_REWARD', { achievementId: ach.id });
      const permen = tier.reward.permen || tier.reward.coins || 0;
      setToast(`${ach.title} Tier ${tierIdx + 1} diklaim! +${permen} Permen`);
    } catch(error:any) { 
      setToast(error.message==='DAILY_INCOME_LIMIT'?'Batas income hari ini tidak cukup. Pencapaian tetap bisa diklaim nanti.':'Pencapaian belum bisa diklaim. Tunggu sinkronisasi.'); 
    }
    setTimeout(() => setToast(null), 2200);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: 20 }} 
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
      className="absolute inset-0 bg-[var(--club-paper)] z-[100] flex flex-col font-sans text-[var(--club-ink)]"
      data-testid="achievement-screen"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 z-10 shrink-0 bg-[var(--club-paper)] border-b-2 border-[var(--club-line)]">
        <div className="flex items-center gap-3">
          <button
              data-testid="achievement-back-button"
              onClick={() => navigate('home')}
              className="round-button"
              aria-label="Kembali ke beranda"
          >
            <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain text-[var(--club-ink)]" />
          </button>
          <div>
            <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">PRESTASI & HADIAH</span>
            <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Pencapaian</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-full px-3 py-1 shadow-[2px_2px_0_var(--club-line)]">
          <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-4 h-4 object-contain" />
          <span className="font-['Fredoka'] font-semibold text-sm text-[var(--club-ink)]">{cde.permen}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 pt-4 shrink-0">
        <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex items-center justify-between">
          <div>
            <span className="font-bold text-[9px] uppercase tracking-wider text-[var(--club-muted)] block mb-0.5">Tier Diraih</span>
            <span className="font-['Fredoka'] font-semibold text-2xl text-[var(--club-ink)] leading-none" data-testid="achievement-summary">{stats.claimed}<span className="text-sm text-[var(--club-muted)]">/{stats.total}</span></span>
          </div>
          <div className="flex-1 mx-4">
            <ProgressBar progress={stats.total ? (stats.claimed / stats.total) * 100 : 0} label="" />
          </div>
          <div className="w-12 h-12 bg-[var(--club-butter)] border-2 border-[var(--club-line)] rounded-xl flex items-center justify-center relative shadow-[2px_2px_0_var(--club-line)] shrink-0">
            <DynamicIcon name="achievement" type="logo" LucideFallback={Trophy} className="w-6 h-6 object-contain text-[var(--club-ink)]" />
            {stats.claimable > 0 && (
              <span data-testid="achievement-claimable-badge" className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#e11d48] rounded-full border border-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs">{stats.claimable}</span>
            )}
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="px-5 pt-3 shrink-0 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 w-max pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              data-testid={`achievement-filter-${c.id}`}
              onClick={() => { audio.playUiClick(); setCategory(c.id); }}
              className={`px-3.5 py-1.5 rounded-full border-2 border-[var(--club-line)] font-bold text-xs transition-all ${category === c.id ? 'bg-[var(--club-butter)] text-[var(--club-ink)] shadow-[2px_2px_0_var(--club-line)] translate-y-[-1px]' : 'bg-[var(--club-card)] text-[var(--club-muted)] hover:text-[var(--club-ink)]'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-3 pb-10">
        <EconomyMeter compact id="achievement-income"/>
        {list.map((a, i) => (
          <AchievementCard key={a.id} index={i} ach={a} profile={profile} onClaim={() => handleClaim(a)} />
        ))}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-6 left-0 right-0 flex justify-center z-[120] pointer-events-none px-4"
          >
            <div data-testid="achievement-toast" className="bg-[var(--club-card)] text-[var(--club-ink)] font-bold text-xs px-5 py-2.5 rounded-full shadow-[3px_3px_0_var(--club-line)] border-2 border-[var(--club-line)] text-center">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
