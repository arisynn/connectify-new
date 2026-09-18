import React, { useState, useEffect, useMemo } from 'react';
import { useGame } from '../GameContext';
import { ArrowLeft, Target, CalendarDays, Check, Clock, Candy, Gift, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { DynamicIcon } from '../components/theme/DynamicIcon';
import { useProfile } from '../core/profile/ProfileContext';
import { useCDE } from '../core/cde';
import { useAudio } from '../core/audio/AudioEngine';
import { KineticButton, ProgressBar, CurrencyPill } from '../designs/KineticComponents';
import { KineticBadge } from '../designs/KineticPopups';
import { checkDailyMissions } from '../core/misiHarian';
import { getTodayKey } from '../core/economy';
import { EconomyMeter } from '../components/EconomyMeter';

const DIFF_COLOR: Record<string, string> = {
  'Mudah': 'bg-[var(--club-mint)] text-[var(--club-ink)]',
  'Menengah': 'bg-[var(--club-butter)] text-[var(--club-ink)]',
  'Sulit': 'bg-[var(--club-sky)] text-[var(--club-ink)]',
  'Sangat Sulit': 'bg-[var(--club-pink)] text-[var(--club-ink)]',
};

const pad = (n: number) => String(n).padStart(2, '0');

const msUntilMidnight = (now: number) => {
  return 86400000 - ((now + 7*3600000) % 86400000);
};

const msUntilNextMonday = (now: number) => {
  const d = new Date(now + 7*3600000);
  const day = d.getUTCDay() || 7;
  return msUntilMidnight(now) + (7-day)*86400000;
};

const formatCountdown = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return days > 0 ? `${days}h ${pad(h)}:${pad(m)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
};

const MissionCard = ({ mission, onClaim, isPersisted, index }: { mission: any, onClaim: () => void, isPersisted: boolean, index: number }) => {
  const progress = Math.min(mission.progress || 0, mission.target);
  const pct = Math.round((progress / mission.target) * 100);
  const isComplete = progress >= mission.target;
  const claimed = !!mission.claimed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, type: 'spring', damping: 20 }}
      data-testid={`mission-card-${mission.id}`}
      className={`bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-4 shadow-[3px_3px_0_var(--club-line)] flex flex-col gap-3 relative overflow-hidden shrink-0 text-[var(--club-ink)] ${claimed ? 'opacity-60 bg-[var(--club-card)]/50' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border border-[var(--club-line)] text-[9px] font-bold uppercase tracking-wider ${DIFF_COLOR[mission.difficulty] || 'bg-[var(--club-butter)] text-[var(--club-ink)]'}`}>
              {mission.difficulty}
            </span>
          </div>
          <h3 className="font-bold text-sm text-[var(--club-ink)] tracking-tight leading-snug">{mission.title}</h3>
          <p className="text-xs text-[var(--club-muted)] mt-0.5 leading-relaxed">{mission.desc}</p>
        </div>
        <div className="shrink-0 bg-[var(--club-paper)] border-2 border-[var(--club-line)] rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-[1px_1px_0_var(--club-line)]">
          <span className="font-bold text-xs text-[var(--club-ink)]">+{mission.rewardAmount}</span>
          <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-4 h-4 object-contain" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1 border-t border-[var(--club-line)]/10">
        <div className="flex-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--club-muted)] mb-1">
            <span>Progres</span>
            <span>{progress.toLocaleString('id-ID')} / {mission.target.toLocaleString('id-ID')}</span>
          </div>
          <div className="w-full h-2.5 bg-white border-1.5 border-[var(--club-line)] rounded-full overflow-hidden p-0.5">
            <div className="h-full bg-[#46b995] rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
          </div>
        </div>
        {claimed ? (
          <div className="w-24 py-1.5 rounded-xl bg-[var(--club-paper)] border-1.5 border-[var(--club-line)] flex items-center justify-center gap-1 font-bold text-xs text-[var(--club-muted)]">
            <Check size={14} strokeWidth={2.5} /> Selesai
          </div>
        ) : (
          <button
            onClick={onClaim}
            disabled={!isComplete || !isPersisted}
            className={`w-24 py-1.5 px-2 rounded-xl border-2 border-[var(--club-line)] text-xs font-bold transition-transform shadow-[2px_2px_0_var(--club-line)] ${isComplete && isPersisted ? 'bg-[var(--club-mint)] active:translate-y-0.5 active:shadow-[0px_0px_0_var(--club-line)] cursor-pointer text-[var(--club-ink)]' : 'bg-gray-100 opacity-50 cursor-not-allowed text-gray-400'}`}
          >
            <span data-testid={`mission-claim-${mission.id}`}>Klaim</span>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export const MissionScreen = () => {
  const { navigate } = useGame();
  const { profile } = useProfile();
  const cde = useCDE();
  const audio = useAudio();
  const [tab, setTab] = useState<'harian' | 'mingguan' | 'tersimpan'>('harian');
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Missions live on the server profile; before the first win they are only previewed locally.
  const { daily, weekly, saved, dailyPersisted, weeklyPersisted } = useMemo(() => {
    const generated = checkDailyMissions(profile);
    const dailyPersisted = !!(profile.activeMissions && profile.activeMissions.length > 0 && profile.dailyMissionsDate === getTodayKey());
    const weeklyPersisted = !!(profile.activeWeeklyMissions && profile.activeWeeklyMissions.length > 0 && generated.weeklyMissionsWeek === profile.weeklyMissionsWeek);
    return { daily: generated.activeMissions || [], weekly: generated.activeWeeklyMissions || [], saved: (generated.pendingMissions||[]).filter((m:any)=>!m.claimed), dailyPersisted, weeklyPersisted };
  }, [profile, getTodayKey(now)]);

  const list = tab === 'harian' ? daily : tab === 'mingguan' ? weekly : saved;
  const persisted = tab === 'harian' ? dailyPersisted : tab === 'mingguan' ? weeklyPersisted : true;
  const claimableCount = list.filter((m: any) => !m.claimed && (m.progress || 0) >= m.target).length;
  const completedCount = list.filter((m: any) => m.claimed).length;

  const handleClaim = async (mission: any) => {
    try {
    audio.playSfx('uiReward', () => audio.playUiClick());
    await cde.queueMutation('CLAIM_MISSION_REWARD', { missionId: mission.id });
    setToast(`+${mission.rewardAmount} Permen dari '${mission.title}'`);
    } catch (error:any) {
      setToast(error.message==='DAILY_INCOME_LIMIT'?'Batas income hari ini tidak cukup. Hadiah tetap tersimpan untuk nanti.':'Hadiah belum dapat diklaim. Coba lagi setelah sinkronisasi.');
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
      data-testid="mission-screen"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 px-5 py-3.5 z-10 shrink-0 bg-[var(--club-paper)] border-b-2 border-[var(--club-line)]">
        <div className="flex items-center gap-3">
          <button
              data-testid="mission-back-button"
              onClick={() => navigate('home')}
              className="round-button"
              aria-label="Kembali ke lobby"
          >
            <DynamicIcon name="back" type="logo" LucideFallback={ArrowLeft} className="w-5 h-5 object-contain" />
          </button>
          <div>
            <span className="text-[9px] font-bold tracking-[1.2px] text-[var(--club-muted)] uppercase block">TANTANGAN</span>
            <h2 className="font-['Fredoka'] font-semibold text-xl text-[var(--club-ink)] leading-tight">Misi Harian</h2>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-full shadow-[2px_2px_0_var(--club-line)]">
          <DynamicIcon name="permen" type="logo" LucideFallback={Candy} className="w-4 h-4 object-contain" />
          <span className="font-bold text-xs text-[var(--club-ink)]">{cde.permen}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4 shrink-0">
        <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl p-1 flex gap-1 shadow-[2px_2px_0_var(--club-line)]">
          {([
            { id: 'harian', label: 'Harian', icon: Target, count: daily.filter((m: any) => !m.claimed && (m.progress || 0) >= m.target).length },
            { id: 'mingguan', label: 'Mingguan', icon: CalendarDays, count: weekly.filter((m: any) => !m.claimed && (m.progress || 0) >= m.target).length },
            { id: 'tersimpan', label: 'Tersimpan', icon: Gift, count: saved.length },
          ] as const).map(t => (
            <button
              key={t.id}
              data-testid={`mission-tab-${t.id}`}
              onClick={() => { audio.playUiClick(); setTab(t.id); }}
              className={`flex-1 py-2 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${tab === t.id ? 'bg-[var(--club-butter)] border-1.5 border-[var(--club-line)] text-[var(--club-ink)] shadow-[1px_1px_0_var(--club-line)]' : 'border border-transparent text-[var(--club-muted)] hover:text-[var(--club-ink)]'}`}
            >
              <t.icon size={15} strokeWidth={2.5} /> {t.label}
              {t.count > 0 && <span className="w-4 h-4 rounded-full bg-[#ef4444] text-white text-[9px] font-bold flex items-center justify-center">{t.count}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 pt-3 shrink-0">
        <div className="bg-[var(--club-card)] border-2 border-[var(--club-line)] rounded-2xl px-5 py-3 shadow-[3px_3px_0_var(--club-line)] flex items-center justify-between text-[var(--club-ink)]">
          <div>
            <span className="font-bold text-[9px] uppercase tracking-wider text-[var(--club-muted)] block">Progres {tab === 'harian' ? 'Hari Ini' : 'Minggu Ini'}</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="font-['Fredoka'] font-semibold text-2xl leading-none text-[var(--club-ink)]" data-testid="mission-summary-count">{completedCount}/{list.length}</span>
              <span className="font-medium text-xs text-[var(--club-muted)]">selesai</span>
            </div>
          </div>
          <div className="text-right">
            <span className="font-bold text-[9px] uppercase tracking-wider text-[var(--club-muted)] flex items-center justify-end gap-1"><Clock size={11} /> Reset Dalam</span>
            <span className="font-bold text-sm leading-none tabular-nums text-[var(--club-ink)] mt-1 block" data-testid="mission-reset-timer">
              {formatCountdown(tab === 'harian' ? msUntilMidnight(now) : msUntilNextMonday(now))}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 pb-10">
        <EconomyMeter compact id="mission-income"/>
        {tab==='tersimpan'&&<p data-testid="saved-missions-info" className="text-xs text-[var(--club-muted)]">Hadiah misi yang selesai tetapi belum diklaim tetap aman di sini setelah reset.</p>}
        {!persisted && (
          <div className="bg-[var(--club-card)] border-2 border-dashed border-[var(--club-line)] rounded-xl px-4 py-2.5 flex items-center gap-2 text-[var(--club-muted)] shrink-0">
            <Lock size={14} />
            <span className="font-medium text-xs">Mainkan 1 level untuk mengaktifkan progres misi {tab === 'harian' ? 'harian' : 'mingguan'}.</span>
          </div>
        )}
        {list.map((m: any, i: number) => (
          <MissionCard key={m.id} index={i} mission={m} isPersisted={persisted} onClaim={() => handleClaim(m)} />
        ))}
        {claimableCount === 0 && completedCount === list.length && list.length > 0 && (
          <div className="flex flex-col items-center py-6 text-[var(--club-muted)] shrink-0">
            <Gift size={36} className="mb-2 text-[#e11d48]" />
            <p className="font-bold text-sm">Semua misi selesai!</p>
            <p className="text-xs text-[var(--club-muted)]">Kembali lagi setelah reset.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-8 left-0 right-0 flex justify-center z-[120] pointer-events-none px-4"
          >
            <div data-testid="mission-toast" className="bg-[var(--club-card)] text-[var(--club-ink)] font-bold text-xs px-5 py-2.5 rounded-full shadow-[4px_4px_0_var(--club-line)] border-2 border-[var(--club-line)] text-center">
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
